package com.shopstack.backend.controller;

import com.shopstack.backend.dto.CreateReturnRequest;
import com.shopstack.backend.dto.ReturnRequestResponse;
import com.shopstack.backend.service.JwtService;
import com.shopstack.backend.service.ReturnRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/returns")
public class ReturnRequestController {

    private final ReturnRequestService returnRequestService;
    private final JwtService jwtService;

    public ReturnRequestController(
            ReturnRequestService returnRequestService,
            JwtService jwtService
    ) {
        this.returnRequestService = returnRequestService;
        this.jwtService = jwtService;
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody CreateReturnRequest request
    ) {
        try {
            String email = emailFrom(authHeader);
            return ResponseEntity.ok(
                    returnRequestService.createReturnRequest(email, request)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMine(
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String email = emailFrom(authHeader);
            List<ReturnRequestResponse> returns =
                    returnRequestService.getCustomerReturns(email);
            return ResponseEntity.ok(returns);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMineById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String email = emailFrom(authHeader);
            return ResponseEntity.ok(
                    returnRequestService.getCustomerReturn(email, id)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/returned")
    public ResponseEntity<?> markReturned(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String email = emailFrom(authHeader);
            return ResponseEntity.ok(
                    returnRequestService.markReturned(email, id)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private String emailFrom(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization token is required");
        }
        return jwtService.extractEmail(authHeader.substring(7));
    }
}
