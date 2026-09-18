package com.shopstack.controller;

import com.shopstack.dto.auth.*;
import com.shopstack.dto.common.ApiResponse;
import com.shopstack.security.UserPrincipal;
import com.shopstack.service.AuthService;
import com.shopstack.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok("Account created successfully", authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok("Login successful", authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ApiResponse.ok("If an account exists for this email, a reset link has been sent", null);
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ApiResponse.ok("Password reset successfully", null);
    }

    @GetMapping("/me")
    public ApiResponse<?> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(userService.getById(principal.getId()));
    }

    @PutMapping("/profile")
    public ApiResponse<?> updateProfile(@AuthenticationPrincipal UserPrincipal principal,
                                         @RequestBody UpdateProfileRequest request) {
        return ApiResponse.ok("Profile updated", userService.updateProfile(principal.getId(), request));
    }
}
