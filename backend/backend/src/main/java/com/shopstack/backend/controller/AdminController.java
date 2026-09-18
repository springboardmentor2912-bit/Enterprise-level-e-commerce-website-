package com.shopstack.backend.controller;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.backend.entity.NotificationType;
import com.shopstack.backend.entity.Product;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.entity.VendorOrder;
import com.shopstack.backend.entity.VendorProfile;
import com.shopstack.backend.entity.Warehouse;
import com.shopstack.backend.entity.WarehouseStock;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.repository.VendorOrderRepository;
import com.shopstack.backend.repository.VendorProfileRepository;
import com.shopstack.backend.repository.WarehouseRepository;
import com.shopstack.backend.repository.WarehouseStockRepository;
import com.shopstack.backend.service.NotificationService;
import com.shopstack.backend.service.ProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    public record StatusRequest(String status) {}

    public record WarehouseUpdateRequest(
            String status,
            String warehouseName,
            Integer allocatedQuantity
    ) {}

    public record RefundDecision(String decision) {}

    public record VendorUpdateRequest(
            String phone,
            String address,
            Double commissionPercentage
    ) {}

    public record WarehouseRequest(
            String name,
            String code,
            String address,
            String manager,
            Integer capacity,
            Boolean active
    ) {}

    public record WarehouseStockView(
            Long productId,
            String productName,
            Long warehouseId,
            String warehouseName,
            int availableQuantity
    ) {}

    public record ProductWarehouseRequest(
            Map<Long, Integer> allocations
    ) {}

    private final UserRepository userRepository;
    private final VendorOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final WarehouseRepository warehouseRepository;
    private final WarehouseStockRepository warehouseStockRepository;
    private final ProductService productService;
    private final NotificationService notificationService;

    @PatchMapping("/inventory/{productId}/warehouse")
    public ResponseEntity<?> allocateProductToWarehouse(
            @PathVariable Long productId,
            @RequestBody ProductWarehouseRequest request) {

        try {

            if (request == null || request.allocations() == null) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Select a warehouse.")
                );
            }

            productService.allocateProductToWarehouses(
                    productId,
                    request.allocations()
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Product quantities allocated and approved."
                    )
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", exception.getMessage())
            );
        }
    }

    public record InventoryItem(
            Long id,
            String name,
            String category,
            double price,
            int stock,
            int returnedStock,
            int soldQuantity,
            Long vendorId,
            String vendorName,
            String vendorEmail,
            String approvalStatus
    ) {}

    public record VendorSummary(
            Long id,
            String displayName,
            String email,
            String phone,
            String address,
            double commissionPercentage,
            String businessName,
            String contactNumber,
            String businessAddress,
            String description
    ) {}

    @GetMapping("/summary")
    public Map<String, Object> getAdminSummary(
            Authentication authentication) {

        return Map.of(
                "users",
                userRepository.countByRole("CUSTOMER"),

                "vendors",
                userRepository.countByRole("VENDOR"),

                "orders",
                orderRepository.count(),

                "refunds",
                orderRepository.countByOrderStatus("REFUND_REQUESTED"),

                "revenue",
                orderRepository.sumTotalAmountByOrderStatus("DELIVERED"),

                "commissionRevenue",
                orderRepository.sumCommissionRevenue()
        );
    }

    @GetMapping("/product-requests")
    public List<InventoryItem> getProductRequests() {

        return productRepository.findAll()
                .stream()
                .filter(product ->
                        "PENDING".equals(product.getApprovalStatus())
                                && warehouseStockRepository
                                        .findByProductId(product.getId())
                                        .isEmpty()
                )
                .map(this::toInventoryItem)
                .toList();
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/vendors")
    public List<VendorSummary> getVendors() {

        return userRepository.findAllByRole("VENDOR")
                .stream()
                .map(vendor -> {

                    VendorProfile profile =
                            vendorProfileRepository
                                    .findByUser(vendor)
                                    .orElse(null);

                    return new VendorSummary(
                            vendor.getId(),
                            vendor.getDisplayName(),
                            vendor.getEmail(),
                            vendor.getPhone(),
                            vendor.getAddress(),
                            User.VENDOR_COMMISSION_PERCENTAGE,
                            profile == null
                                    ? ""
                                    : profile.getBusinessName(),
                            profile == null
                                    ? ""
                                    : profile.getContactNumber(),
                            profile == null
                                    ? ""
                                    : profile.getAddress(),
                            profile == null
                                    ? ""
                                    : profile.getDescription()
                    );
                })
                .toList();
    }

    @GetMapping("/vendors/{id}/orders")
    public ResponseEntity<?> getVendorOrders(
            @PathVariable Long id) {

        return userRepository.findById(id)
                .map(vendor ->
                        ResponseEntity.ok(
                                orderRepository
                                        .findByVendor_IdOrderByPlacedAtDesc(
                                                vendor.getId()
                                        )
                        )
                )
                .orElseGet(
                        () -> ResponseEntity.notFound().build()
                );
    }

    @PatchMapping("/vendors/{id}")
    public ResponseEntity<?> updateVendor(
            @PathVariable Long id,
            @RequestBody VendorUpdateRequest request) {

        return userRepository.findById(id)
                .map(vendor -> {

                    if (!"VENDOR".equals(vendor.getRole())) {
                        return ResponseEntity.badRequest().body(
                                Map.of(
                                        "message",
                                        "User is not a vendor"
                                )
                        );
                    }

                    vendor.setCommissionPercentage(
                            User.VENDOR_COMMISSION_PERCENTAGE
                    );

                    if (request != null
                            && request.phone() != null) {

                        vendor.setPhone(request.phone());
                    }

                    return ResponseEntity.ok(
                            userRepository.save(vendor)
                    );
                })
                .orElseGet(
                        () -> ResponseEntity.notFound().build()
                );
    }

    @GetMapping("/orders")
    public List<VendorOrder> getOrders() {
        return orderRepository.findAllByOrderByPlacedAtDesc();
    }

    @PatchMapping("/orders/mark-all-delivered")
    public ResponseEntity<?> markAllOrdersDelivered() {

        List<VendorOrder> orders =
                orderRepository.findAll();

        orders.forEach(order -> {

            if (!"REFUNDED".equals(order.getOrderStatus())) {

                order.setOrderStatus("DELIVERED");
                order.setCustomerNotificationRead(false);
            }
        });

        orderRepository.saveAll(orders);

        return ResponseEntity.ok(
                Map.of(
                        "updated",
                        orders.size(),
                        "message",
                        "All active orders marked as delivered."
                )
        );
    }

    @GetMapping("/inventory")
    public List<InventoryItem> getInventory() {

        return productRepository.findAll()
                .stream()
                .map(this::toInventoryItem)
                .toList();
    }

    @GetMapping("/warehouse/orders")
    public List<VendorOrder> getWarehouseOrders() {

        return orderRepository.findAllByOrderByPlacedAtDesc();
    }

    @GetMapping("/warehouses")
    public List<Warehouse> getWarehouses() {

        return warehouseRepository.findAll(
                org.springframework.data.domain.Sort.by("name")
        );
    }

    @GetMapping("/warehouse/stock")
    public List<WarehouseStockView> getWarehouseStock() {

        Map<Long, Product> products =
                productRepository.findAll()
                        .stream()
                        .collect(
                                java.util.stream.Collectors.toMap(
                                        Product::getId,
                                        product -> product
                                )
                        );

        Map<Long, Warehouse> warehouses =
                warehouseRepository.findAll()
                        .stream()
                        .collect(
                                java.util.stream.Collectors.toMap(
                                        Warehouse::getId,
                                        warehouse -> warehouse
                                )
                        );

        return warehouseStockRepository.findAll()
                .stream()
                .map(stock -> {

                    Product product =
                            products.get(stock.getProductId());

                    Warehouse warehouse =
                            warehouses.get(stock.getWarehouseId());

                    return new WarehouseStockView(
                            stock.getProductId(),
                            product == null
                                    ? "Product unavailable"
                                    : product.getName(),
                            stock.getWarehouseId(),
                            warehouse == null
                                    ? "Warehouse unavailable"
                                    : warehouse.getName(),
                            stock.getAvailableQuantity()
                    );
                })
                .toList();
    }

    @PostMapping("/warehouses")
    public ResponseEntity<?> createWarehouse(
            @RequestBody WarehouseRequest request) {

        if (request == null
                || request.name() == null
                || request.name().isBlank()
                || request.code() == null
                || request.code().isBlank()) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Warehouse name and code are required."
                    )
            );
        }

        if (warehouseRepository.existsByCode(request.code())) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Warehouse code already exists."
                    )
            );
        }

        Warehouse warehouse =
                new Warehouse(
                        request.name(),
                        request.code().toUpperCase(),
                        request.address(),
                        request.manager(),
                        request.capacity() == null
                                ? 1000
                                : request.capacity()
                );

        if (request.active() != null) {
            warehouse.setActive(request.active());
        }

        return ResponseEntity.ok(
                warehouseRepository.save(warehouse)
        );
    }

    @PatchMapping("/warehouses/{id}")
    public ResponseEntity<?> updateWarehouse(
            @PathVariable Long id,
            @RequestBody WarehouseRequest request) {

        return warehouseRepository.findById(id)
                .map(warehouse -> {

                    if (request.name() != null
                            && !request.name().isBlank()) {

                        warehouse.setName(request.name());
                    }

                    if (request.address() != null) {
                        warehouse.setAddress(request.address());
                    }

                    if (request.manager() != null) {
                        warehouse.setManager(request.manager());
                    }

                    if (request.capacity() != null
                            && request.capacity() > 0) {

                        warehouse.setCapacity(request.capacity());
                    }

                    if (request.active() != null) {
                        warehouse.setActive(request.active());
                    }

                    return ResponseEntity.ok(
                            warehouseRepository.save(warehouse)
                    );
                })
                .orElseGet(
                        () -> ResponseEntity.notFound().build()
                );
    }

    @PatchMapping("/warehouse/orders/{id}")
    public ResponseEntity<?> updateWarehouseOrder(
            @PathVariable Long id,
            @RequestBody WarehouseUpdateRequest request,
            Authentication authentication) {

        VendorOrder order =
                orderRepository.findById(id)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Order not found"
                                )
                        );

        if (request == null
                || !isValidWarehouseStatus(request.status())) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Invalid warehouse fulfillment step."
                    )
            );
        }

        if (authentication != null
                && authentication.getAuthorities()
                        .stream()
                        .anyMatch(
                                authority ->
                                        authority.getAuthority()
                                                .equals("ROLE_ADMIN")
                        )
                && !List.of(
                        "AVAILABILITY_CHECK",
                        "WAREHOUSE_SELECTED",
                        "STOCK_ALLOCATED"
                ).contains(request.status())) {

            return ResponseEntity.status(403).body(
                    Map.of(
                            "message",
                            "Only warehouse staff can process picking, packing, shipment, or delivery."
                    )
            );
        }

        if (authentication != null
                && authentication.getAuthorities()
                        .stream()
                        .anyMatch(
                                authority ->
                                        authority.getAuthority()
                                                .equals("ROLE_STAFF")
                        )
                && !List.of(
                        "PICKING",
                        "PACKED",
                        "SHIPMENT_PREPARED",
                        "READY_FOR_SHIPMENT"
                ).contains(request.status())) {

            return ResponseEntity.status(403).body(
                    Map.of(
                            "message",
                            "Warehouse staff begin after warehouse allocation."
                    )
            );
        }

        if (List.of(
                "DELIVERED",
                "REFUNDED",
                "CANCELLED"
        ).contains(order.getOrderStatus())) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Delivered or closed orders cannot be updated."
                    )
            );
        }

        String currentStatus =
                order.getWarehouseStatus() == null
                        ? "ORDER_CONFIRMED"
                        : order.getWarehouseStatus();

        if ("STOCK_MOVEMENT_TRACKED".equals(currentStatus)) {
            currentStatus = "PACKED";
        }

        if (!isNextWarehouseStatus(
                currentStatus,
                request.status())) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Complete the warehouse steps in order."
                    )
            );
        }

        if (List.of(
                "WAREHOUSE_SELECTED",
                "STOCK_ALLOCATED",
                "PICKING",
                "PACKED",
                "SHIPMENT_PREPARED",
                "READY_FOR_SHIPMENT"
        ).contains(request.status())
                && (request.warehouseName() == null
                || request.warehouseName().isBlank())) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Select a warehouse before continuing."
                    )
            );
        }

        if ("STOCK_ALLOCATED".equals(request.status())) {

            if (request.allocatedQuantity() == null
                    || request.allocatedQuantity()
                    != order.getQuantity()) {

                return ResponseEntity.badRequest().body(
                        Map.of(
                                "message",
                                "Allocate the exact quantity purchased by the customer: "
                                        + order.getQuantity()
                                        + "."
                        )
                );
            }

            Product product =
                    productRepository.findById(
                            order.getProductId()
                    ).orElse(null);

            if (product == null) {

                return ResponseEntity.badRequest().body(
                        Map.of(
                                "message",
                                "The ordered product is no longer available."
                        )
                );
            }

            Warehouse warehouse =
                    warehouseRepository.findAll()
                            .stream()
                            .filter(
                                    item ->
                                            item.getName()
                                                    .equals(
                                                            order.getWarehouseName()
                                                    )
                            )
                            .findFirst()
                            .orElse(null);

            WarehouseStock stock =
                    warehouse == null
                            ? null
                            : warehouseStockRepository
                                    .findByProductIdAndWarehouseId(
                                            order.getProductId(),
                                            warehouse.getId()
                                    )
                                    .orElse(null);

            if (stock == null
                    || stock.getAvailableQuantity()
                    < order.getQuantity()) {

                return ResponseEntity.badRequest().body(
                        Map.of(
                                "message",
                                "This warehouse does not have enough local stock for the order."
                        )
                );
            }

            stock.setAvailableQuantity(
                    stock.getAvailableQuantity()
                            - order.getQuantity()
            );

            warehouseStockRepository.save(stock);

            order.setWarehouseAllocatedQuantity(
                    request.allocatedQuantity()
            );
        }

        order.setWarehouseStatus(request.status());

        if (request.warehouseName() != null
                && !request.warehouseName().isBlank()) {

            order.setWarehouseName(request.warehouseName());
        }

        order.setWarehouseUpdatedAt(LocalDateTime.now());

        if ("READY_FOR_SHIPMENT".equals(request.status())) {

            order.setOrderStatus("PROCESSING");
            order.setCustomerNotificationRead(false);
        }

        orderRepository.save(order);

        return ResponseEntity.ok(order);
    }

    private boolean isValidWarehouseStatus(String status) {

        return warehouseStatuses().contains(status);
    }

    private boolean isNextWarehouseStatus(
            String current,
            String requested) {

        return ("ORDER_CONFIRMED".equals(current)
                && "AVAILABILITY_CHECK".equals(requested))

                || ("AVAILABILITY_CHECK".equals(current)
                && "WAREHOUSE_SELECTED".equals(requested))

                || ("WAREHOUSE_SELECTED".equals(current)
                && "STOCK_ALLOCATED".equals(requested))

                || ("STOCK_ALLOCATED".equals(current)
                && "PICKING".equals(requested))

                || ("PICKING".equals(current)
                && "PACKED".equals(requested))

                || ("PACKED".equals(current)
                && "SHIPMENT_PREPARED".equals(requested))

                || ("STOCK_MOVEMENT_TRACKED".equals(current)
                && "SHIPMENT_PREPARED".equals(requested))

                || ("SHIPMENT_PREPARED".equals(current)
                && "READY_FOR_SHIPMENT".equals(requested));
    }

    private List<String> warehouseStatuses() {

        return List.of(
                "ORDER_CONFIRMED",
                "AVAILABILITY_CHECK",
                "WAREHOUSE_SELECTED",
                "STOCK_ALLOCATED",
                "PICKING",
                "PACKED",
                "SHIPMENT_PREPARED",
                "READY_FOR_SHIPMENT"
        );
    }

    private InventoryItem toInventoryItem(Product product) {

        User vendor = product.getVendor();

        return new InventoryItem(
                product.getId(),
                product.getName(),
                product.getCategory(),
                product.getSalePrice(),
                product.getStock(),
                product.getReturnedStock(),
                product.getSoldQuantity(),
                vendor.getId(),
                vendor.getDisplayName(),
                vendor.getEmail(),
                product.getApprovalStatus()
        );
    }

    @GetMapping("/refunds")
    public List<VendorOrder> getRefundRequests() {

        return orderRepository.findAll()
                .stream()
                .filter(
                        order ->
                                (
                                        order.getRefundStatus() != null
                                                && !"NONE".equals(
                                                order.getRefundStatus()
                                        )
                                )
                                        || "REFUNDED".equals(
                                        order.getOrderStatus()
                                )
                )
                .sorted(
                        Comparator.comparing(
                                VendorOrder::getRefundRequestedAt,
                                Comparator.nullsLast(
                                        Comparator.reverseOrder()
                                )
                        )
                )
                .toList();
    }

    @PatchMapping("/refunds/{orderReference}/decision")
    public ResponseEntity<?> decideRefund(
            @PathVariable String orderReference,
            @RequestBody RefundDecision request) {

        List<VendorOrder> orders =
                orderRepository.findByOrderReference(
                        orderReference
                );

        if (orders.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (request == null
                || !(
                "APPROVE".equals(request.decision())
                        || "REJECT".equals(request.decision())
        )) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Decision must be APPROVE or REJECT."
                    )
            );
        }

        LocalDateTime processedAt =
                LocalDateTime.now();

        orders.forEach(order -> {

            if ("APPROVE".equals(request.decision())) {

                order.setOrderStatus("RETURN_ACCEPTED");
                order.setRefundStatus("ACCEPTED");

            } else {

                order.setOrderStatus(
                        order.getPreviousOrderStatus() == null
                                ? "DELIVERED"
                                : order.getPreviousOrderStatus()
                );

                order.setRefundStatus("REJECTED");
            }

            order.setRefundProcessedAt(processedAt);
            order.setCustomerNotificationRead(false);
        });

        orderRepository.saveAll(orders);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Refund decision saved.",
                        "refundStatus",
                        orders.get(0).getRefundStatus()
                )
        );
    }

    @PatchMapping("/refunds/{orderReference}/warehouse-status")
    public ResponseEntity<?> updateReturnWarehouseStatus(
            @PathVariable String orderReference,
            @RequestBody StatusRequest request,
            Authentication authentication) {

        boolean staff =
                authentication != null
                        && authentication.getAuthorities()
                                .stream()
                                .anyMatch(
                                        authority ->
                                                authority.getAuthority()
                                                        .equals("ROLE_STAFF")
                                );

        if (!staff) {

            return ResponseEntity.status(403).body(
                    Map.of(
                            "message",
                            "Only warehouse staff can process returned products."
                    )
            );
        }

        List<VendorOrder> orders =
                orderRepository.findByOrderReference(
                        orderReference
                );

        if (orders.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (request == null
                || !(
                "RECEIVED".equals(request.status())
                        || "INSPECTED".equals(request.status())
                        || "VALID".equals(request.status())
                        || "INVALID".equals(request.status())
                        || "RETURN_SHIPPED".equals(request.status())
                        || "RETURN_DELIVERED".equals(request.status())
        )) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Invalid return warehouse status."
                    )
            );
        }

        String current =
                orders.get(0).getRefundStatus();

        if ((
                "RECEIVED".equals(request.status())
                        && !"ACCEPTED".equals(current)
        )
                || (
                "INSPECTED".equals(request.status())
                        && !"RECEIVED".equals(current)
        )
                || (
                (
                        "VALID".equals(request.status())
                                || "INVALID".equals(request.status())
                )
                        && !"INSPECTED".equals(current)
        )
                || (
                "RETURN_SHIPPED".equals(request.status())
                        && !"REJECTED".equals(current)
        )
                || (
                "RETURN_DELIVERED".equals(request.status())
                        && !"RETURN_SHIPPED".equals(current)
        )) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Complete the return steps in order."
                    )
            );
        }

        LocalDateTime now =
                LocalDateTime.now();

        orders.forEach(order -> {

            if ("RECEIVED".equals(request.status())) {

                order.setRefundStatus("RECEIVED");
                order.setOrderStatus("RETURN_RECEIVED");

            } else if ("INSPECTED".equals(request.status())) {

                order.setRefundStatus("INSPECTED");
                order.setOrderStatus("RETURN_INSPECTED");

            } else if ("VALID".equals(request.status())) {

                order.setRefundStatus("REFUNDED");
                order.setOrderStatus("REFUNDED");
                order.setRefundProcessedAt(now);

                Product returnedProduct =
                        productRepository.findById(
                                order.getProductId()
                        ).orElse(null);

                if (returnedProduct != null) {

                    returnedProduct.setReturnedStock(
                            returnedProduct.getReturnedStock()
                                    + order.getQuantity()
                    );

                    productRepository.save(returnedProduct);
                }

            } else if ("INVALID".equals(request.status())) {

                order.setRefundStatus("REJECTED");
                order.setOrderStatus("RETURN_REJECTED");

            } else if ("RETURN_SHIPPED".equals(request.status())) {

                order.setRefundStatus("RETURN_SHIPPED");
                order.setOrderStatus("RETURN_SHIPPED");

            } else if ("RETURN_DELIVERED".equals(request.status())) {

                order.setRefundStatus("RETURN_DELIVERED");
                order.setOrderStatus("RETURN_DELIVERED");
            }

            // Send the refund-completed notification only when the
            // returned product has been inspected and marked VALID.
            if ("VALID".equals(request.status())) {

                User customer =
                        userRepository.findByEmail(
                                order.getCustomerEmail()
                        ).orElse(null);

                if (customer != null) {

                    notificationService.createNotification(
                            customer,
                            NotificationType.REFUND_COMPLETED,
                            "Refund Completed",
                            "Your refund for order "
                                    + order.getOrderReference()
                                    + " has been completed successfully.",
                            order.getOrderReference(),
                            null,
                            order.getCustomerTotalAmount()
                    );
                }
            }

            order.setCustomerNotificationRead(false);
        });

        orderRepository.saveAll(orders);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Return status updated.",
                        "refundStatus",
                        orders.get(0).getRefundStatus()
                )
        );
    }

    @PatchMapping("/warehouse/orders/{id}/handoff")
    public ResponseEntity<?> handoffShipment(
            @PathVariable Long id,
            @RequestBody StatusRequest request) {
                System.out.println("========== SHIPMENT HANDOFF STARTED ==========");
System.out.println("Order ID: " + id);

        VendorOrder order =
                orderRepository.findById(id)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Order not found"
                                )
                        );

        if (request == null
                || !"SHIPPED".equals(request.status())
                || !"READY_FOR_SHIPMENT".equals(
                order.getWarehouseStatus()
        )) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Only orders ready for shipment can be handed to delivery."
                    )
            );
        }

        order.setOrderStatus("SHIPPED");
        order.setCustomerNotificationRead(false);

        VendorOrder savedOrder =
                orderRepository.save(order);

        /*
         * Find the actual customer who placed this order.
         * The email stored on VendorOrder is used to find
         * the corresponding User account.
         */
        User customer =
                userRepository.findByEmail(
                        savedOrder.getCustomerEmail()
                ).orElse(null);

        if (customer != null) {

            notificationService.createNotification(
                    customer,
                    NotificationType.ORDER_SHIPPED,
                    "Your Order Has Been Shipped",
                    "Your order "
                            + savedOrder.getOrderReference()
                            + " has been shipped and is now on its way.",
                    savedOrder.getOrderReference(),
                    null,
                    savedOrder.getCustomerTotalAmount()
            );
        }

        return ResponseEntity.ok(savedOrder);
    }

    @PatchMapping("/warehouse/orders/{id}/delivery-status")
    public ResponseEntity<?> updateWarehouseDeliveryStatus(
            @PathVariable Long id,
            @RequestBody StatusRequest request) {

        VendorOrder order =
                orderRepository.findById(id)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Order not found"
                                )
                        );

        if (!"READY_FOR_SHIPMENT".equals(
                order.getWarehouseStatus()
        )
                || request == null
                || !isNextDeliveryStatus(
                order.getOrderStatus(),
                request.status()
        )) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Delivery statuses must be updated in order after warehouse handoff."
                    )
            );
        }

        String previousOrderStatus = order.getOrderStatus();

        order.setOrderStatus(request.status());

        if ("DELIVERED".equals(request.status())) {
            order.setWarehouseStatus("DELIVERED");
        }

        order.setCustomerNotificationRead(false);

        VendorOrder savedOrder = orderRepository.save(order);

        if ("DELIVERED".equals(request.status())
                && !"DELIVERED".equals(previousOrderStatus)) {

            User customer =
                    userRepository.findByEmail(
                            savedOrder.getCustomerEmail()
                    ).orElse(null);

            if (customer != null) {

                notificationService.createNotification(
                        customer,
                        NotificationType.ORDER_DELIVERED,
                        "Your Order Has Been Delivered",
                        "Your order "
                                + savedOrder.getOrderReference()
                                + " has been delivered successfully.",
                        savedOrder.getOrderReference(),
                        null,
                        savedOrder.getCustomerTotalAmount()
                );
            }
        }

        return ResponseEntity.ok(savedOrder);
    }

    private boolean isNextDeliveryStatus(
            String current,
            String requested) {

        return (
                "PROCESSING".equals(current)
                        && "SHIPPED".equals(requested)
        )
                || (
                "SHIPPED".equals(current)
                        && "OUT_FOR_DELIVERY".equals(requested)
        )
                || (
                "OUT_FOR_DELIVERY".equals(current)
                        && "DELIVERED".equals(requested)
        );
    }
}