package com.shopstack.controller;

import com.shopstack.dto.common.ApiResponse;
import com.shopstack.dto.order.AddressRequest;
import com.shopstack.security.UserPrincipal;
import com.shopstack.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ApiResponse<?> myAddresses(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(addressService.getMyAddresses(principal.getId()));
    }

    @PostMapping
    public ApiResponse<?> add(@AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody AddressRequest request) {
        return ApiResponse.ok("Address added", addressService.addAddress(principal.getId(), request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        addressService.deleteAddress(principal.getId(), id);
        return ApiResponse.ok("Address deleted", null);
    }
}
