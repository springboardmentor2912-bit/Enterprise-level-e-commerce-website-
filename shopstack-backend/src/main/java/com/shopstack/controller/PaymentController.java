package com.shopstack.controller;

import com.shopstack.dto.common.ApiResponse;
import com.shopstack.security.UserPrincipal;
import com.shopstack.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Read-only endpoints for surfacing payment/transaction status to the
 * currently authenticated customer. Order creation & verification live in
 * OrderController since a payment always belongs to exactly one order.
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/order/{orderId}")
    public ApiResponse<?> getPaymentForOrder(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long orderId) {
        return ApiResponse.ok(paymentService.getByOrderId(orderId));
    }
}
