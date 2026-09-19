package com.shopstack.backend.service;

import com.razorpay.Refund;
import com.shopstack.backend.dto.CreateReturnRequest;
import com.shopstack.backend.dto.ReturnActionRequest;
import com.shopstack.backend.dto.ReturnInspectionRequest;
import com.shopstack.backend.dto.ReturnRequestResponse;
import com.shopstack.backend.entity.Order;
import com.shopstack.backend.entity.OrderItem;
import com.shopstack.backend.entity.OrderStatus;
import com.shopstack.backend.entity.Product;
import com.shopstack.backend.entity.ReturnRequest;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.enums.ReturnCondition;
import com.shopstack.backend.enums.ReturnStatus;
import com.shopstack.backend.repository.OrderRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.ReturnRequestRepository;
import com.shopstack.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;



import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReturnRequestService {

    private static final int RETURN_WINDOW_DAYS = 7;

    private final ReturnRequestRepository returnRequestRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PaymentService paymentService;
    private final NotificationService notificationService;

    public ReturnRequestService(
            ReturnRequestRepository returnRequestRepository,
            OrderRepository orderRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            PaymentService paymentService,
            NotificationService notificationService
    ) {
        this.returnRequestRepository = returnRequestRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.paymentService = paymentService;
        this.notificationService = notificationService;
    }

    // =========================================================
    // CUSTOMER - CREATE RETURN REQUEST
    // =========================================================

    @Transactional
    public ReturnRequestResponse createReturnRequest(
            String email,
            CreateReturnRequest request
    ) {
        if (request == null || request.getOrderId() == null || request.getProductId() == null) {
            throw new RuntimeException("Order and product are required");
        }

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new RuntimeException("Return quantity must be greater than zero");
        }

        if (request.getReason() == null || request.getReason().trim().isEmpty()) {
            throw new RuntimeException("Return reason is required");
        }

        User customer = findUser(email);
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(customer.getId())) {
            throw new RuntimeException("You are not allowed to return this order");
        }

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Only delivered orders are eligible for return");
        }

        LocalDateTime deliveryDate = order.getDeliveredAt() != null
                ? order.getDeliveredAt()
                : order.getOrderDate();

        if (deliveryDate == null || LocalDateTime.now().isAfter(deliveryDate.plusDays(RETURN_WINDOW_DAYS))) {
            throw new RuntimeException("Return window has expired");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        OrderItem orderItem = findOrderItem(order, product.getId());
        if (orderItem == null) {
            throw new RuntimeException("This product does not belong to the order");
        }

        if (request.getQuantity() > orderItem.getQuantity()) {
            throw new RuntimeException("Return quantity cannot exceed purchased quantity");
        }

        if (returnRequestRepository.existsByOrderAndProduct(order, product)) {
            throw new RuntimeException("A return request already exists for this product");
        }

        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setOrder(order);
        returnRequest.setProduct(product);
        returnRequest.setCustomer(customer);
        returnRequest.setQuantity(request.getQuantity());
        returnRequest.setReason(request.getReason().trim());
        returnRequest.setStatus(ReturnStatus.REQUESTED);
        returnRequest.setRequestedAt(LocalDateTime.now());
        returnRequest.setInventoryRestocked(false);

        returnRequestRepository.save(returnRequest);
        return toResponse(returnRequest);
    }

    // =========================================================
    // CUSTOMER - VIEW OWN RETURNS
    // =========================================================

    public List<ReturnRequestResponse> getCustomerReturns(String email) {
        User customer = findUser(email);
        List<ReturnRequestResponse> responses = new ArrayList<>();
        for (ReturnRequest request : returnRequestRepository.findByCustomerOrderByRequestedAtDesc(customer)) {
            responses.add(toResponse(request));
        }
        return responses;
    }

    public ReturnRequestResponse getCustomerReturn(String email, Long id) {
        User customer = findUser(email);
        ReturnRequest request = getReturn(id);
        if (!request.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("You are not allowed to view this return request");
        }
        return toResponse(request);
    }

    // =========================================================
    // CUSTOMER - CONFIRM PRODUCT RETURNED
    // =========================================================

    @Transactional
    public ReturnRequestResponse markReturned(String email, Long id) {
        User customer = findUser(email);
        ReturnRequest request = getReturn(id);
        assertCustomer(request, customer);

        if (request.getStatus() != ReturnStatus.APPROVED) {
            throw new RuntimeException("Only an approved return can be marked as returned");
        }

        request.setStatus(ReturnStatus.RETURNED);
        request.setReturnedAt(LocalDateTime.now());
        return toResponse(returnRequestRepository.save(request));
    }

    // =========================================================
    // ADMIN - VIEW RETURNS
    // =========================================================

    public List<ReturnRequestResponse> getAllReturns() {
        List<ReturnRequestResponse> responses = new ArrayList<>();
        for (ReturnRequest request : returnRequestRepository.findAllByOrderByRequestedAtDesc()) {
            responses.add(toResponse(request));
        }
        return responses;
    }

    public ReturnRequestResponse getReturnById(Long id) {
        return toResponse(getReturn(id));
    }

    // =========================================================
    // ADMIN - APPROVE
    // =========================================================

    @Transactional
    public ReturnRequestResponse approve(Long id, ReturnActionRequest action) {
        ReturnRequest request = getReturn(id);
        if (request.getStatus() != ReturnStatus.REQUESTED) {
            throw new RuntimeException("Only requested returns can be approved");
        }

        request.setStatus(ReturnStatus.APPROVED);
        request.setApprovedAt(LocalDateTime.now());
        request.setAdminComment(comment(action));
        return toResponse(returnRequestRepository.save(request));
    }

    // =========================================================
    // ADMIN - REJECT BEFORE RETURN
    // =========================================================

    @Transactional
    public ReturnRequestResponse reject(Long id, ReturnActionRequest action) {
        ReturnRequest request = getReturn(id);
        if (request.getStatus() != ReturnStatus.REQUESTED &&
                request.getStatus() != ReturnStatus.APPROVED) {
            throw new RuntimeException("This return cannot be rejected at the current stage");
        }

        request.setStatus(ReturnStatus.REJECTED);
        request.setRejectedAt(LocalDateTime.now());
        request.setAdminComment(comment(action));
        return toResponse(returnRequestRepository.save(request));
    }

    // =========================================================
    // ADMIN - RECEIVE RETURNED PRODUCT
    // =========================================================

    @Transactional
    public ReturnRequestResponse receive(Long id, ReturnActionRequest action) {
        ReturnRequest request = getReturn(id);
        if (request.getStatus() != ReturnStatus.RETURNED) {
            throw new RuntimeException("Product must be marked as returned before it can be received");
        }

        request.setStatus(ReturnStatus.RECEIVED);
        request.setReceivedAt(LocalDateTime.now());
        request.setAdminComment(comment(action));
        return toResponse(returnRequestRepository.save(request));
    }

    // =========================================================
    // ADMIN - INSPECT PRODUCT
    // =========================================================

    @Transactional
    public ReturnRequestResponse inspect(Long id, ReturnInspectionRequest inspection) {
        ReturnRequest request = getReturn(id);
        if (request.getStatus() != ReturnStatus.RECEIVED) {
            throw new RuntimeException("Only received products can be inspected");
        }

        if (inspection == null || inspection.getCondition() == null) {
            throw new RuntimeException("Product condition is required");
        }

        request.setCondition(inspection.getCondition());
        request.setInspectionComment(inspection.getComment());
        request.setInspectedAt(LocalDateTime.now());

        if (inspection.getCondition() == ReturnCondition.SELLABLE) {
            request.setStatus(ReturnStatus.ACCEPTED);
            if (!Boolean.TRUE.equals(request.getInventoryRestocked())) {
                Product product = request.getProduct();
                product.setStock(product.getStock() + request.getQuantity());
                productRepository.save(product);
                request.setInventoryRestocked(true);
            }
            request.getOrder().setStatus(OrderStatus.RETURNED);
            orderRepository.save(request.getOrder());
        } else {
            request.setStatus(ReturnStatus.REJECTED_AFTER_INSPECTION);
            request.getOrder().setStatus(OrderStatus.RETURNED);
            orderRepository.save(request.getOrder());
        }

        return toResponse(returnRequestRepository.save(request));
    }

    // =========================================================
    // ADMIN - INITIATE REFUND
    // =========================================================

    @Transactional
    public ReturnRequestResponse initiateRefund(Long id) {
        ReturnRequest request = getReturn(id);

        if (request.getStatus() != ReturnStatus.ACCEPTED) {
            throw new RuntimeException("Refund can only be initiated after the returned product is accepted");
        }

        if (request.getRefundId() != null) {
            throw new RuntimeException("Refund has already been initiated");
        }

        Order order = request.getOrder();
        double refundAmount = calculateRefundAmount(request);

        if (refundAmount <= 0) {
            throw new RuntimeException("Refund amount must be greater than zero");
        }

        request.setRefundAmount(refundAmount);
        request.setStatus(ReturnStatus.REFUND_INITIATED);
        request.setRefundInitiatedAt(LocalDateTime.now());
        order.setPaymentStatus("REFUND_INITIATED");
        orderRepository.save(order);

        // Razorpay refund is performed after the state is persisted in the
        // same transaction. Any exception rolls the transaction back.
        if ("ONLINE".equalsIgnoreCase(order.getPaymentMethod())) {
            if (order.getRazorpayPaymentId() == null || order.getRazorpayPaymentId().isBlank()) {
                throw new RuntimeException("Razorpay payment ID is missing for this order");
            }

            Refund refund = paymentService.refundPayment(
                    order.getRazorpayPaymentId(),
                    refundAmount,
                    "return_" + request.getId()
            );

            request.setRefundId(String.valueOf(refund.get("id")));
            String gatewayStatus = String.valueOf(refund.get("status"));

            if ("processed".equalsIgnoreCase(gatewayStatus)) {

                request.setStatus(
                        ReturnStatus.REFUNDED
                );

                request.setRefundedAt(
                        LocalDateTime.now()
                );

                order.setPaymentStatus(
                        "REFUNDED"
                );

                order.setStatus(
                        OrderStatus.REFUNDED
                );

                notificationService.notifyCustomerRefundCompleted(
                        request
                );
            }
        } else {
            // COD has no Razorpay payment to refund. This admin action
            // records the manual refund as completed.
            request.setRefundId("MANUAL-COD-" + request.getId());
            request.setStatus(ReturnStatus.REFUNDED);
            request.setRefundedAt(LocalDateTime.now());
            order.setPaymentStatus("REFUNDED");
            order.setStatus(OrderStatus.REFUNDED);

            notificationService.notifyCustomerRefundCompleted(request);
        }

        orderRepository.save(order);
        return toResponse(returnRequestRepository.save(request));
    }

    // =========================================================
    // ADMIN - CHECK GATEWAY REFUND STATUS
    // =========================================================

    @Transactional
    public ReturnRequestResponse refreshRefundStatus(Long id) {
        ReturnRequest request = getReturn(id);

        if (request.getStatus() != ReturnStatus.REFUND_INITIATED || request.getRefundId() == null) {
            throw new RuntimeException("There is no pending gateway refund for this request");
        }

        Order order = request.getOrder();
        if (!"ONLINE".equalsIgnoreCase(order.getPaymentMethod())) {
            throw new RuntimeException("Gateway refund status is only available for online payments");
        }

        Refund refund = paymentService.fetchRefund(
                order.getRazorpayPaymentId(),
                request.getRefundId()
        );

        String status = String.valueOf(refund.get("status"));
        if ("processed".equalsIgnoreCase(status)) {

            request.setStatus(
                    ReturnStatus.REFUNDED
            );

            request.setRefundedAt(
                    LocalDateTime.now()
            );

            order.setPaymentStatus(
                    "REFUNDED"
            );

            order.setStatus(
                    OrderStatus.REFUNDED
            );

            orderRepository.save(
                    order
            );

            notificationService.notifyCustomerRefundCompleted(
                    request
            );
        }

        return toResponse(returnRequestRepository.save(request));
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private ReturnRequest getReturn(Long id) {
        return returnRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Return request not found"));
    }

    private void assertCustomer(ReturnRequest request, User customer) {
        if (!request.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("You are not allowed to modify this return request");
        }
    }

    private OrderItem findOrderItem(Order order, Long productId) {
        for (OrderItem item : order.getItems()) {
            if (item.getProduct().getId().equals(productId)) {
                return item;
            }
        }
        return null;
    }

    private String comment(ReturnActionRequest action) {
        return action == null ? null : action.getComment();
    }

    private double calculateRefundAmount(ReturnRequest request) {
        Order order = request.getOrder();
        double grossOrderAmount = 0.0;
        double requestedItemGross = 0.0;

        for (OrderItem item : order.getItems()) {
            double gross = item.getPrice() * item.getQuantity();
            grossOrderAmount += gross;
            if (item.getProduct().getId().equals(request.getProduct().getId())) {
                requestedItemGross = item.getPrice() * request.getQuantity();
            }
        }

        if (grossOrderAmount <= 0) {
            return 0;
        }

        // Allocate the actual amount paid proportionally across items so a
        // coupon/discount cannot accidentally cause an over-refund.
        double allocated = order.getTotalAmount() * requestedItemGross / grossOrderAmount;

        double alreadyRefunded = 0.0;
        for (ReturnRequest other : returnRequestRepository.findByOrderOrderByRequestedAtDesc(order)) {
            if (other.getId().equals(request.getId())) {
                continue;
            }
            if (other.getStatus() == ReturnStatus.REFUND_INITIATED ||
                    other.getStatus() == ReturnStatus.REFUNDED) {
                alreadyRefunded += other.getRefundAmount() == null ? 0.0 : other.getRefundAmount();
            }
        }

        double remaining = Math.max(0.0, order.getTotalAmount() - alreadyRefunded);
        return Math.round(Math.min(allocated, remaining) * 100.0) / 100.0;
    }

    private ReturnRequestResponse toResponse(ReturnRequest request) {
        ReturnRequestResponse response = new ReturnRequestResponse();
        response.setId(request.getId());
        response.setOrderId(request.getOrder().getId());
        response.setProductId(request.getProduct().getId());
        response.setProductName(request.getProduct().getName());
        response.setImageUrl(request.getProduct().getImageUrl());
        response.setCustomerId(request.getCustomer().getId());
        response.setCustomerName(request.getCustomer().getName());
        response.setCustomerEmail(request.getCustomer().getEmail());
        response.setQuantity(request.getQuantity());
        response.setReason(request.getReason());
        response.setStatus(request.getStatus().name());
        response.setCondition(request.getCondition() == null ? null : request.getCondition().name());
        response.setAdminComment(request.getAdminComment());
        response.setInspectionComment(request.getInspectionComment());
        response.setRefundAmount(request.getRefundAmount());
        response.setRefundId(request.getRefundId());
        response.setInventoryRestocked(request.getInventoryRestocked());
        response.setRequestedAt(request.getRequestedAt());
        response.setApprovedAt(request.getApprovedAt());
        response.setReturnedAt(request.getReturnedAt());
        response.setReceivedAt(request.getReceivedAt());
        response.setInspectedAt(request.getInspectedAt());
        response.setRefundInitiatedAt(request.getRefundInitiatedAt());
        response.setRefundedAt(request.getRefundedAt());
        response.setOrderStatus(request.getOrder().getStatus().name());
        response.setPaymentStatus(request.getOrder().getPaymentStatus());
        return response;
    }
}
