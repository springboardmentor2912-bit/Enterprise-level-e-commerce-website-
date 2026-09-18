package com.shopstack.controller;

import com.shopstack.dto.common.ApiResponse;
import com.shopstack.enums.ShipmentStatus;
import com.shopstack.security.UserPrincipal;
import com.shopstack.service.OrderService;
import com.shopstack.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;
    private final OrderService orderService;

    /** Customer tracking view — confirms the order actually belongs to them first. */
    @GetMapping("/api/orders/{orderId}/shipment")
    public ApiResponse<?> trackOrder(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long orderId) {
        orderService.getOrderDetail(principal.getId(), orderId); // throws 404 if not this user's order
        return ApiResponse.ok(shipmentService.toResponse(shipmentService.getByOrderId(orderId)));
    }

    /** Warehouse/Admin updates shipment progress (in transit, out for delivery, delivered, failed). */
    @PatchMapping("/api/warehouse/orders/{orderId}/shipment-status")
    @PreAuthorize("hasAnyRole('WAREHOUSE_STAFF', 'ADMIN')")
    public ApiResponse<?> updateShipmentStatus(@PathVariable Long orderId, @RequestParam ShipmentStatus status) {
        var shipment = shipmentService.updateStatus(orderId, status);
        return ApiResponse.ok("Shipment status updated", shipmentService.toResponse(shipment));
    }

    /**
     * Warehouse/Admin lookup — unlike the customer tracking view above, this
     * doesn't check order ownership (staff aren't the customer), and returns
     * null-ish "not found" cleanly so the dashboard can tell "not shipped
     * yet" apart from a real error.
     */
    @GetMapping("/api/warehouse/orders/{orderId}/shipment")
    @PreAuthorize("hasAnyRole('WAREHOUSE_STAFF', 'ADMIN')")
    public ApiResponse<?> staffViewShipment(@PathVariable Long orderId) {
        return ApiResponse.ok(shipmentService.toResponse(shipmentService.getByOrderId(orderId)));
    }
}
