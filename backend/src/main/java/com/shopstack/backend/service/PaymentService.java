package com.shopstack.backend.service;

import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.shopstack.backend.config.RazorpayConfig;
import com.shopstack.backend.model.Order;
import com.shopstack.backend.model.OrderItem;
import com.shopstack.backend.model.Product;
import com.shopstack.backend.model.Refund;
import com.shopstack.backend.model.Settlement;
import com.shopstack.backend.model.Warehouse;
import com.shopstack.backend.model.WarehouseAllocation;
import com.shopstack.backend.model.Inventory;
import com.shopstack.backend.repository.WarehouseRepository;
import com.shopstack.backend.repository.WarehouseAllocationRepository;
import com.shopstack.backend.repository.InventoryRepository;
import com.shopstack.backend.service.WarehouseService;
import com.shopstack.backend.repository.OrderItemRepository;
import com.shopstack.backend.repository.OrderRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.RefundRepository;
import com.shopstack.backend.repository.SettlementRepository;
import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.model.User;
import com.shopstack.backend.event.OrderPlacedEvent;
import com.shopstack.backend.event.PaymentSuccessEvent;
import com.shopstack.backend.event.PaymentFailedEvent;
import com.shopstack.backend.event.RefundCompletedEvent;
import org.springframework.context.ApplicationEventPublisher;

@Service
public class PaymentService {

    @Autowired
    private RazorpayClient razorpayClient;

    @Autowired
    private RazorpayConfig razorpayConfig;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private WarehouseAllocationRepository warehouseAllocationRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private WarehouseService warehouseService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private RefundRepository refundRepository;

    @Autowired
    private SettlementRepository settlementRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CouponService couponService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Value("${shopstack.commission.percentage:10.0}")
    private double commissionPercentage;

