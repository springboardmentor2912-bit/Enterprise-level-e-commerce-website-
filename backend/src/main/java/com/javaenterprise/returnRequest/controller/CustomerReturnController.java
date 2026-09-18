package com.javaenterprise.returnRequest.controller;

import com.javaenterprise.returnRequest.service.ReturnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/returns") // Explicitly matches the /api in your URL
@RequiredArgsConstructor
public class CustomerReturnController {

    private final ReturnService returnService;

    @PostMapping("/request") // Explicitly matches the /request in your URL
    public ResponseEntity<?> requestReturn(@RequestParam Long orderId,
                                           @RequestParam Long orderItemId,
                                           @RequestParam String reason,
                                           Authentication auth) {
        return ResponseEntity.ok(returnService.requestReturn(orderId, orderItemId, reason, auth));
    }

    @GetMapping("/my-returns")
    public ResponseEntity<?> getMyReturns(Authentication auth) {
        return ResponseEntity.ok(returnService.getMyReturns(auth));
    }
}