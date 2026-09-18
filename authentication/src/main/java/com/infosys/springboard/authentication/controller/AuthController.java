package com.infosys.springboard.authentication.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.infosys.springboard.authentication.dto.AuthResponse;
import com.infosys.springboard.authentication.dto.LoginRequest;
import com.infosys.springboard.authentication.dto.RegisterRequest;
import com.infosys.springboard.authentication.service.AuthService;
import com.infosys.springboard.authentication.dto.ForgotPasswordRequest;
import com.infosys.springboard.authentication.dto.ResetPasswordRequest;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody RegisterRequest request) {

        System.out.println("========== REGISTER API CALLED ==========");

        AuthResponse response = authService.register(request);

        System.out.println("========== USER REGISTERED SUCCESSFULLY ==========");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request) {

        System.out.println("========== LOGIN API CALLED ==========");

        AuthResponse response = authService.login(request);

        System.out.println("========== LOGIN SUCCESSFUL ==========");

        return ResponseEntity.ok(response);
    }
@PostMapping("/forgot-password")
public ResponseEntity<String> forgotPassword(
        @RequestBody ForgotPasswordRequest request) {

    System.out.println(
            "========== FORGOT PASSWORD API CALLED =========="
    );

    String resetToken =
            authService.forgotPassword(request);

    return ResponseEntity.ok(resetToken);
}


@PostMapping("/reset-password")
public ResponseEntity<String> resetPassword(
        @RequestBody ResetPasswordRequest request) {

    System.out.println(
            "========== RESET PASSWORD API CALLED =========="
    );

    String message =
            authService.resetPassword(request);

    return ResponseEntity.ok(message);
}}