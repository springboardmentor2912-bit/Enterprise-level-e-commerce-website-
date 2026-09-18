package com.infosys.auth.service;

import com.infosys.auth.model.*;
import com.infosys.auth.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReturnService {

    @Autowired
    private ReturnRequestRepository returnRequestRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private WarehouseInventoryRepository warehouseInventoryRepository;

    @Autowired
    private StockMovementRepository stockMovementRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<ReturnRequest> getAllReturnRequests() {
        return returnRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<ReturnRequest> getUserReturnRequests(Long userId) {
        return returnRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<ReturnRequest> getWarehouseReturnRequests(Long warehouseId) {
        if (warehouseId != null && warehouseId > 0) {
            return returnRequestRepository.findByWarehouseIdOrderByCreatedAtDesc(warehouseId);
        }
        return returnRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public ReturnRequest createReturnRequest(Long orderId, Long userId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: Order does not belong to this user");
        }

        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Return can only be requested for DELIVERED orders");
        }

        ReturnRequest req = returnRequestRepository.findByOrderId(orderId)
                .orElse(new ReturnRequest(orderId, userId, order.getCustomerName(), order.getWarehouseId(), reason, order.getTotalAmount()));

        req.setReason(reason);
        req.setStatus(ReturnRequest.ReturnStatus.REQUESTED);
        ReturnRequest saved = returnRequestRepository.save(req);

        order.setStatus(Order.OrderStatus.RETURN_REQUESTED);
        order.setReturnReason(reason);
        order.setReturnStatus("REQUESTED");
        order.setReturnRequestedAt(LocalDateTime.now());
        orderRepository.save(order);

        return saved;
    }

    @Transactional
    public ReturnRequest updateReturnStatus(Long returnRequestId, String statusStr, String rejectionReason) {
        ReturnRequest req = returnRequestRepository.findById(returnRequestId)
                .orElseThrow(() -> new RuntimeException("Return request not found"));

        ReturnRequest.ReturnStatus newStatus = ReturnRequest.ReturnStatus.valueOf(statusStr.toUpperCase());
        req.setStatus(newStatus);

        Order order = orderRepository.findById(req.getOrderId()).orElse(null);

        if (newStatus == ReturnRequest.ReturnStatus.APPROVED) {
            if (order != null) {
                order.setStatus(Order.OrderStatus.RETURN_APPROVED);
                order.setReturnStatus("APPROVED");
                orderRepository.save(order);
            }
        } else if (newStatus == ReturnRequest.ReturnStatus.REJECTED) {
            req.setQcRemarks("Rejected by admin: " + (rejectionReason != null ? rejectionReason : "Return policy exceeded"));
            if (order != null) {
                order.setStatus(Order.OrderStatus.DELIVERED); // Reverts to delivered
                order.setReturnStatus("REJECTED");
                order.setQcRemarks(req.getQcRemarks());
                orderRepository.save(order);
            }
        }

        return returnRequestRepository.save(req);
    }

    @Transactional
    public ReturnRequest performQcInspection(Long returnRequestId, boolean qcPassed, String qcRemarks, Long staffId, String staffName) {
        ReturnRequest req = returnRequestRepository.findById(returnRequestId)
                .orElseThrow(() -> new RuntimeException("Return request not found"));

        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new RuntimeException("Associated order not found"));

        req.setQcPerformedByStaffId(staffId);
        req.setQcPerformedByStaffName(staffName);
        req.setQcRemarks(qcRemarks);

        if (qcPassed) {
            req.setStatus(ReturnRequest.ReturnStatus.REFUNDED);
            order.setStatus(Order.OrderStatus.REFUNDED);
            order.setReturnStatus("QC_PASSED_REFUNDED");
            order.setQcStatus("PASSED");
            order.setQcRemarks(qcRemarks);
            order.setRefundAmount(order.getTotalAmount());

            // Restock items in warehouse inventory
            if (order.getWarehouseId() != null) {
                for (OrderItem item : order.getItems()) {
                    warehouseInventoryRepository.findByWarehouseIdAndProductId(order.getWarehouseId(), item.getProductId())
                            .ifPresent(inv -> {
                                inv.setAvailableQuantity(inv.getAvailableQuantity() + item.getQuantity());
                                warehouseInventoryRepository.save(inv);

                                // Update master product stock
                                Integer totalStock = warehouseInventoryRepository.getTotalAvailableStockForProduct(item.getProductId());
                                productRepository.findById(item.getProductId()).ifPresent(p -> {
                                    p.setStockQuantity(totalStock != null ? totalStock : 0);
                                    productRepository.save(p);
                                });

                                StockMovement sm = new StockMovement(
                                        order.getWarehouseId(),
                                        order.getWarehouseName(),
                                        item.getProductId(),
                                        item.getProductName(),
                                        order.getId(),
                                        item.getQuantity(),
                                        StockMovement.MovementType.RETURN_RESTOCK,
                                        staffId,
                                        staffName,
                                        "QC Passed restock for Return #" + req.getId() + " - " + qcRemarks
                                );
                                stockMovementRepository.save(sm);
                            });
                }
            }
        } else {
            req.setStatus(ReturnRequest.ReturnStatus.QC_FAILED);
            order.setStatus(Order.OrderStatus.DELIVERED);
            order.setReturnStatus("QC_FAILED");
            order.setQcStatus("FAILED");
            order.setQcRemarks(qcRemarks);
        }

        orderRepository.save(order);
        return returnRequestRepository.save(req);
    }
}
