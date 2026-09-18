package com.shopstack.controller;

import com.shopstack.dto.common.ApiResponse;
import com.shopstack.dto.product.ReviewRequest;
import com.shopstack.security.UserPrincipal;
import com.shopstack.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/product/{productId}")
    public ApiResponse<?> addReview(@AuthenticationPrincipal UserPrincipal principal,
                                     @PathVariable Long productId,
                                     @Valid @RequestBody ReviewRequest request) {
        return ApiResponse.ok("Review submitted",
                reviewService.toResponse(reviewService.addReview(principal.getId(), productId, request)));
    }

    @GetMapping("/product/{productId}")
    public ApiResponse<?> getReviews(@PathVariable Long productId,
                                      @RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok(reviewService.getProductReviews(productId, PageRequest.of(page, size))
                .map(reviewService::toResponse));
    }
}
