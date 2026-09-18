package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.dto.request.VendorRequest;
import com.shopstack.shopstack_backend.dto.response.ApiResponse;
import com.shopstack.shopstack_backend.dto.response.VendorResponse;
import com.shopstack.shopstack_backend.service.VendorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/{userId}")
    public ResponseEntity<ApiResponse<VendorResponse>> createVendor(
            @PathVariable Long userId,
            @Valid @RequestBody VendorRequest request) {

        VendorResponse response = vendorService.createVendor(userId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Vendor Registered Successfully",
                        response
                ));
    }

    @PreAuthorize("hasAnyRole('ADMIN','VENDOR')")
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<VendorResponse>> getVendor(
            @PathVariable Long userId) {

        VendorResponse response = vendorService.getVendorByUserId(userId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Vendor Details Retrieved Successfully",
                        response
                )
        );
    }
}