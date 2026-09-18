package com.shopstack.shopstack_backend.service.impl;

import com.shopstack.shopstack_backend.constant.OrderStatus;
import com.shopstack.shopstack_backend.dto.request.RefundRequest;
import com.shopstack.shopstack_backend.dto.response.RefundResponse;
import com.shopstack.shopstack_backend.entity.Order;
import com.shopstack.shopstack_backend.entity.Refund;
import com.shopstack.shopstack_backend.notification.EmailNotificationService;
import com.shopstack.shopstack_backend.repository.OrderRepository;
import com.shopstack.shopstack_backend.repository.RefundRepository;
import com.shopstack.shopstack_backend.service.RefundService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RefundServiceImpl implements RefundService {

    private final RefundRepository refundRepository;
    private final OrderRepository orderRepository;
    private final EmailNotificationService emailNotificationService;

    public RefundServiceImpl(
            RefundRepository refundRepository,
            OrderRepository orderRepository,
            EmailNotificationService emailNotificationService) {

        this.refundRepository = refundRepository;
        this.orderRepository = orderRepository;
        this.emailNotificationService = emailNotificationService;
    }

    // =========================
    // PROCESS REFUND
    // =========================

    @Override
    @Transactional
    public RefundResponse processRefund(
            Long orderId,
            RefundRequest request) {

        Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"
                                )
                        );

        // =========================
        // CHECK ORDER STATUS
        // =========================

        if (order.getStatus() != OrderStatus.RETURNED) {

            throw new RuntimeException(
                    "Only returned orders can be refunded"
            );
        }

        // =========================
        // CHECK EXISTING REFUND
        // =========================

        if (refundRepository.existsByOrder(order)) {

            throw new RuntimeException(
                    "Refund already exists for this order"
            );
        }

        // =========================
        // CREATE REFUND
        // =========================

        Refund refund = new Refund();

        refund.setOrder(order);

        refund.setRefundAmount(
                order.getTotalAmount()
        );

        refund.setReason(
                request.getReason()
        );

        refund.setStatus(
                "REFUNDED"
        );

        refund.setRefundedAt(
                LocalDateTime.now()
        );

        Refund savedRefund =
                refundRepository.save(refund);

        // =========================
        // UPDATE ORDER STATUS
        // =========================

        order.setStatus(
                OrderStatus.REFUNDED
        );

        orderRepository.save(order);

        // =========================
        // REFUND COMPLETED EMAIL
        // =========================

        sendRefundEmail(savedRefund);

        return convertToResponse(savedRefund);
    }

    // =========================
    // SEND REFUND EMAIL
    // =========================

    private void sendRefundEmail(
            Refund refund) {

        Order order = refund.getOrder();

        if (order == null ||
                order.getCustomerEmail() == null ||
                order.getCustomerEmail().isBlank()) {

            return;
        }

        StringBuilder body =
                new StringBuilder();

        body.append("Hello,\n\n");

        body.append(
                "Your ShopStack refund has been completed successfully.\n\n"
        );

        body.append("Refund Details\n");
        body.append("------------------------------\n");

        body.append("Order ID: ")
                .append(order.getId())
                .append("\n");

        body.append("Refund Amount: ₹")
                .append(refund.getRefundAmount())
                .append("\n");

        body.append("Refund Status: ")
                .append(refund.getStatus())
                .append("\n");

        body.append("Refund Date: ")
                .append(refund.getRefundedAt())
                .append("\n");

        if (refund.getReason() != null &&
                !refund.getReason().isBlank()) {

            body.append("Reason: ")
                    .append(refund.getReason())
                    .append("\n");
        }

        body.append(
                "\nThe refund has been processed for your order.\n"
        );

        body.append(
                "\nThank you for shopping with ShopStack.\n"
        );

        emailNotificationService.sendEmail(
                order.getCustomerEmail(),
                "ShopStack - Refund Completed",
                body.toString()
        );
    }

    // =========================
    // GET REFUND BY ID
    // =========================

    @Override
    @Transactional(readOnly = true)
    public RefundResponse getRefundById(Long id) {

        Refund refund =
                refundRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Refund not found"
                                )
                        );

        return convertToResponse(refund);
    }

    // =========================
    // GET REFUND BY ORDER ID
    // =========================

    @Override
    @Transactional(readOnly = true)
    public RefundResponse getRefundByOrderId(
            Long orderId) {

        Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"
                                )
                        );

        Refund refund =
                refundRepository.findByOrder(order)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Refund not found for this order"
                                )
                        );

        return convertToResponse(refund);
    }

    // =========================
    // GET ALL REFUNDS
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<RefundResponse> getAllRefunds() {

        return refundRepository
                .findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =========================
    // CONVERT TO RESPONSE
    // =========================

    private RefundResponse convertToResponse(
            Refund refund) {

        return new RefundResponse(
                refund.getId(),
                refund.getOrder().getId(),
                refund.getRefundAmount(),
                refund.getReason(),
                refund.getStatus(),
                refund.getRefundedAt()
        );
    }
}