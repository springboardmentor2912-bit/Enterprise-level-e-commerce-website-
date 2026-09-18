package com.javaenterprise.auth.controller;

import com.javaenterprise.auth.dto.UpdateProfileRequest;
import com.javaenterprise.auth.dto.UserResponse;
import com.javaenterprise.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final AuthService authService;

    @GetMapping
    public UserResponse getProfile() {
        return authService.getProfile();
    }

    @PutMapping
    public UserResponse updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {

        return authService.updateProfile(request);
    }
}