package com.shopstack.service;

import com.shopstack.dto.fulfillment.ReturnRequestCreate;
import com.shopstack.dto.fulfillment.ReturnResponse;
import com.shopstack.entity.Order;
import com.shopstack.entity.ReturnRequest;
import com.shopstack.enums.OrderStatus;
import com.shopstack.enums.ReturnStatus;
import com.shopstack.exception.BadRequestException;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.OrderRepository;
import com.shopstack.repository.ReturnRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReturnService {

    private final ReturnRequestRepository returnRequestRepository;
    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;
    private final PaymentService paymentService;

    @Transactional
    public ReturnRequest requestReturn(Long userId, Long orderId, ReturnRequestCreate request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Order not found");
        }
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new BadRequestException("Only delivered orders can be returned");
        }
        if (returnRequestRepository.findByOrderId(orderId).isPresent()) {
            throw new BadRequestException("A return request already exists for this order");
        }

        ReturnRequest returnRequest = ReturnRequest.builder()
                .order(order)
                .reason(request.getReason())
                .status(ReturnStatus.REQUESTED)
                .build();

        return returnRequestRepository.save(returnRequest);
    }

    public List<ReturnRequest> getMyReturns(Long userId) {
        return returnRequestRepository.findByOrderUserIdOrderByRequestedAtDesc(userId);
    }

    public Page<ReturnRequest> getPending(Pageable pageable) {
        return returnRequestRepository.findByStatus(ReturnStatus.REQUESTED, pageable);
    }

    @Transactional
    public ReturnRequest approve(Long returnId, String adminNotes) {
        ReturnRequest returnRequest = getById(returnId);
        Order order = returnRequest.getOrder();

        // Restock every item, refund the payment in full, and mark the order returned.
        for (var item : order.getItems()) {
            inventoryService.restockAfterCancellation(item.getProduct().getId(), item.getQuantity());
        }
        paymentService.refund(order.getId(), order.getTotalAmount());

        order.setStatus(OrderStatus.REFUNDED);
        orderRepository.save(order);

        returnRequest.setStatus(ReturnStatus.REFUNDED);
        returnRequest.setAdminNotes(adminNotes);
        returnRequest.setResolvedAt(LocalDateTime.now());
        return returnRequestRepository.save(returnRequest);
    }

    @Transactional
    public ReturnRequest reject(Long returnId, String adminNotes) {
        ReturnRequest returnRequest = getById(returnId);
        returnRequest.setStatus(ReturnStatus.REJECTED);
        returnRequest.setAdminNotes(adminNotes);
        returnRequest.setResolvedAt(LocalDateTime.now());
        return returnRequestRepository.save(returnRequest);
    }

    private ReturnRequest getById(Long id) {
        return returnRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Return request not found"));
    }

    public ReturnResponse toResponse(ReturnRequest r) {
        return ReturnResponse.builder()
                .id(r.getId())
                .orderId(r.getOrder().getId())
                .orderNumber(r.getOrder().getOrderNumber())
                .reason(r.getReason())
                .status(r.getStatus().name())
                .adminNotes(r.getAdminNotes())
                .requestedAt(r.getRequestedAt())
                .resolvedAt(r.getResolvedAt())
                .build();
    }
}
