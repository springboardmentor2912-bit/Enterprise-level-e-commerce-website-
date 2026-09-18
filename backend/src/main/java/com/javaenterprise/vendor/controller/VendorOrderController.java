package com.javaenterprise.vendor.controller;

import com.javaenterprise.vendor.dto.VendorEarningsResponse;
import com.javaenterprise.vendor.dto.VendorOrderResponse;
import com.javaenterprise.vendor.service.VendorOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendor/orders")
@RequiredArgsConstructor
public class VendorOrderController {

    private final VendorOrderService vendorOrderService;

    /**
     * Get all orders of logged-in vendor
     */
    @GetMapping
    public List<VendorOrderResponse> getOrders(
            Authentication authentication) {

        return vendorOrderService.getOrders(authentication);
    }

    /**
     * Get single order
     */
    @GetMapping("/{id}")
    public VendorOrderResponse getOrder(
            @PathVariable Long id,
            Authentication authentication) {

        return vendorOrderService.getOrder(id, authentication);
    }

    /**
     * Confirm Order
     */
    @PutMapping("/{id}/confirm")
    public VendorOrderResponse confirmOrder(
            @PathVariable Long id,
            Authentication authentication) {

        return vendorOrderService.confirmOrder(id, authentication);
    }

    /**
     * Ship Order
     */
    @PutMapping("/{id}/ship")
    public VendorOrderResponse shipOrder(
            @PathVariable Long id,
            Authentication authentication) {

        return vendorOrderService.shipOrder(id, authentication);
    }

    /**
     * Deliver Order
     */
    @PutMapping("/{id}/deliver")
    public VendorOrderResponse deliverOrder(
            @PathVariable Long id,
            Authentication authentication) {

        return vendorOrderService.deliverOrder(id, authentication);
    }



    @PutMapping("/{orderId}/status")
    public void updateOrderStatus(@PathVariable Long orderId,
                                  @RequestParam String status,
                                  Authentication authentication) {
        vendorOrderService.updateOrderStatus(orderId, status, authentication);
    }
    @PutMapping("/{orderId}/refund")
    public ResponseEntity<?> approveRefund(@PathVariable Long orderId, Authentication authentication) {
        try {
            vendorOrderService.approveRefund(orderId, authentication);
            return ResponseEntity.ok("Refund approved and processed");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/earnings")
    public VendorEarningsResponse getEarnings(Authentication authentication) {
        return vendorOrderService.getEarnings(authentication);
    }
}