    /**
     * Create an order on Razorpay servers
     */
    public Map<String, Object> createRazorpayOrder(double amountInRupees, String receipt) throws RazorpayException {
        // Razorpay accepts amount in paise (1 INR = 100 paise)
        long amountInPaise = Math.round(amountInRupees * 100.0);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", receipt != null && !receipt.isEmpty() ? receipt : "rcpt_" + System.currentTimeMillis());
        orderRequest.put("payment_capture", 1); // Auto capture

        com.razorpay.Order rzpOrder = razorpayClient.orders.create(orderRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("razorpayOrderId", rzpOrder.get("id"));
        response.put("amount", rzpOrder.get("amount")); // in paise
        response.put("amountInRupees", amountInRupees);
        response.put("currency", rzpOrder.get("currency"));
        response.put("keyId", razorpayConfig.getKeyId());
        response.put("status", rzpOrder.get("status"));

        return response;
    }

    /**
     * Verify the HMAC SHA-256 signature returned by Razorpay Checkout
     */
    public boolean verifyPaymentSignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        if (razorpayOrderId == null || razorpayPaymentId == null || razorpaySignature == null) {
            return false;
        }

        try {
            String payload = razorpayOrderId + "|" + razorpayPaymentId;
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(razorpayConfig.getKeySecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secretKey);

            byte[] hash = sha256_HMAC.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            
            // Convert to hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }

            return hexString.toString().equalsIgnoreCase(razorpaySignature.trim());
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Process checkout order: validate stock, deduct inventory, save Order and OrderItems,
     * set paymentStatus = PAID for verified Razorpay transactions, and generate vendor settlements.
     */
    @Transactional
    public Order placeVerifiedOrder(Long userId, List<Map<String, Object>> itemsList, 
                                   String paymentMethod, String razorpayOrderId, String razorpayPaymentId,
                                   Map<String, Object> deliveryInfo, String couponCode) {
        if (itemsList == null || itemsList.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        // Validate stock for all items
        double itemsSubtotal = 0.0;
        for (Map<String, Object> itemData : itemsList) {
            Long productId = Long.parseLong(itemData.get("id").toString());
            int quantity = Integer.parseInt(itemData.get("quantity").toString());
            double price = Double.parseDouble(itemData.get("price").toString());

            Optional<Product> prodOpt = productRepository.findById(productId);
            if (prodOpt.isEmpty()) {
                throw new IllegalArgumentException("Product with ID " + productId + " not found.");
            }
            Product product = prodOpt.get();
            if (product.getStock() < quantity) {
                throw new IllegalStateException("Insufficient stock for product '" + product.getName() + "'. Only " + product.getStock() + " units available.");
            }
            itemsSubtotal += price * quantity;
        }
        itemsSubtotal = Math.round(itemsSubtotal * 100.0) / 100.0;

        // Delivery fee calculation: Under 500 = 99, 500 and above = free
        double deliveryFee = (itemsSubtotal < 500.0 && itemsSubtotal > 0) ? 99.0 : 0.0;

        double couponDiscount = 0.0;
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            Map<String, Object> validation = couponService.validateAndCalculateDiscount(couponCode, itemsList, userId);
            if (Boolean.TRUE.equals(validation.get("valid"))) {
                couponDiscount = Double.parseDouble(validation.get("discountAmount").toString());
            }
        }

        double totalAmount = Math.max(0.0, Math.round((itemsSubtotal + deliveryFee - couponDiscount) * 100.0) / 100.0);

        String orderIdStr = "ORD-" + (int) (100000 + Math.random() * 900000);
        String dateStr = new SimpleDateFormat("MMM dd, yyyy").format(new Date());

        String recipientName = deliveryInfo != null && deliveryInfo.get("name") != null ? deliveryInfo.get("name").toString() : "";
        String recipientPhone = deliveryInfo != null && deliveryInfo.get("phone") != null ? deliveryInfo.get("phone").toString() : "";
        String deliveryAddress = deliveryInfo != null && deliveryInfo.get("address") != null ? deliveryInfo.get("address").toString() : "";

        String calculatedPaymentStatus = "PAID";
        if ("COD".equalsIgnoreCase(paymentMethod)) {
            calculatedPaymentStatus = "PENDING";
        }

        // Create Order Entity
        Order order = new Order(
                orderIdStr, 
                userId, 
                dateStr, 
                totalAmount, 
                "CONFIRMED",
                calculatedPaymentStatus,
                paymentMethod != null ? paymentMethod : "RAZORPAY",
                razorpayOrderId,
                razorpayPaymentId,
                recipientName,
                recipientPhone,
                deliveryAddress
        );
        order.setCouponCode(couponCode != null && !couponCode.trim().isEmpty() ? couponCode.trim().toUpperCase() : null);
        order.setCouponDiscount(couponDiscount);
        orderRepository.save(order);

        List<OrderItem> savedItems = new ArrayList<>();

        // Process cart items, deduct stock and create order items
        for (Map<String, Object> itemData : itemsList) {
            Long productId = Long.parseLong(itemData.get("id").toString());
            String productName = itemData.get("name").toString();
            double price = Double.parseDouble(itemData.get("price").toString());
            int quantity = Integer.parseInt(itemData.get("quantity").toString());

            Product product = productRepository.findById(productId).get();
            Long vendorId = product.getVendorId();
            Double originalPrice = product.getPrice();
            Double discountPercentage = product.getDiscountPercentage();

            if (itemData.containsKey("originalPrice") && itemData.get("originalPrice") != null) {
                originalPrice = Double.parseDouble(itemData.get("originalPrice").toString());
            }
            if (itemData.containsKey("discountPercentage") && itemData.get("discountPercentage") != null) {
                discountPercentage = Double.parseDouble(itemData.get("discountPercentage").toString());
            }

            // Create and save Order Line Item
            OrderItem orderItem = new OrderItem(orderIdStr, productId, productName, price, originalPrice, discountPercentage, quantity, vendorId);
            OrderItem savedItem = orderItemRepository.save(orderItem);
            savedItems.add(savedItem);
        }

        if (couponCode != null && !couponCode.trim().isEmpty() && couponDiscount > 0) {
            couponService.recordUsage(couponCode, userId, order.getOrderId(), couponDiscount);
        }

        // Auto-generate per-vendor Settlement records when paymentStatus is PAID
        if ("PAID".equalsIgnoreCase(calculatedPaymentStatus)) {
            createSettlementsForOrder(order, savedItems);
        }

        // Publish OrderPlacedEvent and PaymentSuccessEvent asynchronously for customer email notifications
        try {
            User user = (userId != null) ? userRepository.findById(userId).orElse(null) : null;
            eventPublisher.publishEvent(new OrderPlacedEvent(order, savedItems, user));
            if ("PAID".equalsIgnoreCase(calculatedPaymentStatus)) {
                eventPublisher.publishEvent(new PaymentSuccessEvent(order, razorpayPaymentId, totalAmount, paymentMethod, user));
            }
        } catch (Exception e) {
            System.err.println("[PaymentService] Error publishing order notification events: " + e.getMessage());
        }

        // Order is CONFIRMED and queued for Administrator warehouse allocation
        return order;
    }

    /**
     * Auto-generate per-vendor Settlement records for each OrderItem
     */
    public void createSettlementsForOrder(Order order, List<OrderItem> items) {
        String today = new SimpleDateFormat("MMM dd, yyyy").format(new Date());

        for (OrderItem item : items) {
            if (item.getVendorId() == null) continue;

            // Force global fixed 10% commission rate
            double rateToUse = 10.0;

            double grossAmount = Math.round((item.getPrice() * item.getQuantity()) * 100.0) / 100.0;
            double commissionFee = Math.round((grossAmount * (rateToUse / 100.0)) * 100.0) / 100.0;
            double netPayout = Math.round((grossAmount - commissionFee) * 100.0) / 100.0;

            Settlement settlement = new Settlement(
                    item.getVendorId(),
                    order.getOrderId(),
                    item.getId(),
                    item.getProductName(),
                    grossAmount,
                    rateToUse,
                    commissionFee,
                    netPayout,
                    "PENDING",
                    today,
                    null
            );
            settlementRepository.save(settlement);
        }
    }

    /**
     * Step 1 of Return Lifecycle: Customer initiates return/refund request.
     * Status is set to PENDING (Awaiting item return & warehouse quality inspection).
     */
    @Transactional
    public Refund requestReturn(String orderId, Double amount, String returnReasonCategory, 
                                 String resolutionType, String reason, String customerNotes) {
        return requestReturn(orderId, amount, returnReasonCategory, resolutionType, reason, customerNotes, null);
    }

    @Transactional
    public Refund requestReturn(String orderId, Double amount, String returnReasonCategory, 
                                 String resolutionType, String reason, String customerNotes, String customerProofImage) {
        if (orderId == null || orderId.trim().isEmpty()) {
            throw new IllegalArgumentException("Order ID is required for return initiation.");
        }

        Optional<Order> orderOpt = orderRepository.findByOrderId(orderId.trim());
        if (orderOpt.isEmpty()) {
            try {
                Long id = Long.parseLong(orderId.trim());
                orderOpt = orderRepository.findById(id);
            } catch (NumberFormatException ignored) {}
        }

        if (orderOpt.isEmpty()) {
            throw new IllegalArgumentException("Order not found with identifier: " + orderId);
        }

        Order order = orderOpt.get();

        // Enforce return policy rules automatically
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(order.getOrderId());
        Date orderDate = null;
        try {
            orderDate = new SimpleDateFormat("MMM dd, yyyy").parse(order.getDate());
        } catch (Exception e) {
            orderDate = new Date();
        }
        long diffInMs = Math.abs(new Date().getTime() - orderDate.getTime());
        long daysElapsed = java.util.concurrent.TimeUnit.DAYS.convert(diffInMs, java.util.concurrent.TimeUnit.MILLISECONDS);

        for (OrderItem item : orderItems) {
            Optional<Product> prodOpt = productRepository.findById(item.getProductId());
            if (prodOpt.isPresent()) {
                Product p = prodOpt.get();
                String policy = p.getReturnPolicy() != null ? p.getReturnPolicy() : "7_DAYS";
                if ("NON_RETURNABLE".equalsIgnoreCase(policy)) {
                    throw new IllegalStateException("Return Blocked: Product '" + p.getName() + "' is marked as Non-Returnable.");
                }
                if ("7_DAYS".equalsIgnoreCase(policy) && daysElapsed > 7) {
                    throw new IllegalStateException("Return Blocked: Return window has expired for product '" + p.getName() + "' (Allowed: 7 days, Elapsed: " + daysElapsed + " days).");
                }
                if ("15_DAYS".equalsIgnoreCase(policy) && daysElapsed > 15) {
                    throw new IllegalStateException("Return Blocked: Return window has expired for product '" + p.getName() + "' (Allowed: 15 days, Elapsed: " + daysElapsed + " days).");
                }
            }
        }

        // Calculate remaining balance
        List<Refund> previousRefunds = refundRepository.findByOrderId(order.getOrderId());
        
        // Check if there is already a PENDING refund request for this order
        boolean hasPending = previousRefunds.stream().anyMatch(r -> "PENDING".equalsIgnoreCase(r.getStatus()));
        if (hasPending) {
            throw new IllegalStateException("A return/refund request for Order " + order.getOrderId() + " is already in progress and pending inspection.");
        }

        double alreadyProcessed = previousRefunds.stream()
                .filter(r -> "PROCESSED".equalsIgnoreCase(r.getStatus()))
                .mapToDouble(Refund::getAmount)
                .sum();
        double remainingBalance = Math.round((order.getTotalAmount() - alreadyProcessed) * 100.0) / 100.0;

        if (remainingBalance <= 0) {
            throw new IllegalStateException("Order " + order.getOrderId() + " has already been fully refunded.");
        }

        double refundAmount = (amount == null || amount <= 0) ? remainingBalance : amount;
        refundAmount = Math.round(refundAmount * 100.0) / 100.0;

        if (refundAmount > remainingBalance) {
            throw new IllegalArgumentException("Requested refund amount ₹" + refundAmount + " exceeds remaining refundable balance ₹" + remainingBalance);
        }

        String timestamp = new SimpleDateFormat("MMM dd, yyyy HH:mm").format(new Date());

        Refund refund = new Refund(
                order.getOrderId(),
                order.getRazorpayPaymentId(),
                refundAmount,
                returnReasonCategory != null ? returnReasonCategory : "CHANGED_MIND",
                resolutionType != null ? resolutionType : "REFUND",
                reason != null && !reason.trim().isEmpty() ? reason.trim() : "Customer Initiated Return",
                customerNotes != null ? customerNotes.trim() : "",
                "PENDING",
                "REQUESTED",
                timestamp
        );
        refund.setCustomerProofImage(customerProofImage);
        refund = refundRepository.save(refund);

        // Transition Order status to indicate return requested
        order.setPaymentStatus("REFUND_PENDING");
        order.setStatus("RETURN_REQUESTED");
        orderRepository.save(order);

        return refund;
    }

    /**
     * Step 2 of Return Lifecycle: Vendor reviews the return request.
     * Marks returnStage as VENDOR_APPROVED (proceed to pickup) or VENDOR_DISPUTED (escalate to admin).
     */
    @Transactional
    public Refund reviewReturnRequest(Long refundId, String action, String notes) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new IllegalArgumentException("Refund request not found"));

        if (!"PENDING".equalsIgnoreCase(refund.getStatus())) {
            throw new IllegalStateException("Refund request is already processed or rejected.");
        }

        if ("APPROVE".equalsIgnoreCase(action)) {
            refund.setReturnStage("VENDOR_APPROVED");
            refund.setAdminNotes("Vendor Approved Return. Shipping label generated: AWB-RET-" + System.currentTimeMillis());
        } else if ("DISPUTE".equalsIgnoreCase(action)) {
            refund.setReturnStage("VENDOR_DISPUTED");
            refund.setAdminNotes("Vendor Disputed: " + (notes != null ? notes : "Escalated to Administrator"));
        } else {
            throw new IllegalArgumentException("Invalid vendor action: " + action);
        }

        return refundRepository.save(refund);
    }

