package com.infosys.auth.controller;

import com.infosys.auth.model.VendorProfile;
import com.infosys.auth.service.VendorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/vendor")
public class VendorController {

    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<VendorProfile> getVendorProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(vendorService.getVendorProfile(userId));
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<VendorProfile> updateVendorProfile(@PathVariable Long userId, @RequestBody VendorProfile profile) {
        return ResponseEntity.ok(vendorService.updateVendorProfile(userId, profile));
    }

    @GetMapping("/stats/{userId}")
    public ResponseEntity<Map<String, Object>> getVendorStats(@PathVariable Long userId) {
        return ResponseEntity.ok(vendorService.getVendorStats(userId));
    }
}
