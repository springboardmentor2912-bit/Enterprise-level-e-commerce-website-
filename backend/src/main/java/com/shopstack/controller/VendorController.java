package com.shopstack.controller;

import com.shopstack.model.VendorProfile;
import com.shopstack.model.VendorStatus;
import com.shopstack.security.UserPrincipal;
import com.shopstack.service.VendorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    @GetMapping
    public ResponseEntity<List<VendorProfile>> getAllVendors() {
        return ResponseEntity.ok(vendorService.getAllVendors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendorProfile> getVendorById(@PathVariable Long id) {
        return ResponseEntity.ok(vendorService.getVendorById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<VendorProfile> getMyVendorProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(vendorService.getVendorByUserId(principal.getId()));
    }

    @PutMapping("/admin/{vendorId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VendorProfile> updateVendorStatus(
            @PathVariable Long vendorId,
            @RequestParam VendorStatus status) {
        return ResponseEntity.ok(vendorService.updateVendorStatus(vendorId, status));
    }

    @PutMapping("/profile")
    public ResponseEntity<VendorProfile> updateMyVendorProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> body) {
        VendorProfile profile = vendorService.getVendorByUserId(principal.getId());
        return ResponseEntity.ok(vendorService.updateVendorProfile(
                profile.getId(),
                body.get("storeName"),
                body.get("description"),
                body.get("logoUrl")
        ));
    }
}
