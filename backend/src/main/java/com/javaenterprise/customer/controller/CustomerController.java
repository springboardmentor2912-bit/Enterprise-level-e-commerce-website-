package com.javaenterprise.customer.controller;

import com.javaenterprise.auth.dto.UpdateProfileRequest;
import com.javaenterprise.auth.dto.UserResponse;
import com.javaenterprise.customer.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/profile")
    public UserResponse getProfile(Authentication authentication) {

        return customerService.getProfile(authentication);
    }

    @PutMapping("/profile")
    public UserResponse updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {

        return customerService.updateProfile(request, authentication);
    }
}