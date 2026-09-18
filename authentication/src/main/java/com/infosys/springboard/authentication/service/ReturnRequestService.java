package com.infosys.springboard.authentication.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.springboard.authentication.dto.RefundRequest;
import com.infosys.springboard.authentication.entity.Order;
import com.infosys.springboard.authentication.entity.ReturnRequest;
import com.infosys.springboard.authentication.entity.Refund;
import com.infosys.springboard.authentication.repository.OrderRepository;
import com.infosys.springboard.authentication.repository.ReturnRequestRepository;

@Service
public class ReturnRequestService {

    private final ReturnRequestRepository returnRequestRepository;
    private final InventoryService inventoryService;
    private final RefundService refundService;
    private final OrderRepository orderRepository;

    public ReturnRequestService(
            ReturnRequestRepository returnRequestRepository,
            InventoryService inventoryService,
            RefundService refundService,
            OrderRepository orderRepository) {

        this.returnRequestRepository = returnRequestRepository;
        this.inventoryService = inventoryService;
        this.refundService = refundService;
        this.orderRepository = orderRepository;
    }

    // =========================================================
    // CREATE RETURN REQUEST
    // =========================================================

    @Transactional
    public ReturnRequest createReturnRequest(ReturnRequest request) {

        if (request.getOrderId() == null) {
            throw new RuntimeException("Order ID is required");
        }

        if (request.getProductId() == null) {
            throw new RuntimeException("Product ID is required");
        }

        if (request.getCustomerEmail() == null
                || request.getCustomerEmail().isBlank()) {

            throw new RuntimeException(
                    "Customer email is required");
        }

        if (request.getQuantity() == null
                || request.getQuantity() <= 0) {

            throw new RuntimeException(
                    "Quantity must be greater than zero");
        }

        if (request.getReason() == null
                || request.getReason().isBlank()) {

            throw new RuntimeException(
                    "Return reason is required");
        }

        // =====================================================
        // CHECK ORDER
        // =====================================================

        Order order = orderRepository.findById(
                request.getOrderId()
        ).orElseThrow(() ->
                new RuntimeException(
                        "Order not found"));

        // =====================================================
        // CHECK CUSTOMER OWNERSHIP
        // =====================================================

        if (order.getCustomerEmail() == null
                || !order.getCustomerEmail()
                        .equalsIgnoreCase(
                                request.getCustomerEmail())) {

            throw new RuntimeException(
                    "This order does not belong to the customer");
        }

        // =====================================================
        // DUPLICATE RETURN CHECK
        // =====================================================

        var duplicateRequest =
                returnRequestRepository
                        .findByOrderIdAndProductIdAndCustomerEmail(
                                request.getOrderId(),
                                request.getProductId(),
                                request.getCustomerEmail()
                        );

        if (duplicateRequest.isPresent()) {

            throw new RuntimeException(
                    "A return request already exists for this order and product");
        }

        // =====================================================
        // INITIAL VALUES
        // =====================================================

        request.setId(null);
        request.setStatus("REQUESTED");
        request.setRequestedAt(LocalDateTime.now());
        request.setInventoryUpdated(false);

        if (request.getRefundAmount() == null) {
            request.setRefundAmount(BigDecimal.ZERO);
        }

        return returnRequestRepository.save(request);
    }

    // =========================================================
    // GET ALL RETURNS
    // =========================================================

    public List<ReturnRequest> getAllReturnRequests() {

        return returnRequestRepository.findAll();
    }

    // =========================================================
    // GET RETURN BY ID
    // =========================================================

    public ReturnRequest getReturnRequestById(Long id) {

        return returnRequestRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Return request not found"));
    }

    // =========================================================
    // GET CUSTOMER RETURNS
    // =========================================================

    public List<ReturnRequest> getCustomerReturnRequests(
            String email) {

        return returnRequestRepository
                .findByCustomerEmail(email);
    }

    // =========================================================
    // GET RETURNS BY STATUS
    // =========================================================

    public List<ReturnRequest> getReturnRequestsByStatus(
            String status) {

        return returnRequestRepository
                .findByStatus(status);
    }

    // =========================================================
    // GET RETURNS BY ORDER
    // =========================================================

