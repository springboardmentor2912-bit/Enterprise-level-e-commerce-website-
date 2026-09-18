package com.shopstack.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.backend.model.Settlement;
import com.shopstack.backend.model.User;
import com.shopstack.backend.repository.SettlementRepository;
import com.shopstack.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/commissions")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class CommissionController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SettlementRepository settlementRepository;

    @Value("${shopstack.commission.percentage:10.0}")
    private double defaultCommissionPercentage;

    /**
     * REST API for on-the-fly commission calculation.
     * Takes order amount and applies either an explicit rate, a vendor-specific rate, or the platform default rate.
     */
    @GetMapping("/calculate")
    public ResponseEntity<?> calculateCommission(
            @RequestParam double amount,
            @RequestParam(required = false) Long vendorId,
            @RequestParam(required = false) Double rate) {

        if (amount < 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Order amount cannot be negative.");
        }
        double rateToUse = 10.0;
        if (rate != null) {
            rateToUse = rate;
        } else if (vendorId != null) {
            Optional<User> vendorOpt = userRepository.findById(vendorId);
            if (vendorOpt.isEmpty() || !"VENDOR".equalsIgnoreCase(vendorOpt.get().getRole())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Vendor with ID " + vendorId + " not found.");
            }
        }

        if (rateToUse < 0 || rateToUse > 100) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Commission rate must be between 0 and 100.");
        }

        double commissionAmount = Math.round((amount * (rateToUse / 100.0)) * 100.0) / 100.0;
        double vendorAmount = Math.round((amount - commissionAmount) * 100.0) / 100.0;

        Map<String, Object> result = new HashMap<>();
        result.put("orderAmount", amount);
        result.put("commissionRate", rateToUse);
        result.put("commissionAmount", commissionAmount);
        result.put("vendorAmount", vendorAmount);
        if (vendorId != null) {
            result.put("vendorId", vendorId);
        }

        return ResponseEntity.ok(result);
    }

    /**
     * REST API to retrieve commission/settlement records.
     * Supports filtering by vendorId or orderId.
     */
    @GetMapping("/records")
    public ResponseEntity<?> getCommissionRecords(
            @RequestParam(required = false) Long vendorId,
            @RequestParam(required = false) String orderId) {
        try {
            List<Settlement> records;
            if (orderId != null && !orderId.trim().isEmpty()) {
                records = settlementRepository.findByOrderId(orderId.trim());
            } else if (vendorId != null) {
                records = settlementRepository.findByVendorIdOrderByIdDesc(vendorId);
            } else {
                records = settlementRepository.findAllByOrderByIdDesc();
            }
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve commission records: " + e.getMessage());
        }
    }
}
