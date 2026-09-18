package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.dto.response.ApiResponse;
import com.shopstack.shopstack_backend.dto.response.OrderResponse;
import com.shopstack.shopstack_backend.dto.response.VendorResponse;
import com.shopstack.shopstack_backend.service.AdminService;
import com.shopstack.shopstack_backend.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final OrderService orderService;

    public AdminController(
            AdminService adminService,
            OrderService orderService) {

        this.adminService = adminService;
        this.orderService = orderService;
    }

    // ==========================================
    // APPROVE VENDOR
    // ==========================================

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/vendors/{vendorId}/approve")
    public ResponseEntity<ApiResponse<VendorResponse>> approveVendor(
            @PathVariable Long vendorId) {

        VendorResponse response =
                adminService.approveVendor(vendorId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Vendor Approved Successfully",
                        response
                )
        );
    }

    // ==========================================
    // REJECT VENDOR
    // ==========================================

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/vendors/{vendorId}/reject")
    public ResponseEntity<ApiResponse<VendorResponse>> rejectVendor(
            @PathVariable Long vendorId) {

        VendorResponse response =
                adminService.rejectVendor(vendorId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Vendor Rejected Successfully",
                        response
                )
        );
    }

    // ==========================================
    // ALLOCATE WAREHOUSE TO ORDER
    // ==========================================

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/orders/{orderId}/warehouse/{warehouseId}")
    public ResponseEntity<ApiResponse<OrderResponse>> allocateWarehouse(
            @PathVariable Long orderId,
            @PathVariable Long warehouseId) {

        System.out.println(
                "===== ADMIN ALLOCATE WAREHOUSE API HIT ====="
        );

        OrderResponse response =
                orderService.allocateWarehouse(
                        orderId,
                        warehouseId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Warehouse Allocated Successfully",
                        response
                )
        );
    }
}