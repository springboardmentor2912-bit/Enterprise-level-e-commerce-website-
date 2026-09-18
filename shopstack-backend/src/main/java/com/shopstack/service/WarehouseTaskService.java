package com.shopstack.service;

import com.shopstack.dto.fulfillment.WarehouseTaskResponse;
import com.shopstack.entity.Order;
import com.shopstack.entity.User;
import com.shopstack.entity.WarehouseTask;
import com.shopstack.enums.WarehouseTaskStatus;
import com.shopstack.exception.BadRequestException;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.WarehouseTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WarehouseTaskService {

    private final WarehouseTaskRepository warehouseTaskRepository;

    /** Called automatically once an order's payment is confirmed. */
    @Transactional
    public WarehouseTask createForOrder(Order order) {
        WarehouseTask task = WarehouseTask.builder()
                .order(order)
                .status(WarehouseTaskStatus.PENDING)
                .build();
        return warehouseTaskRepository.save(task);
    }

    public Page<WarehouseTask> getOpenTasks(Pageable pageable) {
        return warehouseTaskRepository.findByStatusNotOrderByCreatedAtAsc(WarehouseTaskStatus.READY_FOR_SHIPMENT, pageable);
    }

    public Page<WarehouseTask> getAllTasks(Pageable pageable) {
        return warehouseTaskRepository.findAllByOrderByCreatedAtAsc(pageable);
    }

    @Transactional
    public WarehouseTask updateStatus(Long taskId, WarehouseTaskStatus newStatus, User actor) {
        WarehouseTask task = warehouseTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse task not found"));

        if (task.getStatus() == WarehouseTaskStatus.READY_FOR_SHIPMENT) {
            throw new BadRequestException("This order is already packed and ready for shipment");
        }

        task.setStatus(newStatus);
        task.setAssignedTo(actor);
        return warehouseTaskRepository.save(task);
    }

    public WarehouseTaskResponse toResponse(WarehouseTask task) {
        return WarehouseTaskResponse.builder()
                .id(task.getId())
                .orderId(task.getOrder().getId())
                .orderNumber(task.getOrder().getOrderNumber())
                .status(task.getStatus().name())
                .assignedToName(task.getAssignedTo() != null ? task.getAssignedTo().getFullName() : null)
                .notes(task.getNotes())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