    public List<ReturnRequest> getReturnRequestsByOrder(
            Long orderId) {

        return returnRequestRepository
                .findByOrderId(orderId);
    }

    // =========================================================
    // ADMIN APPROVE RETURN
    // =========================================================

    @Transactional
    public ReturnRequest approveReturn(
            Long id,
            String remarks) {

        ReturnRequest request =
                getReturnRequestById(id);

        if (!"REQUESTED".equals(request.getStatus())) {

            throw new RuntimeException(
                    "Only REQUESTED returns can be approved");
        }

        request.setStatus("APPROVED");
        request.setAdminRemarks(remarks);
        request.setApprovedAt(LocalDateTime.now());

        return returnRequestRepository.save(request);
    }

    // =========================================================
    // ADMIN REJECT RETURN
    // =========================================================

    @Transactional
    public ReturnRequest rejectReturn(
            Long id,
            String remarks) {

        ReturnRequest request =
                getReturnRequestById(id);

        if (!"REQUESTED".equals(request.getStatus())) {

            throw new RuntimeException(
                    "Only REQUESTED returns can be rejected");
        }

        request.setStatus("REJECTED");
        request.setAdminRemarks(remarks);
        request.setRejectedAt(LocalDateTime.now());

        return returnRequestRepository.save(request);
    }

    // =========================================================
    // MARK PRODUCT AS RECEIVED
    // =========================================================

    @Transactional
    public ReturnRequest markAsReceived(Long id) {

        ReturnRequest request =
                getReturnRequestById(id);

        if (!"APPROVED".equals(request.getStatus())) {

            throw new RuntimeException(
                    "Only APPROVED returns can be marked as received");
        }

        request.setStatus("RECEIVED");
        request.setReceivedAt(LocalDateTime.now());

        return returnRequestRepository.save(request);
    }

    // =========================================================
    // QUALITY CHECK
    // =========================================================

    @Transactional
    public ReturnRequest qualityCheck(
            Long id,
            boolean passed,
            String remarks) {

        ReturnRequest request =
                getReturnRequestById(id);

        if (!"RECEIVED".equals(request.getStatus())) {

            throw new RuntimeException(
                    "Only RECEIVED returns can undergo quality checking");
        }

        request.setAdminRemarks(remarks);
        request.setQualityCheckedAt(LocalDateTime.now());

        // =====================================================
        // QC PASSED
        // =====================================================

        if (passed) {

            request.setStatus("QC_PASSED");
            request.setProductCondition("USABLE");

            // -------------------------------------------------
            // ADD PRODUCT BACK TO INVENTORY
            // -------------------------------------------------

            if (!Boolean.TRUE.equals(
                    request.getInventoryUpdated())) {

                inventoryService.addReturnedStock(
                        request.getProductId(),
                        request.getQuantity()
                );

                request.setInventoryUpdated(true);
            }

            // -------------------------------------------------
            // CREATE REFUND REQUEST
            // -------------------------------------------------

            if (request.getRefundAmount() == null
                    || request.getRefundAmount()
                            .compareTo(BigDecimal.ZERO) <= 0) {

                throw new RuntimeException(
                        "Refund amount must be greater than zero for a successful return");
            }

            RefundRequest refundRequest =
                    new RefundRequest();

            refundRequest.setOrderId(
                    request.getOrderId());

            refundRequest.setCustomerEmail(
                    request.getCustomerEmail());

            refundRequest.setAmount(
                    request.getRefundAmount()
                            .doubleValue());

            refundRequest.setReason(
                    request.getReason());

            Refund refund =
                    refundService.createRefund(
                            refundRequest);

            // -------------------------------------------------
            // SAVE REFUND ID
            // -------------------------------------------------

            request.setRefundId(
                    refund.getId());

            request.setRefundInitiatedAt(
                    LocalDateTime.now());

            request.setStatus(
                    "REFUND_INITIATED");
        }

        // =====================================================
        // QC FAILED
        // =====================================================

        else {

            request.setStatus("QC_FAILED");
            request.setProductCondition("DAMAGED");

            request.setInventoryUpdated(false);
        }

        return returnRequestRepository.save(request);
    }
}