package com.shopstack.controller;

import com.shopstack.dto.common.ApiResponse;
import com.shopstack.dto.fulfillment.ShipmentRequest;
import com.shopstack.entity.User;
import com.shopstack.enums.WarehouseTaskStatus;
import com.shopstack.security.UserPrincipal;
import com.shopstack.service.ShipmentService;
import com.shopstack.service.UserService;
import com.shopstack.service.WarehouseTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/warehouse")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('WAREHOUSE_STAFF', 'ADMIN')")
public class WarehouseController {

    private final WarehouseTaskService warehouseTaskService;
    private final ShipmentService shipmentService;
    private final UserService userService;

    @GetMapping("/tasks")
    public ApiResponse<?> getTasks(@RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "20") int size,
                                    @RequestParam(defaultValue = "false") boolean includeReady) {
        var tasks = includeReady
                ? warehouseTaskService.getAllTasks(PageRequest.of(page, size))
                : warehouseTaskService.getOpenTasks(PageRequest.of(page, size));
        return ApiResponse.ok(tasks.map(warehouseTaskService::toResponse));
    }

    @PatchMapping("/tasks/{taskId}/status")
    public ApiResponse<?> updateTaskStatus(@AuthenticationPrincipal UserPrincipal principal,
                                            @PathVariable Long taskId,
                                            @RequestParam WarehouseTaskStatus status) {
        User actor = userService.getById(principal.getId());
        var task = warehouseTaskService.updateStatus(taskId, status, actor);
        return ApiResponse.ok("Task updated", warehouseTaskService.toResponse(task));
    }

    @PostMapping("/orders/{orderId}/ship")
    public ApiResponse<?> shipOrder(@PathVariable Long orderId, @Valid @RequestBody ShipmentRequest request) {
        var shipment = shipmentService.createShipment(orderId, request);
        return ApiResponse.ok("Order marked as shipped", shipmentService.toResponse(shipment));
    }
}