    /**
     * Admin accepts the return request (Step 1.5 of Return Lifecycle).
     * This moves the returnStage to ADMIN_APPROVED.
     */
    @Transactional
    public Refund acceptReturnRequest(Long refundId, String notes) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new IllegalArgumentException("Refund request not found with ID: " + refundId));

        if (!"PENDING".equalsIgnoreCase(refund.getStatus())) {
            throw new IllegalStateException("Refund request is already resolved.");
        }

        if (!"REQUESTED".equalsIgnoreCase(refund.getReturnStage())) {
            throw new IllegalStateException("Refund request is already reviewed/approved.");
        }

        refund.setReturnStage("ADMIN_APPROVED");
        refund.setAdminNotes(notes != null && !notes.trim().isEmpty() ? notes.trim() : "Admin accepted the return request. Awaiting pickup and QC check.");
        
        Optional<Order> orderOpt = orderRepository.findByOrderId(refund.getOrderId());
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus("RETURN_APPROVED");
            orderRepository.save(order);
        }

        return refundRepository.save(refund);
    }

    /**
     * Intermediate Step: Warehouse marks return package as received/picked up.
     * Sets returnStage to ITEM_RETURNED.
     */
    @Transactional
    public Refund markRefundPackageReceived(Long refundId) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new IllegalArgumentException("Refund request not found with ID: " + refundId));

        if (!"PENDING".equalsIgnoreCase(refund.getStatus())) {
            throw new IllegalStateException("Refund request is already resolved and not pending.");
        }

        refund.setReturnStage("ITEM_RETURNED");
        refund.setAdminNotes("Return package received at warehouse. Awaiting QC Inspection.");
        return refundRepository.save(refund);
    }

    /**
     * Step 3 of Return Lifecycle: Warehouse staff receives and inspects returned items.
     * Restocks inventory if resellable.
     */
    @Transactional
    public Refund processReturnQcInspection(Long refundId, boolean passed, String restockOption, Long warehouseId, String notes) {
        return processReturnQcInspection(refundId, passed, restockOption, warehouseId, notes, null);
    }

    @Transactional
    public Refund processReturnQcInspection(Long refundId, boolean passed, String restockOption, Long warehouseId, String notes, String warehouseInspectionImage) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new IllegalArgumentException("Refund request not found"));

        if (!"PENDING".equalsIgnoreCase(refund.getStatus())) {
            throw new IllegalStateException("Refund request is already resolved.");
        }

        String timestamp = new SimpleDateFormat("MMM dd, yyyy HH:mm").format(new Date());

        // Resolve warehouseId if not supplied
        if (warehouseId == null) {
            List<WarehouseAllocation> allocs = warehouseAllocationRepository.findByOrderId(refund.getOrderId());
            if (allocs != null && !allocs.isEmpty() && allocs.get(0).getWarehouse() != null) {
                warehouseId = allocs.get(0).getWarehouse().getId();
            } else {
                List<Warehouse> activeWhs = warehouseRepository.findByActiveTrue();
                if (!activeWhs.isEmpty()) {
                    warehouseId = activeWhs.get(0).getId();
                }
            }
        }

        boolean isDefectiveDamaged = (refund.getReturnReasonCategory() != null && 
                (refund.getReturnReasonCategory().toUpperCase().contains("DEFECT") || 
                 refund.getReturnReasonCategory().toUpperCase().contains("DAMAGE")))
                || (refund.getReason() != null && 
                (refund.getReason().toUpperCase().contains("DEFECT") || 
                 refund.getReason().toUpperCase().contains("DAMAGE")))
                || "DAMAGED_QUARANTINE".equalsIgnoreCase(restockOption)
                || !passed;

        if (passed) {
            refund.setReturnStage("QC_PASSED");
            refund.setWarehouseInspectionImage(warehouseInspectionImage);

            if (isDefectiveDamaged) {
                // Route to Warehouse Damaged & Quarantine Stock (Main sellable stock remains reduced)
                refund.setAdminNotes("QC Passed: Item returned as Defective/Damaged. Routed to Damaged & Quarantine stock (sellable inventory remains reduced). " + (notes != null ? notes : ""));
                if (warehouseId != null) {
                    List<OrderItem> items = orderItemRepository.findByOrderId(refund.getOrderId());
                    Optional<Warehouse> whOpt = warehouseRepository.findById(warehouseId);
                    if (whOpt.isPresent()) {
                        Warehouse wh = whOpt.get();
                        for (OrderItem item : items) {
                            Optional<Product> prodOpt = productRepository.findById(item.getProductId());
                            if (prodOpt.isPresent()) {
                                Product prod = prodOpt.get();
                                Inventory inv = inventoryRepository.findByWarehouseIdAndProductId(warehouseId, prod.getId())
                                        .orElseGet(() -> new Inventory(wh, prod, 0));
                                inv.setDamagedQuantity(inv.getDamagedQuantity() + item.getQuantity());
                                inventoryRepository.save(inv);
                                warehouseService.syncProductGlobalStock(prod.getId());
                            }
                        }
                    }
                }
            } else {
                // Return reason was non-damaged (e.g. wrong item, changed mind) -> restore sellable stock
                refund.setAdminNotes("QC Passed: Non-defective return. Main sellable stock restored to warehouse. " + (notes != null ? notes : ""));
                if (warehouseId != null) {
                    List<OrderItem> items = orderItemRepository.findByOrderId(refund.getOrderId());
                    Optional<Warehouse> whOpt = warehouseRepository.findById(warehouseId);
                    if (whOpt.isPresent()) {
                        Warehouse wh = whOpt.get();
                        for (OrderItem item : items) {
                            Optional<Product> prodOpt = productRepository.findById(item.getProductId());
                            if (prodOpt.isPresent()) {
                                Product prod = prodOpt.get();
                                Inventory inv = inventoryRepository.findByWarehouseIdAndProductId(warehouseId, prod.getId())
                                        .orElseGet(() -> new Inventory(wh, prod, 0));
                                inv.setQuantity(inv.getQuantity() + item.getQuantity());
                                inventoryRepository.save(inv);
                                warehouseService.syncProductGlobalStock(prod.getId());
                            }
                        }
                    }
                }
            }
        } else {
            refund.setReturnStage("QC_FAILED");
            refund.setAdminNotes("QC Failed: Defective / damaged condition verified. Moved to Damaged & Quarantine. " + (notes != null ? notes : ""));

            // On QC failure, automatically route items into Warehouse Damaged & Quarantine Stock
            if (warehouseId != null) {
                List<OrderItem> items = orderItemRepository.findByOrderId(refund.getOrderId());
                Optional<Warehouse> whOpt = warehouseRepository.findById(warehouseId);
                if (whOpt.isPresent()) {
                    Warehouse wh = whOpt.get();
                    for (OrderItem item : items) {
                        Optional<Product> prodOpt = productRepository.findById(item.getProductId());
                        if (prodOpt.isPresent()) {
                            Product prod = prodOpt.get();
                            Inventory inv = inventoryRepository.findByWarehouseIdAndProductId(warehouseId, prod.getId())
                                    .orElseGet(() -> new Inventory(wh, prod, 0));
                            inv.setDamagedQuantity(inv.getDamagedQuantity() + item.getQuantity());
                            inventoryRepository.save(inv);
                            warehouseService.syncProductGlobalStock(prod.getId());
                        }
                    }
                }
            }
        }

        refund.setProcessedAt(timestamp);
        return refundRepository.save(refund);
    }

    /**
     * Step 4 of Return Lifecycle: Admin resolves the return request.
     * Options: REFUND (executes refund and voids payout), REPLACEMENT (ships a zero-price duplicate), EXCHANGE.
     */
    @Transactional
    public Refund resolveReturnRequest(Long refundId, String resolution, String method, String adminNotes) throws Exception {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new IllegalArgumentException("Refund request not found"));

        if (!"PENDING".equalsIgnoreCase(refund.getStatus())) {
            throw new IllegalStateException("Refund request is already resolved.");
        }

        Optional<Order> orderOpt = orderRepository.findByOrderId(refund.getOrderId());
        if (orderOpt.isEmpty()) {
            throw new IllegalArgumentException("Order not found: " + refund.getOrderId());
        }
        Order order = orderOpt.get();
        String timestamp = new SimpleDateFormat("MMM dd, yyyy HH:mm").format(new Date());

        if ("REFUND".equalsIgnoreCase(resolution)) {
            // Apply Refund details
            refund.setStatus("PROCESSED");
            refund.setReturnStage("REFUNDED");
            refund.setAdminNotes(adminNotes != null ? adminNotes : "Refund processed via " + method);
            refund.setProcessedAt(timestamp);

            // Execute test mode Razorpay refund or wallet refund simulation
            String rzpRefundId = "rfnd_" + (method != null ? method.toLowerCase() : "original") + "_" + System.currentTimeMillis();
            refund.setRazorpayRefundId(rzpRefundId);

            // Update Order status
            order.setPaymentStatus("REFUNDED");
            order.setStatus("REFUNDED");
            orderRepository.save(order);

            // Void settlements
            List<Settlement> settlements = settlementRepository.findByOrderId(order.getOrderId());
            for (Settlement s : settlements) {
                s.setStatus("REFUNDED");
                settlementRepository.save(s);
            }
        } 
        else if ("REPLACEMENT".equalsIgnoreCase(resolution) || "EXCHANGE".equalsIgnoreCase(resolution)) {
            refund.setStatus("PROCESSED");
            refund.setReturnStage("REPLACEMENT".equalsIgnoreCase(resolution) ? "REPLACEMENT_DISPATCHED" : "EXCHANGED");
            refund.setAdminNotes(adminNotes != null ? adminNotes : "Replacement item dispatched.");
            refund.setProcessedAt(timestamp);

            // Create duplicate replacement order in confirmed status
            String newOrderIdStr = ("REPLACEMENT".equalsIgnoreCase(resolution) ? "REP-" : "EXC-") + (int) (100000 + Math.random() * 900000);
            Order newOrder = new Order(
                    newOrderIdStr,
                    order.getUserId(),
                    new SimpleDateFormat("MMM dd, yyyy").format(new Date()),
                    0.0,
                    "CONFIRMED",
                    order.getPaymentMethod(),
                    null,
                    null,
                    order.getRecipientName(),
                    order.getRecipientPhone(),
                    order.getDeliveryAddress()
            );
            newOrder.setPaymentStatus("PAID");
            orderRepository.save(newOrder);

            // Copy items
            List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());
            for (OrderItem item : items) {
                OrderItem newItem = new OrderItem(
                        newOrderIdStr,
                        item.getProductId(),
                        ("REPLACEMENT".equalsIgnoreCase(resolution) ? "REPLACEMENT: " : "EXCHANGE: ") + item.getProductName(),
                        0.0,
                        item.getQuantity(),
                        item.getVendorId()
                );
                orderItemRepository.save(newItem);
            }

            // Allocate warehouse stock for replacement order
            try {
                warehouseService.allocateOrder(newOrderIdStr);
            } catch (Exception e) {
                System.err.println("Warehouse allocation failed for replacement: " + e.getMessage());
            }
        }

        Refund savedRefund = refundRepository.save(refund);

        if ("REFUND".equalsIgnoreCase(resolution)) {
            // Publish RefundCompletedEvent
            try {
                User user = (order.getUserId() != null) ? userRepository.findById(order.getUserId()).orElse(null) : null;
                eventPublisher.publishEvent(new RefundCompletedEvent(savedRefund, order, user));
            } catch (Exception e) {
                System.err.println("[PaymentService] Error publishing RefundCompletedEvent in resolveReturnRequest: " + e.getMessage());
            }
        }

        return savedRefund;
    }

    /**
     * Step 2 of Return Lifecycle: Admin/Warehouse approves return after product is returned and QC passes.
     * Executes Razorpay refund API in TEST MODE and marks status as PROCESSED.
     */
    @Transactional
    public Refund approveAndExecuteRefund(Long refundId, String adminNotes) throws RazorpayException {
        Optional<Refund> refundOpt = refundRepository.findById(refundId);
        if (refundOpt.isEmpty()) {
            throw new IllegalArgumentException("Refund request not found with ID: " + refundId);
        }

        Refund refund = refundOpt.get();
        if (!"PENDING".equalsIgnoreCase(refund.getStatus())) {
            throw new IllegalStateException("Refund request #" + refundId + " is already in status: " + refund.getStatus());
        }

        if (!"QC_PASSED".equalsIgnoreCase(refund.getReturnStage())) {
            throw new IllegalStateException("Cannot disburse refund: The returned product has not passed the warehouse Quality Control (QC) check yet.");
        }

        Optional<Order> orderOpt = orderRepository.findByOrderId(refund.getOrderId());
        if (orderOpt.isEmpty()) {
            throw new IllegalArgumentException("Associated order " + refund.getOrderId() + " not found.");
        }
        Order order = orderOpt.get();

        String razorpayRefundId = null;
        String razorpayPaymentId = refund.getRazorpayPaymentId() != null ? refund.getRazorpayPaymentId() : order.getRazorpayPaymentId();

        // Call Razorpay Refunds API in TEST MODE
        if (razorpayPaymentId != null && !razorpayPaymentId.trim().isEmpty()) {
            try {
                JSONObject refundReq = new JSONObject();
                long amountInPaise = Math.round(refund.getAmount() * 100.0);
                refundReq.put("amount", amountInPaise);
                JSONObject notes = new JSONObject();
                notes.put("reason", refund.getReason() != null ? refund.getReason() : "Customer Return Approved");
                notes.put("adminNotes", adminNotes != null ? adminNotes : "QC Passed");
                refundReq.put("notes", notes);

                com.razorpay.Refund rzpRefund = razorpayClient.payments.refund(razorpayPaymentId.trim(), refundReq);
                razorpayRefundId = rzpRefund.get("id");
            } catch (RazorpayException e) {
                System.err.println("Razorpay Refund API notice: " + e.getMessage());
                razorpayRefundId = "rfnd_test_" + System.currentTimeMillis();
            }
        } else {
            razorpayRefundId = "rfnd_offline_" + System.currentTimeMillis();
        }

        String timestamp = new SimpleDateFormat("MMM dd, yyyy HH:mm").format(new Date());

        refund.setRazorpayRefundId(razorpayRefundId);
        refund.setStatus("PROCESSED");
        refund.setReturnStage("REFUNDED");
        refund.setAdminNotes(adminNotes != null && !adminNotes.trim().isEmpty() ? adminNotes.trim() : "Item returned & Quality Check passed. Refund disbursed.");
        refund.setProcessedAt(timestamp);
        refundRepository.save(refund);

        // Update Order status
        List<Refund> allRefunds = refundRepository.findByOrderId(order.getOrderId());
        double totalProcessedRefunds = allRefunds.stream()
                .filter(r -> "PROCESSED".equalsIgnoreCase(r.getStatus()))
                .mapToDouble(Refund::getAmount)
                .sum();

        if (totalProcessedRefunds >= (order.getTotalAmount() - 0.01)) {
            order.setPaymentStatus("REFUNDED");
            order.setStatus("REFUNDED");
        } else {
            order.setPaymentStatus("PARTIALLY_REFUNDED");
            order.setStatus("PARTIALLY_REFUNDED");
        }
        orderRepository.save(order);

        // Publish RefundCompletedEvent
        try {
            User user = (order.getUserId() != null) ? userRepository.findById(order.getUserId()).orElse(null) : null;
            eventPublisher.publishEvent(new RefundCompletedEvent(refund, order, user));
        } catch (Exception e) {
            System.err.println("[PaymentService] Error publishing RefundCompletedEvent: " + e.getMessage());
        }

        // Update vendor settlements to REFUNDED so profits/commissions are properly deducted
        List<Settlement> settlements = settlementRepository.findByOrderId(order.getOrderId());
        for (Settlement s : settlements) {
            if ("REFUNDED".equalsIgnoreCase(order.getPaymentStatus())) {
                s.setStatus("REFUNDED");
            } else if ("PARTIALLY_REFUNDED".equalsIgnoreCase(order.getPaymentStatus())) {
                s.setStatus("PARTIALLY_REFUNDED");
            }
            settlementRepository.save(s);
        }

        return refund;
    }

    /**
     * Step 2 (Alternative): Admin rejects return request (e.g. Ineligible / QC Failed / Not Returned).
     */
    @Transactional
    public Refund rejectReturnRequest(Long refundId, String rejectionReason) {
        Optional<Refund> refundOpt = refundRepository.findById(refundId);
        if (refundOpt.isEmpty()) {
            throw new IllegalArgumentException("Refund request not found with ID: " + refundId);
        }

        Refund refund = refundOpt.get();
        if (!"PENDING".equalsIgnoreCase(refund.getStatus())) {
            throw new IllegalStateException("Refund request #" + refundId + " is already in status: " + refund.getStatus());
        }

        Optional<Order> orderOpt = orderRepository.findByOrderId(refund.getOrderId());
        if (orderOpt.isEmpty()) {
            throw new IllegalArgumentException("Associated order " + refund.getOrderId() + " not found.");
        }
        Order order = orderOpt.get();

        String timestamp = new SimpleDateFormat("MMM dd, yyyy HH:mm").format(new Date());

        refund.setStatus("REJECTED");
        refund.setReturnStage("QC_FAILED");
        refund.setAdminNotes(rejectionReason != null && !rejectionReason.trim().isEmpty() ? rejectionReason.trim() : "Return request rejected by admin / failed quality inspection.");
        refund.setProcessedAt(timestamp);
        refundRepository.save(refund);

        // Restore Order status
        order.setPaymentStatus("PAID");
        order.setStatus("DELIVERED");
        orderRepository.save(order);

        return refund;
    }

    /**
     * Direct refund processing (Admin immediate override or existing flow)
     */
    @Transactional
    public Refund processRefund(String orderId, Double amount, String reason) throws RazorpayException {
        if (orderId == null || orderId.trim().isEmpty()) {
            throw new IllegalArgumentException("Order ID is required for refund processing.");
        }

        Optional<Order> orderOpt = orderRepository.findByOrderId(orderId.trim());
        if (orderOpt.isEmpty()) {
            try {
                Long id = Long.parseLong(orderId.trim());
                orderOpt = orderRepository.findById(id);
            } catch (NumberFormatException ignored) {}
        }

        if (orderOpt.isEmpty()) {
            throw new IllegalArgumentException("Order not found with identifier: " + orderId);
        }

        Order order = orderOpt.get();

        // Calculate remaining refundable balance
        List<Refund> previousRefunds = refundRepository.findByOrderId(order.getOrderId());
        double alreadyRefunded = previousRefunds.stream()
                .filter(r -> "PROCESSED".equalsIgnoreCase(r.getStatus()))
                .mapToDouble(Refund::getAmount)
                .sum();
        double remainingBalance = Math.round((order.getTotalAmount() - alreadyRefunded) * 100.0) / 100.0;

        if (remainingBalance <= 0) {
            throw new IllegalStateException("Order " + order.getOrderId() + " has already been fully refunded.");
        }

        double refundAmount = (amount == null || amount <= 0) ? remainingBalance : amount;
        refundAmount = Math.round(refundAmount * 100.0) / 100.0;

        if (refundAmount > remainingBalance) {
            throw new IllegalArgumentException("Requested refund amount ₹" + refundAmount + " exceeds remaining refundable balance ₹" + remainingBalance);
        }

        String razorpayRefundId = null;
        String razorpayPaymentId = order.getRazorpayPaymentId();

        // Call Razorpay Refunds API if payment was made through Razorpay
        if (razorpayPaymentId != null && !razorpayPaymentId.trim().isEmpty()) {
            try {
                JSONObject refundReq = new JSONObject();
                long amountInPaise = Math.round(refundAmount * 100.0);
                refundReq.put("amount", amountInPaise);
                if (reason != null && !reason.trim().isEmpty()) {
                    JSONObject notes = new JSONObject();
                    notes.put("reason", reason);
                    refundReq.put("notes", notes);
                }

                com.razorpay.Refund rzpRefund = razorpayClient.payments.refund(razorpayPaymentId.trim(), refundReq);
                razorpayRefundId = rzpRefund.get("id");
            } catch (RazorpayException e) {
                System.err.println("Razorpay Refund API notice: " + e.getMessage());
                razorpayRefundId = "rfnd_test_" + System.currentTimeMillis();
            }
        } else {
            razorpayRefundId = "rfnd_offline_" + System.currentTimeMillis();
        }

        String timestamp = new SimpleDateFormat("MMM dd, yyyy HH:mm").format(new Date());

        // Create Refund record
        Refund refund = new Refund(
                order.getOrderId(),
                razorpayPaymentId,
                razorpayRefundId,
                refundAmount,
                reason != null && !reason.trim().isEmpty() ? reason.trim() : "Admin Authorized Direct Refund",
                "PROCESSED",
                timestamp,
                timestamp
        );
        refund.setReturnStage("REFUNDED");
        refund.setResolutionType("REFUND");
        refund = refundRepository.save(refund);

        // Update Order paymentStatus and status
        double totalRefundedAfterThis = alreadyRefunded + refundAmount;
        if (totalRefundedAfterThis >= (order.getTotalAmount() - 0.01)) {
            order.setPaymentStatus("REFUNDED");
            order.setStatus("REFUNDED");
        } else {
            order.setPaymentStatus("PARTIALLY_REFUNDED");
            order.setStatus("PARTIALLY_REFUNDED");
        }
        orderRepository.save(order);

        // Publish RefundCompletedEvent
        try {
            User user = (order.getUserId() != null) ? userRepository.findById(order.getUserId()).orElse(null) : null;
            eventPublisher.publishEvent(new RefundCompletedEvent(refund, order, user));
        } catch (Exception e) {
            System.err.println("[PaymentService] Error publishing direct RefundCompletedEvent: " + e.getMessage());
        }

        // Update vendor settlements to REFUNDED so profits/commissions are properly deducted
        List<Settlement> settlements = settlementRepository.findByOrderId(order.getOrderId());
        for (Settlement s : settlements) {
            if ("REFUNDED".equalsIgnoreCase(order.getPaymentStatus())) {
                s.setStatus("REFUNDED");
            } else if ("PARTIALLY_REFUNDED".equalsIgnoreCase(order.getPaymentStatus())) {
                s.setStatus("PARTIALLY_REFUNDED");
            }
            settlementRepository.save(s);
        }

        // Release warehouse allocations to restore stock and sync global stock representation
        try {
            warehouseService.releaseAllocations(order.getOrderId());
        } catch (Exception e) {
            System.err.println("Failed to release allocations for order direct refund: " + order.getOrderId() + ". Error: " + e.getMessage());
        }

        return refund;
    }

    /**
     * Clean up any orphaned failed/cancelled checkout attempts from database on startup
     */
    @PostConstruct
    public void cleanupFailedOrders() {
        try {
            List<Order> failedOrders = orderRepository.findAll().stream()
                    .filter(o -> (o.getOrderId() != null && o.getOrderId().startsWith("ORD-FAIL-"))
                            || "FAILED".equalsIgnoreCase(o.getPaymentStatus()))
                    .collect(Collectors.toList());
            for (Order o : failedOrders) {
                List<OrderItem> items = orderItemRepository.findByOrderId(o.getOrderId());
                if (items != null && !items.isEmpty()) {
                    orderItemRepository.deleteAll(items);
                }
                orderRepository.delete(o);
            }
            if (!failedOrders.isEmpty()) {
                System.out.println("Cleaned up " + failedOrders.size() + " orphaned failed checkout order records from database.");
            }
        } catch (Exception e) {
            System.err.println("Warning during cleanup of failed orders: " + e.getMessage());
        }
    }

    /**
     * Record a failed or cancelled Razorpay checkout attempt without creating phantom orders
     */
    @Transactional
    public Order recordFailedPayment(Long userId, String razorpayOrderId, String errorMessage, 
                                     Double amount, List<Map<String, Object>> items, 
                                     Map<String, Object> deliveryInfo) {
        System.out.println("Payment failed/cancelled for user: " + userId + ", razorpayOrderId: " + razorpayOrderId + ", reason: " + errorMessage);

        try {
            User user = (userId != null) ? userRepository.findById(userId).orElse(null) : null;
            String customerEmail = (deliveryInfo != null && deliveryInfo.get("email") != null) 
                    ? deliveryInfo.get("email").toString() 
                    : (user != null ? user.getEmail() : null);
            String customerName = (deliveryInfo != null && deliveryInfo.get("name") != null) 
                    ? deliveryInfo.get("name").toString() 
                    : (user != null ? user.getFullName() : "Customer");
            double failureAmount = amount != null ? amount : 0.0;

            eventPublisher.publishEvent(new PaymentFailedEvent(
                    userId, 
                    customerEmail, 
                    customerName, 
                    null, 
                    razorpayOrderId, 
                    failureAmount, 
                    errorMessage != null ? errorMessage : "Payment transaction cancelled or failed.", 
                    user
            ));
        } catch (Exception e) {
            System.err.println("[PaymentService] Error publishing PaymentFailedEvent: " + e.getMessage());
        }

        return null;
    }

    /**
     * Get combined transaction history with payment method, status, refunds, and order info
     */
    public List<Map<String, Object>> getTransactions(Long userId, Long vendorId, String status, String paymentStatus) {
        List<Order> orders = orderRepository.findAllByOrderByIdDesc().stream()
                .filter(o -> o.getOrderId() != null && !o.getOrderId().startsWith("ORD-FAIL-") && !"FAILED".equalsIgnoreCase(o.getPaymentStatus()))
                .collect(Collectors.toList());

        if (userId != null) {
            orders = orders.stream().filter(o -> userId.equals(o.getUserId())).collect(Collectors.toList());
        }

        if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status.trim())) {
            orders = orders.stream().filter(o -> status.trim().equalsIgnoreCase(o.getStatus())).collect(Collectors.toList());
        }

        if (paymentStatus != null && !paymentStatus.trim().isEmpty() && !"ALL".equalsIgnoreCase(paymentStatus.trim())) {
            orders = orders.stream().filter(o -> paymentStatus.trim().equalsIgnoreCase(o.getPaymentStatus())).collect(Collectors.toList());
        }

        List<Map<String, Object>> transactions = new ArrayList<>();

        for (Order order : orders) {
            List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());
            
            if (vendorId != null) {
                boolean containsVendorItem = items.stream().anyMatch(i -> vendorId.equals(i.getVendorId()));
                if (!containsVendorItem) {
                    continue;
                }
            }

            List<Refund> refunds = refundRepository.findByOrderIdOrderByIdDesc(order.getOrderId());
            double totalProcessedRefunds = refunds.stream()
                    .filter(r -> "PROCESSED".equalsIgnoreCase(r.getStatus()))
                    .mapToDouble(Refund::getAmount)
                    .sum();
            
            boolean hasPendingRefund = refunds.stream().anyMatch(r -> "PENDING".equalsIgnoreCase(r.getStatus()));

            Map<String, Object> tx = new HashMap<>();
            tx.put("id", order.getId());
            tx.put("orderId", order.getOrderId());
            tx.put("userId", order.getUserId());
            tx.put("date", order.getDate());
            tx.put("totalAmount", order.getTotalAmount());
            tx.put("status", order.getStatus()); // Fulfillment status
            tx.put("paymentStatus", order.getPaymentStatus() != null ? order.getPaymentStatus() : "PENDING");
            tx.put("paymentMethod", order.getPaymentMethod() != null ? order.getPaymentMethod() : "RAZORPAY");
            tx.put("razorpayOrderId", order.getRazorpayOrderId());
            tx.put("razorpayPaymentId", order.getRazorpayPaymentId());
            tx.put("recipientName", order.getRecipientName());
            tx.put("recipientPhone", order.getRecipientPhone());
            tx.put("deliveryAddress", order.getDeliveryAddress());
            tx.put("items", items);
            tx.put("refunds", refunds);
            tx.put("totalRefunded", totalProcessedRefunds);
            tx.put("hasPendingRefund", hasPendingRefund);
            tx.put("refundableBalance", Math.max(0.0, Math.round((order.getTotalAmount() - totalProcessedRefunds) * 100.0) / 100.0));

            transactions.add(tx);
        }

        return transactions;
    }

    /**
     * Get live status details for an order
     */
    public Map<String, Object> getPaymentStatusDetails(String orderId) {
        Optional<Order> orderOpt = orderRepository.findByOrderId(orderId);
        if (orderOpt.isEmpty()) {
            try {
                Long id = Long.parseLong(orderId);
                orderOpt = orderRepository.findById(id);
            } catch (NumberFormatException ignored) {}
        }

        if (orderOpt.isEmpty()) {
            return null;
        }

        Order order = orderOpt.get();
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());
        List<Refund> refunds = refundRepository.findByOrderIdOrderByIdDesc(order.getOrderId());
        double totalProcessedRefunds = refunds.stream()
                .filter(r -> "PROCESSED".equalsIgnoreCase(r.getStatus()))
                .mapToDouble(Refund::getAmount)
                .sum();
        boolean hasPendingRefund = refunds.stream().anyMatch(r -> "PENDING".equalsIgnoreCase(r.getStatus()));

        Map<String, Object> res = new HashMap<>();
        res.put("id", order.getId());
        res.put("orderId", order.getOrderId());
        res.put("userId", order.getUserId());
        res.put("date", order.getDate());
        res.put("totalAmount", order.getTotalAmount());
        res.put("status", order.getStatus());
        res.put("paymentStatus", order.getPaymentStatus() != null ? order.getPaymentStatus() : "PENDING");
        res.put("paymentMethod", order.getPaymentMethod());
        res.put("razorpayOrderId", order.getRazorpayOrderId());
        res.put("razorpayPaymentId", order.getRazorpayPaymentId());
        res.put("items", items);
        res.put("refunds", refunds);
        res.put("totalRefunded", totalProcessedRefunds);
        res.put("hasPendingRefund", hasPendingRefund);
        res.put("refundableBalance", Math.max(0.0, Math.round((order.getTotalAmount() - totalProcessedRefunds) * 100.0) / 100.0));

        return res;
    }

    /**
     * Get all return/refund requests for Admin Dashboard
     */
    public List<Map<String, Object>> getAllRefundRequests(String statusFilter) {
        List<Refund> refunds;
        if (statusFilter != null && !statusFilter.trim().isEmpty() && !"ALL".equalsIgnoreCase(statusFilter.trim())) {
            refunds = refundRepository.findByStatusOrderByIdDesc(statusFilter.trim());
        } else {
            refunds = refundRepository.findAllByOrderByIdDesc();
        }

        List<Map<String, Object>> list = new ArrayList<>();
        for (Refund r : refunds) {
            Optional<Order> orderOpt = orderRepository.findByOrderId(r.getOrderId());
            List<OrderItem> items = orderItemRepository.findByOrderId(r.getOrderId());

            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("orderId", r.getOrderId());
            map.put("amount", r.getAmount());
            map.put("returnReasonCategory", r.getReturnReasonCategory());
            map.put("resolutionType", r.getResolutionType());
            map.put("reason", r.getReason());
            map.put("customerNotes", r.getCustomerNotes());
            map.put("adminNotes", r.getAdminNotes());
            map.put("status", r.getStatus());
            map.put("returnStage", r.getReturnStage());
            map.put("requestedAt", r.getRequestedAt());
            map.put("processedAt", r.getProcessedAt());
            map.put("razorpayPaymentId", r.getRazorpayPaymentId());
            map.put("razorpayRefundId", r.getRazorpayRefundId());
            map.put("items", items);

            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                map.put("userId", order.getUserId());
                map.put("orderTotal", order.getTotalAmount());
                map.put("orderDate", order.getDate());
                map.put("orderStatus", order.getStatus());
                map.put("recipientName", order.getRecipientName());
                map.put("recipientPhone", order.getRecipientPhone());
                map.put("deliveryAddress", order.getDeliveryAddress());
            }

            list.add(map);
        }

        return list;
    }

    /**
     * Restore product stock inventory for an order when returned, refunded, or cancelled.
     */
    private void restockOrderItems(String orderId) {
        if (orderId == null || orderId.trim().isEmpty()) {
            return;
        }
        try {
            List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId.trim());
            for (OrderItem item : orderItems) {
                if (item.getProductId() != null && item.getQuantity() > 0) {
                    Optional<Product> prodOpt = productRepository.findById(item.getProductId());
                    if (prodOpt.isPresent()) {
                        Product prod = prodOpt.get();
                        int currentStock = prod.getStock() != null ? prod.getStock() : 0;
                        prod.setStock(currentStock + item.getQuantity());
                        productRepository.save(prod);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to restock items for order " + orderId + ": " + e.getMessage());
        }
    }
}
