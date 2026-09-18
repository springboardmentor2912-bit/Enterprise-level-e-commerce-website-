package com.shopstack.controller;

import com.shopstack.dto.common.ApiResponse;
import com.shopstack.dto.coupon.CouponRequest;
import com.shopstack.entity.Coupon;
import com.shopstack.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class CouponController {

    private final CouponService couponService;

    @GetMapping
    public ApiResponse<?> getAll(@RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(couponService.getAll(PageRequest.of(page, size)).map(couponService::toResponse));
    }

    @PostMapping
    public ApiResponse<?> create(@Valid @RequestBody CouponRequest request) {
        Coupon coupon = couponService.create(request);
        return ApiResponse.ok("Coupon created", couponService.toResponse(coupon));
    }

    @PostMapping("/{id}/deactivate")
    public ApiResponse<?> deactivate(@PathVariable Long id) {
        Coupon coupon = couponService.deactivate(id);
        return ApiResponse.ok("Coupon deactivated", couponService.toResponse(coupon));
    }
}
