package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.dto.response.ApiResponse;
import com.shopstack.shopstack_backend.dto.response.VendorResponse;
import com.shopstack.shopstack_backend.service.VendorManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/vendors")
public class VendorManagementController {

    private final VendorManagementService vendorManagementService;

    public VendorManagementController(
            VendorManagementService vendorManagementService) {

        this.vendorManagementService =
                vendorManagementService;
    }

    // =========================
    // GET ALL VENDORS
    // =========================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<VendorResponse>>>
    getAllVendors() {

        System.out.println(
                "===== GET ALL VENDORS API HIT ====="
        );

        List<VendorResponse> vendors =
                vendorManagementService.getAllVendors();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Vendors Retrieved Successfully",
                        vendors
                )
        );
    }

    // =========================
    // GET VENDOR BY ID
    // =========================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VendorResponse>>
    getVendorById(
            @PathVariable Long id) {

        System.out.println(
                "===== GET VENDOR BY ID API HIT ====="
        );

        VendorResponse vendor =
                vendorManagementService
                        .getVendorById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Vendor Retrieved Successfully",
                        vendor
                )
        );
    }
}