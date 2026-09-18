package com.shopstack.controller;

import com.shopstack.dto.VendorAuthResponse;
import com.shopstack.dto.VendorLoginRequest;
import com.shopstack.dto.VendorRegisterRequest;
import com.shopstack.service.VendorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendor/auth")
@CrossOrigin(origins = "*")
public class VendorAuthController {

    private final VendorService vendorService;

    public VendorAuthController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    @PostMapping("/register")
    public ResponseEntity<VendorAuthResponse> register(@Valid @RequestBody VendorRegisterRequest request) {
        VendorAuthResponse response = vendorService.registerVendor(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<VendorAuthResponse> login(@Valid @RequestBody VendorLoginRequest request) {
        VendorAuthResponse response = vendorService.loginVendor(request);
        return ResponseEntity.ok(response);
    }
}
