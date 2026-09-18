package com.shopstack.controller;

import com.shopstack.dto.common.ApiResponse;
import com.shopstack.dto.fulfillment.ReturnRequestCreate;
import com.shopstack.security.UserPrincipal;
import com.shopstack.service.ReturnService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class ReturnController {

    private final ReturnService returnService;

    @PostMapping("/{orderId}/return")
    public ApiResponse<?> requestReturn(@AuthenticationPrincipal UserPrincipal principal,
                                         @PathVariable Long orderId,
                                         @Valid @RequestBody ReturnRequestCreate request) {
        var returnRequest = returnService.requestReturn(principal.getId(), orderId, request);
        return ApiResponse.ok("Return request submitted", returnService.toResponse(returnRequest));
    }

    @GetMapping("/returns/mine")
    public ApiResponse<?> myReturns(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(returnService.getMyReturns(principal.getId()).stream()
                .map(returnService::toResponse).toList());
    }
}
