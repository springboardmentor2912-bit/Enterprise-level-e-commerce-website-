package com.shopstack.controller;

import com.shopstack.dto.common.ApiResponse;
import com.shopstack.dto.order.CreateOrderRequest;
import com.shopstack.dto.order.VerifyPaymentRequest;
import com.shopstack.security.UserPrincipal;
import com.shopstack.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ApiResponse<?> checkout(@AuthenticationPrincipal UserPrincipal principal,
                                    @Valid @RequestBody CreateOrderRequest request) {
        return ApiResponse.ok("Order created — proceed to payment", orderService.checkout(principal.getId(), request));
    }

    @PostMapping("/verify-payment")
    public ApiResponse<?> verifyPayment(@AuthenticationPrincipal UserPrincipal principal,
                                         @Valid @RequestBody VerifyPaymentRequest request) {
        return ApiResponse.ok("Payment verified — order confirmed", orderService.verifyAndConfirmPayment(principal.getId(), request));
    }

    @PostMapping("/{orderId}/cancel")
    public ApiResponse<?> cancel(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long orderId) {
        return ApiResponse.ok("Order cancelled", orderService.cancelOrder(principal.getId(), orderId));
    }

    @GetMapping
    public ApiResponse<?> myOrders(@AuthenticationPrincipal UserPrincipal principal,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok(orderService.getMyOrders(principal.getId(), PageRequest.of(page, size)));
    }

    @GetMapping("/{orderId}")
    public ApiResponse<?> getOrder(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long orderId) {
        return ApiResponse.ok(orderService.getOrderDetail(principal.getId(), orderId));
    }
}
