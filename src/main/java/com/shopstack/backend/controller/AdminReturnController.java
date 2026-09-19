package com.shopstack.backend.controller;

import com.shopstack.backend.dto.ReturnActionRequest;
import com.shopstack.backend.dto.ReturnInspectionRequest;
import com.shopstack.backend.dto.ReturnRequestResponse;
import com.shopstack.backend.service.ReturnRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/returns")
public class AdminReturnController {

    private final ReturnRequestService returnRequestService;

    public AdminReturnController(ReturnRequestService returnRequestService) {
        this.returnRequestService = returnRequestService;
    }

    @GetMapping
    public ResponseEntity<List<ReturnRequestResponse>> getAll() {
        return ResponseEntity.ok(returnRequestService.getAllReturns());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReturnRequestResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(returnRequestService.getReturnById(id));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(
            @PathVariable Long id,
            @RequestBody(required = false) ReturnActionRequest request
    ) {
        try {
            return ResponseEntity.ok(returnRequestService.approve(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(
            @PathVariable Long id,
            @RequestBody(required = false) ReturnActionRequest request
    ) {
        try {
            return ResponseEntity.ok(returnRequestService.reject(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/receive")
    public ResponseEntity<?> receive(
            @PathVariable Long id,
            @RequestBody(required = false) ReturnActionRequest request
    ) {
        try {
            return ResponseEntity.ok(returnRequestService.receive(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/inspect")
    public ResponseEntity<?> inspect(
            @PathVariable Long id,
            @RequestBody ReturnInspectionRequest request
    ) {
        try {
            return ResponseEntity.ok(returnRequestService.inspect(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<?> refund(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(returnRequestService.initiateRefund(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/refund/status")
    public ResponseEntity<?> refundStatus(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(returnRequestService.refreshRefundStatus(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
