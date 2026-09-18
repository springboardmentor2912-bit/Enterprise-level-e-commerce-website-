package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.dto.request.LoginRequest;
import com.shopstack.shopstack_backend.dto.response.ApiResponse;
import com.shopstack.shopstack_backend.dto.request.RegisterRequest;
import com.shopstack.shopstack_backend.dto.response.LoginResponse;
import com.shopstack.shopstack_backend.dto.response.UserResponse;
import com.shopstack.shopstack_backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        System.out.println("===== REGISTER API HIT =====");

        UserResponse response = authService.register(request);

        ApiResponse<UserResponse> apiResponse =
                new ApiResponse<>(
                        true,
                        "User Registered Successfully",
                        response
                );

        return ResponseEntity.ok(apiResponse);
    }


    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        System.out.println("===== LOGIN API HIT =====");

        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Login Successful",
                        response
                )
        );
    }

}