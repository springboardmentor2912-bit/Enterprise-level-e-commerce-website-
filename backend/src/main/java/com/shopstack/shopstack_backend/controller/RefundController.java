package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.dto.request.RefundRequest;
import com.shopstack.shopstack_backend.dto.response.ApiResponse;
import com.shopstack.shopstack_backend.dto.response.RefundResponse;
import com.shopstack.shopstack_backend.service.RefundService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/refunds")
@PreAuthorize("hasRole('ADMIN')")
public class RefundController {

    private final RefundService refundService;

    public RefundController(
            RefundService refundService) {

        this.refundService = refundService;
    }

    // =========================
    // PROCESS REFUND
    // =========================

    @PostMapping("/orders/{orderId}")
    public ResponseEntity<ApiResponse<RefundResponse>>
    processRefund(
            @PathVariable Long orderId,
            @Valid @RequestBody RefundRequest request) {

        System.out.println(
                "===== PROCESS REFUND API HIT ====="
        );

        RefundResponse response =
                refundService.processRefund(
                        orderId,
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Refund Processed Successfully",
                        response
                )
        );
    }

    // =========================
    // GET ALL REFUNDS
    // =========================

    @GetMapping
    public ResponseEntity<ApiResponse<List<RefundResponse>>>
    getAllRefunds() {

        List<RefundResponse> refunds =
                refundService.getAllRefunds();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Refunds Retrieved Successfully",
                        refunds
                )
        );
    }

    // =========================
    // GET REFUND BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RefundResponse>>
    getRefundById(
            @PathVariable Long id) {

        RefundResponse response =
                refundService.getRefundById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Refund Retrieved Successfully",
                        response
                )
        );
    }

    // =========================
    // GET REFUND BY ORDER
    // =========================

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<RefundResponse>>
    getRefundByOrderId(
            @PathVariable Long orderId) {

        RefundResponse response =
                refundService.getRefundByOrderId(
                        orderId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Refund Retrieved Successfully",
                        response
                )
        );
    }
}