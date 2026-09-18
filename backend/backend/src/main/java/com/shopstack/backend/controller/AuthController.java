package com.shopstack.backend.controller;

import com.shopstack.backend.dto.AuthResponse;
import com.shopstack.backend.dto.LoginRequest;
import com.shopstack.backend.dto.RegisterRequest;
import com.shopstack.backend.dto.ForgotPasswordRequest;
import com.shopstack.backend.dto.PasswordResetResponse;
import com.shopstack.backend.dto.ResetPasswordRequest;
import com.shopstack.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.http.HttpStatus;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        validateCredentials(request == null ? null : request.getEmail(), request == null ? null : request.getPassword());
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        validateCredentials(request == null ? null : request.getEmail(), request == null ? null : request.getPassword());
        return ResponseEntity.ok(authService.login(request));
    }

    private void validateCredentials(String email, String password) {
        if (email == null || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$") || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Please enter a valid email.");
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<PasswordResetResponse> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Password changed successfully");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleAuthError(IllegalArgumentException exception) {
        String message = exception.getMessage();
        if (message != null && message.toLowerCase().contains("email") && message.toLowerCase().contains("exist")) {
            message = "Email is already registered.";
        }
        return ResponseEntity.badRequest().body(Map.of("message", message == null ? "Please enter a valid email." : message));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleInvalidLogin() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password."));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, String>> handleAuthenticationFailure() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Please log in to continue."));
    }
}
