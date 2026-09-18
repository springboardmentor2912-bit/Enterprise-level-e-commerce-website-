package com.shopstack.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.shopstack.dto.*;
import com.shopstack.entity.*;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.*;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReturnServiceImpl implements ReturnService {

    private static final Logger logger = LoggerFactory.getLogger(ReturnServiceImpl.class);

    /** Return window in days from order creation date */
    private static final int RETURN_WINDOW_DAYS = 7;

    @Value("${razorpay.key.id:rzp_test_placeholder}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:placeholder_secret}")
    private String razorpayKeySecret;

    private final ReturnRequestRepository returnRequestRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CustomerRepository customerRepository;
    private final PaymentRepository paymentRepository;
    private final WarehouseRepository warehouseRepository;
    private final WarehouseInventoryRepository warehouseInventoryRepository;
    private final ProductRepository productRepository;
    private final StockMovementLogRepository stockMovementLogRepository;
    private final InventoryHistoryRepository inventoryHistoryRepository;
    private final NotificationService notificationService;

    public ReturnServiceImpl(ReturnRequestRepository returnRequestRepository,
                             OrderRepository orderRepository,
                             OrderItemRepository orderItemRepository,
                             CustomerRepository customerRepository,
                             PaymentRepository paymentRepository,
                             WarehouseRepository warehouseRepository,
                             WarehouseInventoryRepository warehouseInventoryRepository,
                             ProductRepository productRepository,
                             StockMovementLogRepository stockMovementLogRepository,
                             InventoryHistoryRepository inventoryHistoryRepository,
                             NotificationService notificationService) {
        this.returnRequestRepository = returnRequestRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.customerRepository = customerRepository;
        this.paymentRepository = paymentRepository;
        this.warehouseRepository = warehouseRepository;
        this.warehouseInventoryRepository = warehouseInventoryRepository;
        this.productRepository = productRepository;
        this.stockMovementLogRepository = stockMovementLogRepository;
        this.inventoryHistoryRepository = inventoryHistoryRepository;
        this.notificationService = notificationService;
    }

    // ─── Customer: Submit Return Request ──────────────────────────────────

    @Override
    @Transactional
    public ReturnRequestDTO requestReturn(String customerEmail, Long orderItemId, CreateReturnRequestDto request) {
        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerEmail));

        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found with ID: " + orderItemId));

        Order order = orderItem.getOrder();
        if (order == null) {
            throw new ResourceNotFoundException("Order not found for this order item.");
        }

        // 1. Verify order belongs to the logged-in customer
        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalStateException("Access denied: This order does not belong to you.");
        }

        // 2. Verify order is DELIVERED
        if (!OrderStatus.DELIVERED.equals(order.getStatus())) {
            throw new IllegalStateException("Return can only be requested for DELIVERED orders. Current status: " + order.getStatus());
        }

        // 3. Verify return window (7 days from order date)
        LocalDateTime returnDeadline = order.getCreatedAt().plusDays(RETURN_WINDOW_DAYS);
        if (LocalDateTime.now().isAfter(returnDeadline)) {
            throw new IllegalStateException(
                "Return window has expired. Returns must be requested within " + RETURN_WINDOW_DAYS +
                " days of order placement. Order date: " + order.getCreatedAt().toLocalDate());
        }

        // 4. Prevent duplicate active return for same order item
        List<ReturnStatus> activeStatuses = Arrays.asList(
            ReturnStatus.RETURN_REQUESTED,
            ReturnStatus.RETURN_APPROVED,
            ReturnStatus.PRODUCT_RETURNED,
            ReturnStatus.RETURN_RECEIVED,
            ReturnStatus.RETURN_ACCEPTED,
            ReturnStatus.REFUND_INITIATED,
            ReturnStatus.REFUNDED
        );
        if (returnRequestRepository.existsByOrderItemIdAndReturnStatusIn(orderItem.getId(), activeStatuses)) {
            throw new IllegalStateException("A return request for this item already exists. Duplicate requests are not allowed.");
        }

        // 5. Validate quantity
        if (request.getQuantity() > orderItem.getQuantity()) {
            throw new IllegalArgumentException(
                "Return quantity (" + request.getQuantity() + ") cannot exceed ordered quantity (" + orderItem.getQuantity() + ").");
        }

        // 6. Calculate refund amount based on actual amount paid for the returned item after discounts/coupons
        BigDecimal itemGrossPrice = orderItem.getPriceAtPurchase()
                .multiply(BigDecimal.valueOf(request.getQuantity()));

        BigDecimal refundAmount;
        BigDecimal grossAmount = order.getGrossAmount();
        BigDecimal totalAmount = order.getTotalAmount();

        if (grossAmount != null && grossAmount.compareTo(BigDecimal.ZERO) > 0 && totalAmount != null) {
            // Proportional refund after discount: itemGross * (totalAmount / grossAmount)
            refundAmount = itemGrossPrice.multiply(totalAmount)
                    .divide(grossAmount, 2, RoundingMode.HALF_UP);
        } else {
            refundAmount = itemGrossPrice.setScale(2, RoundingMode.HALF_UP);
        }

        // Cap refund amount so it does not exceed total order amount paid
        if (totalAmount != null && refundAmount.compareTo(totalAmount) > 0) {
            refundAmount = totalAmount;
        }

        // 7. Create the return request
        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setOrder(order);
        returnRequest.setOrderItem(orderItem);
        returnRequest.setCustomer(customer);
        returnRequest.setQuantity(request.getQuantity());
        returnRequest.setReason(request.getReason());
        returnRequest.setReturnStatus(ReturnStatus.RETURN_REQUESTED);
        returnRequest.setRefundAmount(refundAmount);

        // Transition order to RETURNED status to reflect pending return
        order.setStatus(OrderStatus.RETURNED);
        orderRepository.save(order);

        ReturnRequest saved = returnRequestRepository.save(returnRequest);
        logger.info("Return request #{} created by customer {} for order item {}", saved.getId(), customerEmail, orderItemId);
        return new ReturnRequestDTO(saved);
    }

    // ─── Customer: View My Returns ─────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<ReturnRequestDTO> getMyReturns(String customerEmail) {
        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerEmail));

        return returnRequestRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId())
                .stream().map(ReturnRequestDTO::new).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReturnRequestDTO getReturnStatusForOrderItem(String customerEmail, Long orderItemId) {
        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerEmail));

        ReturnRequest r = returnRequestRepository.findByOrderItemId(orderItemId)
                .orElseThrow(() -> new ResourceNotFoundException("No return request found for order item: " + orderItemId));

        // Security check: ensure customer owns this return request
        if (!r.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalStateException("Access denied: This return request does not belong to you.");
        }

        return new ReturnRequestDTO(r);
    }

    // ─── Admin: View All Returns ───────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<ReturnRequestDTO> getAllReturnRequests() {
        return returnRequestRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(ReturnRequestDTO::new).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReturnRequestDTO getReturnRequestById(Long returnId) {
        ReturnRequest r = returnRequestRepository.findById(returnId)
                .orElseThrow(() -> new ResourceNotFoundException("Return request not found with ID: " + returnId));
        return new ReturnRequestDTO(r);
    }

    // ─── Admin: Approve or Reject ──────────────────────────────────────────

    @Override
    @Transactional
    public ReturnRequestDTO reviewReturn(Long returnId, AdminReturnActionRequest request) {
        ReturnRequest r = returnRequestRepository.findById(returnId)
                .orElseThrow(() -> new ResourceNotFoundException("Return request not found with ID: " + returnId));

        if (!ReturnStatus.RETURN_REQUESTED.equals(r.getReturnStatus())) {
            throw new IllegalStateException(
                "Only RETURN_REQUESTED returns can be reviewed. Current status: " + r.getReturnStatus());
        }

        String action = request.getAction() != null ? request.getAction().toUpperCase() : "";

        if ("APPROVE".equals(action)) {
            r.setReturnStatus(ReturnStatus.RETURN_APPROVED);
            logger.info("Return request #{} APPROVED by admin.", returnId);
        } else if ("REJECT".equals(action)) {
            r.setReturnStatus(ReturnStatus.RETURN_REJECTED);
            // Revert order back to DELIVERED on rejection
            Order order = r.getOrder();
            order.setStatus(OrderStatus.DELIVERED);
            orderRepository.save(order);
            logger.info("Return request #{} REJECTED by admin. Order {} reverted to DELIVERED.", returnId, order.getId());
        } else {
            throw new IllegalArgumentException("Invalid action '" + request.getAction() + "'. Must be APPROVE or REJECT.");
        }

        if (request.getAdminNotes() != null) {
            r.setAdminNotes(request.getAdminNotes());
        }

        return new ReturnRequestDTO(returnRequestRepository.save(r));
    }

    // ─── Admin: Mark Product Received + Inventory Decision (Restricted) ───

    @Override
    @Transactional
    public ReturnRequestDTO receiveReturn(Long returnId, AdminReceiveReturnRequest request) {
        throw new IllegalStateException("Admin is not permitted to perform Quality Control (QC). Quality Control must be executed by assigned Warehouse Staff upon product intake.");
    }

    protected RazorpayClient createRazorpayClient() throws RazorpayException {
        return new RazorpayClient(razorpayKeyId, razorpayKeySecret);
    }

    protected com.razorpay.Payment fetchRazorpayPayment(RazorpayClient razorpayClient, String razorpayPaymentId) throws RazorpayException {
        return razorpayClient.payments.fetch(razorpayPaymentId);
    }

    protected com.razorpay.Refund executeRazorpayRefund(RazorpayClient razorpayClient, String razorpayPaymentId, JSONObject refundRequest) throws RazorpayException {
        return razorpayClient.payments.refund(razorpayPaymentId, refundRequest);
    }

    @Override
    @Transactional
    public ReturnRequestDTO initiateRefund(Long returnId) {
        ReturnRequest r = returnRequestRepository.findById(returnId)
                .orElseThrow(() -> new ResourceNotFoundException("Return request not found with ID: " + returnId));

        // 7. Prevent duplicate refunds
        if (ReturnStatus.REFUNDED.equals(r.getReturnStatus()) || (r.getRazorpayRefundId() != null && !r.getRazorpayRefundId().isBlank())) {
            throw new IllegalStateException("Return request #" + returnId + " has already been refunded.");
        }

        if (!ReturnStatus.RETURN_ACCEPTED.equals(r.getReturnStatus()) && !ReturnStatus.REFUND_FAILED.equals(r.getReturnStatus())) {
            throw new IllegalStateException(
                "Refund can only be initiated when return status is RETURN_ACCEPTED. Current status: " + r.getReturnStatus());
        }

        Order order = r.getOrder();

        // 1. Find the actual Razorpay payment ID associated with the order
        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "No payment record found for Order #" + order.getId() + ". Refund cannot be processed."));

        if (payment.getRazorpayPaymentId() == null || payment.getRazorpayPaymentId().isBlank()) {
            throw new IllegalStateException(
                "No Razorpay Payment ID found for Order #" + order.getId() + ". This order may not have been paid via Razorpay.");
        }

        // Mark as REFUND_INITIATED before calling Razorpay
        r.setReturnStatus(ReturnStatus.REFUND_INITIATED);
        payment.setStatus(PaymentStatus.REFUND_INITIATED);
        paymentRepository.save(payment);
        returnRequestRepository.save(r);

        BigDecimal requestedRefundAmount = r.getRefundAmount();
        if (requestedRefundAmount == null || requestedRefundAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid refund amount: " + requestedRefundAmount);
        }

        long requestedAmountInPaise = requestedRefundAmount
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValue();

        try {
            RazorpayClient razorpayClient = createRazorpayClient();

            // 2. Retrieve/verify the actual captured payment amount and amount already refunded from Razorpay
            com.razorpay.Payment rzpPayment = fetchRazorpayPayment(razorpayClient, payment.getRazorpayPaymentId());

            long capturedAmountInPaise = 0L;
            if (rzpPayment != null && rzpPayment.get("amount") != null) {
                capturedAmountInPaise = ((Number) rzpPayment.get("amount")).longValue();
            } else if (payment.getAmount() != null) {
                capturedAmountInPaise = payment.getAmount().multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValue();
            }

            long rzpAlreadyRefundedInPaise = 0L;
            if (rzpPayment != null && rzpPayment.get("amount_refunded") != null) {
                rzpAlreadyRefundedInPaise = ((Number) rzpPayment.get("amount_refunded")).longValue();
            }

            // Also calculate total already refunded in local DB for this order (from other completed return requests)
            List<ReturnRequest> orderReturns = returnRequestRepository.findByOrderIdOrderByCreatedAtDesc(order.getId());
            BigDecimal dbRefundedSum = BigDecimal.ZERO;
            for (ReturnRequest existingReturn : orderReturns) {
                if (!existingReturn.getId().equals(returnId) && ReturnStatus.REFUNDED.equals(existingReturn.getReturnStatus())) {
                    if (existingReturn.getRefundAmount() != null) {
                        dbRefundedSum = dbRefundedSum.add(existingReturn.getRefundAmount());
                    }
                }
            }
            long dbRefundedInPaise = dbRefundedSum.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValue();
            long totalAlreadyRefundedInPaise = Math.max(rzpAlreadyRefundedInPaise, dbRefundedInPaise);

            // 4. Calculate the remaining refundable amount
            long remainingRefundableInPaise = Math.max(0L, capturedAmountInPaise - totalAlreadyRefundedInPaise);

            // 5 & 8. Allow refund only when requested amount <= remaining refundable amount.
            // If requested refund is greater than remaining refundable amount, return clear error.
            if (requestedAmountInPaise > remainingRefundableInPaise) {
                BigDecimal remainingRefundableRupees = BigDecimal.valueOf(remainingRefundableInPaise)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                BigDecimal capturedRupees = BigDecimal.valueOf(capturedAmountInPaise)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                BigDecimal refundedRupees = BigDecimal.valueOf(totalAlreadyRefundedInPaise)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                String errorMsg = String.format(
                    "Cannot process refund of ₹%.2f. The requested refund amount is greater than the remaining refundable amount of ₹%.2f for Order #%d (Captured payment: ₹%.2f, Already refunded: ₹%.2f).",
                    requestedRefundAmount, remainingRefundableRupees, order.getId(), capturedRupees, refundedRupees);

                // Reset statuses before failing
                r.setReturnStatus(ReturnStatus.RETURN_ACCEPTED);
                r.setRefundFailureReason(errorMsg);
                payment.setStatus(PaymentStatus.PAID);
                paymentRepository.save(payment);
                returnRequestRepository.save(r);

                throw new IllegalStateException(errorMsg);
            }

            // 6. Use paise correctly when calling Razorpay
            JSONObject refundRequest = new JSONObject();
            refundRequest.put("amount", requestedAmountInPaise);
            refundRequest.put("notes", new JSONObject()
                    .put("return_id", returnId.toString())
                    .put("order_id", order.getId().toString())
                    .put("reason", "Customer return approved"));

            com.razorpay.Refund razorpayRefund = executeRazorpayRefund(razorpayClient, payment.getRazorpayPaymentId(), refundRequest);

            String razorpayRefundId = razorpayRefund.get("id");
            String refundStatus = razorpayRefund.get("status");

            logger.info("Razorpay refund response: refundId={}, status={}, amount={} paise",
                    razorpayRefundId, refundStatus, requestedAmountInPaise);

            // 9. Store the Razorpay refund ID and status
            r.setRazorpayRefundId(razorpayRefundId);

            // 10. Update Order status to REFUNDED only after successful processing
            if ("processed".equalsIgnoreCase(refundStatus) || "created".equalsIgnoreCase(refundStatus)) {
                r.setReturnStatus(ReturnStatus.REFUNDED);
                payment.setStatus(PaymentStatus.REFUNDED);
                order.setStatus(OrderStatus.REFUNDED);
                orderRepository.save(order);
                logger.info("Refund processed successfully for Return #{}, Order #{}", returnId, order.getId());

                notificationService.sendRefundCompletedEmail(order, r);
            } else {
                r.setReturnStatus(ReturnStatus.REFUND_INITIATED);
            }

        } catch (IllegalStateException e) {
            // Rethrow validation exceptions directly
            throw e;
        } catch (RazorpayException e) {
            logger.error("Razorpay refund failed for Return #{}: {}", returnId, e.getMessage(), e);
            r.setReturnStatus(ReturnStatus.REFUND_FAILED);
            r.setRefundFailureReason("Razorpay API Error: " + e.getMessage());
            payment.setStatus(PaymentStatus.REFUND_FAILED);
            paymentRepository.save(payment);
            returnRequestRepository.save(r);
            throw new RuntimeException("Refund failed via Razorpay: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error during refund for Return #{}: {}", returnId, e.getMessage(), e);
            r.setReturnStatus(ReturnStatus.REFUND_FAILED);
            r.setRefundFailureReason("Unexpected error: " + e.getMessage());
            payment.setStatus(PaymentStatus.REFUND_FAILED);
            paymentRepository.save(payment);
            returnRequestRepository.save(r);
            throw new RuntimeException("Refund processing error: " + e.getMessage(), e);
        }

        paymentRepository.save(payment);
        return new ReturnRequestDTO(returnRequestRepository.save(r));
    }
}
