package com.javaenterprise.admin.controller;

import com.javaenterprise.user.entity.User;
import com.javaenterprise.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/vendors")
@RequiredArgsConstructor
public class AdminVendorController {

    private final UserRepository userRepository;

    @PutMapping("/{id}/commission")
    public ResponseEntity<?> setCommission(@PathVariable Long id,
                                           @RequestParam BigDecimal rate) {
        User vendor = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        if (rate.compareTo(BigDecimal.ZERO) < 0 || rate.compareTo(BigDecimal.valueOf(100)) > 0) {
            return ResponseEntity.badRequest().body("Rate must be between 0 and 100");
        }

        vendor.setCommissionRate(rate);
        userRepository.save(vendor);

        return ResponseEntity.ok(Map.of(
                "message", "Commission updated",
                "vendorName", vendor.getName(),
                "newRate", rate
        ));
    }
}