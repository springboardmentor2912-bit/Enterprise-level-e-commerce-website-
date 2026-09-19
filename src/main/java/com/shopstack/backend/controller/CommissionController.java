package com.shopstack.backend.controller;

import com.shopstack.backend.dto.CommissionResponse;
import com.shopstack.backend.service.CommissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/commissions")
public class CommissionController {

    private final CommissionService commissionService;


    public CommissionController(
            CommissionService commissionService
    ) {
        this.commissionService =
                commissionService;
    }


    /*
     * Calculate commission for an order.
     */
    @PostMapping("/calculate/{orderId}")
    public ResponseEntity<List<CommissionResponse>>
    calculateCommission(
            @PathVariable Long orderId
    ) {

        List<CommissionResponse> response =
                commissionService.calculateCommission(
                        orderId
                );

        return ResponseEntity.ok(response);
    }


    /*
     * Get all commission records.
     */
    @GetMapping
    public ResponseEntity<List<CommissionResponse>>
    getAllCommissions() {

        return ResponseEntity.ok(
                commissionService.getAllCommissions()
        );
    }


    /*
     * Get commission records for a vendor.
     */
    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<CommissionResponse>>
    getVendorCommissions(
            @PathVariable Long vendorId
    ) {

        return ResponseEntity.ok(
                commissionService
                        .getVendorCommissions(vendorId)
        );
    }


    /*
     * Mark a commission as paid out to the vendor.
     */
    @PatchMapping("/{commissionId}/pay")
    public ResponseEntity<?> markAsPaid(
            @PathVariable Long commissionId
    ) {

        try {

            CommissionResponse response =
                    commissionService.markAsPaid(
                            commissionId
                    );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}