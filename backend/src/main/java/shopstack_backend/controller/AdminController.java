package shopstack_backend.controller;


import shopstack_backend.dto.*;
import shopstack_backend.entity.CommissionStatus;
import shopstack_backend.service.AdminService;
import shopstack_backend.service.CommissionService;
import shopstack_backend.service.CouponService;
import shopstack_backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private CommissionService commissionService;

    @Autowired
    private CouponService couponService;

    @Autowired
    private OrderService orderService;

    @GetMapping("/dashboard/summary")
    public ResponseEntity<AdminDashboardSummaryDTO> getDashboardSummary() {
        return ResponseEntity.ok(adminService.getDashboardSummary());
    }

    @GetMapping("/vendors")
    public ResponseEntity<List<AdminVendorDTO>> getAllVendors() {
        return ResponseEntity.ok(adminService.getAllVendors());
    }

    @PatchMapping("/vendors/{id}/approve")
    public ResponseEntity<?> approveVendor(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.approveVendor(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/vendors/{id}/reject")
    public ResponseEntity<?> rejectVendor(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.rejectVendor(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

   @GetMapping("/orders")
public ResponseEntity<List<AdminOrderDTO>> getAllOrders() {
    return ResponseEntity.ok(adminService.getAllOrders());
}

    // Aggregated per-vendor summary (total sales / total commission earned),
    // built from stored Commission records rather than a live recalculation.
    @GetMapping("/commissions")
    public ResponseEntity<List<CommissionDTO>> getCommissions() {
        return ResponseEntity.ok(commissionService.getVendorCommissionSummary());
    }

    // Detailed, per-order commission records: Order ID, Vendor, Sale Amount,
    // Commission Rate, Commission Amount, Vendor Amount, Status, Date.
    @GetMapping("/commissions/details")
    public ResponseEntity<List<CommissionResponseDTO>> getCommissionDetails() {
        return ResponseEntity.ok(commissionService.getAllCommissionRecords());
    }

    // Update the status of a single commission record (e.g. mark it PAID
    // once the vendor payout has actually gone out).
    @PatchMapping("/commissions/{commissionId}/status")
    public ResponseEntity<CommissionResponseDTO> updateCommissionStatus(
            @PathVariable Long commissionId,
            @RequestBody UpdateCommissionStatusRequest request) {
        CommissionStatus newStatus = CommissionStatus.valueOf(request.getStatus().toUpperCase());
        return ResponseEntity.ok(commissionService.updateCommissionStatus(commissionId, newStatus));
    }

    @GetMapping("/system/status")
    public ResponseEntity<SystemStatusDTO> getSystemStatus() {
        return ResponseEntity.ok(adminService.getSystemStatus());
    }

    // ---- Coupon management ----

    @PostMapping("/coupons")
    public ResponseEntity<?> createCoupon(@RequestBody CouponRequestDTO request) {
        try {
            return ResponseEntity.ok(couponService.createCoupon(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/coupons/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable Long id, @RequestBody CouponRequestDTO request) {
        try {
            return ResponseEntity.ok(couponService.updateCoupon(id, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        try {
            couponService.deleteCoupon(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/coupons/{id}/status")
    public ResponseEntity<?> setCouponStatus(@PathVariable Long id, @RequestBody java.util.Map<String, Boolean> body) {
        try {
            Boolean active = body.get("active");
            return ResponseEntity.ok(couponService.setActive(id, Boolean.TRUE.equals(active)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/coupons")
    public ResponseEntity<List<CouponResponseDTO>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @GetMapping("/coupons/analytics")
    public ResponseEntity<List<CouponAnalyticsDTO>> getCouponAnalytics() {
        return ResponseEntity.ok(couponService.getAnalytics());
    }

    @GetMapping("/coupons/usages")
    public ResponseEntity<List<CouponUsageResponseDTO>> getCouponUsages() {
        return ResponseEntity.ok(couponService.getAllUsages());
    }

    // Final manual confirmation step: courier delivery isn't visible to the
    // warehouse pipeline, so admin confirms it directly rather than it
    // happening automatically like PROCESSING/SHIPPED do.
    @PatchMapping("/orders/items/{itemId}/deliver")
    public ResponseEntity<?> markItemDelivered(@PathVariable Long itemId) {
        try {
            return ResponseEntity.ok(orderService.markItemDelivered(itemId));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}