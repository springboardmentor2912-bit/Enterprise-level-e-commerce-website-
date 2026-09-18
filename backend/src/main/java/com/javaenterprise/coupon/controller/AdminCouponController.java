package com.javaenterprise.coupon.controller;

import com.javaenterprise.coupon.dto.CouponRequest;
import com.javaenterprise.coupon.dto.CouponResponse;
import com.javaenterprise.coupon.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
public class AdminCouponController {

    private final CouponService couponService;

    @GetMapping
    public List<CouponResponse> getAll() { return couponService.getAll(); }

    @PostMapping
    public CouponResponse create(@Valid @RequestBody CouponRequest r) { return couponService.create(r); }

    @PutMapping("/{id}")
    public CouponResponse update(@PathVariable Long id, @Valid @RequestBody CouponRequest r) { return couponService.update(id, r); }

    @PatchMapping("/{id}/toggle")
    public CouponResponse toggle(@PathVariable Long id) { return couponService.toggle(id); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { couponService.delete(id); }
}