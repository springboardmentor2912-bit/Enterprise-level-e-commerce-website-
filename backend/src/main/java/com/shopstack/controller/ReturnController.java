package com.shopstack.controller;

import com.shopstack.dto.*;
import com.shopstack.service.ReturnService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/returns")
@CrossOrigin(origins = "*")
public class ReturnController {

    private final ReturnService returnService;

    public ReturnController(ReturnService returnService) {
        this.returnService = returnService;
    }

    // ─── Customer Endpoints ────────────────────────────────────────────────

    /**
     * POST /api/returns/request/{orderItemId}
     * Customer submits a return request for a specific order item.
     */
    @PostMapping("/request/{orderItemId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReturnRequestDTO> requestReturn(
            Authentication authentication,
            @PathVariable Long orderItemId,
            @Valid @RequestBody CreateReturnRequestDto request) {
        String email = authentication.getName();
        ReturnRequestDTO result = returnService.requestReturn(email, orderItemId, request);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    /**
     * GET /api/returns/my
     * Customer views all their return requests.
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<ReturnRequestDTO>> getMyReturns(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(returnService.getMyReturns(email));
    }

    /**
     * GET /api/returns/my/order-item/{orderItemId}
     * Customer checks the return status for a specific order item.
     * Returns 404 if no return exists for that item yet.
     */
    @GetMapping("/my/order-item/{orderItemId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReturnRequestDTO> getReturnForOrderItem(
            Authentication authentication,
            @PathVariable Long orderItemId) {
        String email = authentication.getName();
        try {
            ReturnRequestDTO result = returnService.getReturnStatusForOrderItem(email, orderItemId);
            return ResponseEntity.ok(result);
        } catch (com.shopstack.exception.ResourceNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    // ─── Admin Endpoints ───────────────────────────────────────────────────

    /**
     * GET /api/returns/admin/all
     * Admin views all return requests.
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReturnRequestDTO>> getAllReturns() {
        return ResponseEntity.ok(returnService.getAllReturnRequests());
    }

    /**
     * GET /api/returns/admin/{returnId}
     * Admin views a specific return request.
     */
    @GetMapping("/admin/{returnId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReturnRequestDTO> getReturnById(@PathVariable Long returnId) {
        return ResponseEntity.ok(returnService.getReturnRequestById(returnId));
    }

    /**
     * PUT /api/returns/admin/{returnId}/review
     * Admin approves or rejects a return request.
     * Body: { "action": "APPROVE" | "REJECT", "adminNotes": "..." }
     */
    @PutMapping("/admin/{returnId}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReturnRequestDTO> reviewReturn(
            @PathVariable Long returnId,
            @Valid @RequestBody AdminReturnActionRequest request) {
        return ResponseEntity.ok(returnService.reviewReturn(returnId, request));
    }

    /**
     * PUT /api/returns/admin/{returnId}/receive
     * Admin marks product as received and decides on inventory restock.
     * Body: { "isUsable": true/false, "warehouseId": 1, "adminNotes": "..." }
     */
    @PutMapping("/admin/{returnId}/receive")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReturnRequestDTO> receiveReturn(
            @PathVariable Long returnId,
            @Valid @RequestBody AdminReceiveReturnRequest request) {
        return ResponseEntity.ok(returnService.receiveReturn(returnId, request));
    }

    /**
     * POST /api/returns/admin/{returnId}/refund
     * Admin initiates the actual Razorpay refund for an accepted return.
     */
    @PostMapping("/admin/{returnId}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReturnRequestDTO> initiateRefund(@PathVariable Long returnId) {
        ReturnRequestDTO result = returnService.initiateRefund(returnId);
        return ResponseEntity.ok(result);
    }
}
