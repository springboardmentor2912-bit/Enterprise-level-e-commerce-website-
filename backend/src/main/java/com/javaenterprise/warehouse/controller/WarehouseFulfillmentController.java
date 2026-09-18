package com.javaenterprise.warehouse.controller;

import com.javaenterprise.order.entity.OrderItem;
import com.javaenterprise.warehouse.service.WarehouseFulfillmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/warehouse/fulfillment")
@RequiredArgsConstructor
public class WarehouseFulfillmentController {

    private final WarehouseFulfillmentService fulfillmentService;

    @PostMapping("/{orderItemId}/pick")
    public ResponseEntity<?> pick(@PathVariable Long orderItemId, Authentication auth) {
        return ResponseEntity.ok(fulfillmentService.pickItem(orderItemId, auth));
    }

    @PostMapping("/{orderItemId}/pack")
    public ResponseEntity<?> pack(@PathVariable Long orderItemId, Authentication auth) {
        return ResponseEntity.ok(fulfillmentService.packItem(orderItemId, auth));
    }

    @PostMapping("/{orderItemId}/ready")
    public ResponseEntity<?> ready(@PathVariable Long orderItemId, Authentication auth) {
        return ResponseEntity.ok(fulfillmentService.readyForShipment(orderItemId, auth));
    }
}