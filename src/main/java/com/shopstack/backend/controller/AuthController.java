package com.shopstack.backend.controller;

import com.shopstack.backend.dto.LoginRequest;
import com.shopstack.backend.dto.LoginResponse;
import com.shopstack.backend.dto.RegisterRequest;
import com.shopstack.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}