package com.infosys.springboard.authentication.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.springboard.authentication.dto.RefundRequest;
import com.infosys.springboard.authentication.entity.Order;
import com.infosys.springboard.authentication.entity.Refund;
import com.infosys.springboard.authentication.repository.OrderRepository;
import com.infosys.springboard.authentication.repository.RefundRepository;

@Service
public class RefundService {

    private final RefundRepository refundRepository;
    private final OrderRepository orderRepository;

    public RefundService(
            RefundRepository refundRepository,
            OrderRepository orderRepository) {

        this.refundRepository = refundRepository;
        this.orderRepository = orderRepository;
    }

    // =========================================================
    // CREATE REFUND REQUEST
    // =========================================================

    @Transactional
    public Refund createRefund(RefundRequest request) {

        if (request.getOrderId() == null) {
            throw new RuntimeException(
                    "Order ID is required");
        }

        if (request.getCustomerEmail() == null
                || request.getCustomerEmail().isBlank()) {

            throw new RuntimeException(
                    "Customer email is required");
        }

        if (request.getAmount() == null
                || request.getAmount() <= 0) {

            throw new RuntimeException(
                    "Refund amount must be greater than zero");
        }

        if (request.getReason() == null
                || request.getReason().isBlank()) {

            throw new RuntimeException(
                    "Refund reason is required");
        }

        // =====================================================
        // CHECK ORDER EXISTS
        // =====================================================

        Order order = orderRepository.findById(
                request.getOrderId()
        ).orElseThrow(() ->
                new RuntimeException(
                        "Order not found"));

        // =====================================================
        // CHECK CUSTOMER OWNS ORDER
        // =====================================================

        if (order.getCustomerEmail() == null
                || !order.getCustomerEmail()
                        .equalsIgnoreCase(
                                request.getCustomerEmail())) {

            throw new RuntimeException(
                    "This order does not belong to the customer");
        }

        // =====================================================
        // PREVENT DUPLICATE REFUND
        // =====================================================

        if (refundRepository
                .findByOrderId(request.getOrderId())
                .isPresent()) {

            throw new RuntimeException(
                    "Refund request already exists for this order");
        }

        Refund refund =
                Refund.builder()
                        .orderId(request.getOrderId())
                        .customerEmail(
                                request.getCustomerEmail())
                        .amount(request.getAmount())
                        .reason(request.getReason())
                        .status("REQUESTED")
                        .requestedAt(
                                LocalDateTime.now())
                        .build();

        return refundRepository.save(refund);
    }

    // =========================================================
    // GET ALL REFUNDS
    // =========================================================

    public List<Refund> getAllRefunds() {

        return refundRepository.findAll();
    }

    // =========================================================
    // GET REFUND BY ID
    // =========================================================

    public Refund getRefundById(Long id) {

        return refundRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Refund not found"));
    }

    // =========================================================
    // GET REFUND BY ORDER
    // =========================================================

    public Refund getRefundByOrderId(Long orderId) {

        return refundRepository
                .findByOrderId(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Refund not found for order"));
    }

    // =========================================================
    // GET CUSTOMER REFUNDS
    // =========================================================

    public List<Refund> getRefundsByCustomer(
            String customerEmail) {

        return refundRepository
                .findByCustomerEmail(customerEmail);
    }

    // =========================================================
    // GET REFUNDS BY STATUS
    // =========================================================

    public List<Refund> getRefundsByStatus(
            String status) {

        return refundRepository
                .findByStatus(status.toUpperCase());
    }

    // =========================================================
    // APPROVE REFUND
    // =========================================================

    @Transactional
    public Refund approveRefund(
            Long id,
            String remarks) {

        Refund refund =
                getRefundById(id);

        if (!"REQUESTED".equals(refund.getStatus())) {

            throw new RuntimeException(
                    "Only REQUESTED refunds can be approved");
        }

        refund.setStatus("APPROVED");

        if (remarks != null
                && !remarks.isBlank()) {

            refund.setRemarks(remarks);
        }

        refund.setProcessedAt(
                LocalDateTime.now());

        return refundRepository.save(refund);
    }

    // =========================================================
    // REJECT REFUND
    // =========================================================

    @Transactional
    public Refund rejectRefund(
            Long id,
            String remarks) {

        Refund refund =
                getRefundById(id);

        if (!"REQUESTED".equals(refund.getStatus())) {

            throw new RuntimeException(
                    "Only REQUESTED refunds can be rejected");
        }

        refund.setStatus("REJECTED");

        if (remarks != null
                && !remarks.isBlank()) {

            refund.setRemarks(remarks);
        }

        refund.setProcessedAt(
                LocalDateTime.now());

        return refundRepository.save(refund);
    }

    // =========================================================
    // COMPLETE REFUND
    // =========================================================

    @Transactional
    public Refund completeRefund(
            Long id,
            String remarks) {

        Refund refund =
                getRefundById(id);

        if (!"APPROVED".equals(refund.getStatus())) {

            throw new RuntimeException(
                    "Only APPROVED refunds can be completed");
        }

        refund.setStatus("COMPLETED");

        if (remarks != null
                && !remarks.isBlank()) {

            refund.setRemarks(remarks);
        }

        refund.setProcessedAt(
                LocalDateTime.now());

        // =====================================================
        // UPDATE ORDER STATUS
        // =====================================================

        Order order =
                orderRepository.findById(
                        refund.getOrderId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Order not found for refund"));

        order.setStatus("REFUNDED");

        orderRepository.save(order);

        return refundRepository.save(refund);
    }
}