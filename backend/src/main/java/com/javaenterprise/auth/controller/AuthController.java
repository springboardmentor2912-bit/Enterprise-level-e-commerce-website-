package com.javaenterprise.auth.controller;

import com.javaenterprise.auth.dto.AuthResponse;
import com.javaenterprise.auth.dto.ForgotPasswordRequest;
import com.javaenterprise.auth.dto.LoginRequest;
import com.javaenterprise.auth.dto.RegisterRequest;
import com.javaenterprise.auth.dto.ResetPasswordRequest;
import com.javaenterprise.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return authService.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    public String resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request);
    }
    @PostMapping("/test")
    public String test() {
        System.out.println("TEST ENDPOINT HIT");
        return "OK";
    }
}