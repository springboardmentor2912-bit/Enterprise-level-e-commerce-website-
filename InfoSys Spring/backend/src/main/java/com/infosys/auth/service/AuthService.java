package com.infosys.auth.service;

import com.infosys.auth.dto.AuthResponse;
import com.infosys.auth.dto.ForgotPasswordRequest;
import com.infosys.auth.dto.LoginRequest;
import com.infosys.auth.dto.RegisterRequest;
import com.infosys.auth.dto.ResetPasswordRequest;
import com.infosys.auth.model.PasswordResetToken;
import com.infosys.auth.model.User;
import com.infosys.auth.repository.PasswordResetTokenRepository;
import com.infosys.auth.repository.UserRepository;
import com.infosys.auth.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager,
                       PasswordResetTokenRepository passwordResetTokenRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
    }

    public AuthResponse register(RegisterRequest request) {
        // Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new RuntimeException("This email address is already registered. Please use a different email or sign in.");
        }

        // Check for duplicate username
        if (userRepository.existsByUsername(request.getUsername().trim())) {
            throw new RuntimeException("This username is already taken. Please choose a different username.");
        }

        User.Role targetRole = User.Role.CUSTOMER;
        if (request.getRole() != null) {
            try {
                targetRole = User.Role.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        // Build and save new user
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(targetRole)
                .build();

        userRepository.save(user);

        return AuthResponse.builder()
                .message("User registered successfully!")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        // Authenticate credentials
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwt = jwtUtil.generateToken(userDetails);

        // Load user info for response
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .assignedWarehouseId(user.getAssignedWarehouseId())
                .assignedWarehouseName(user.getAssignedWarehouseName())
                .build();
    }

    @Transactional
    public Map<String, String> forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found with this email address."));

        // Delete any existing tokens for this user
        passwordResetTokenRepository.deleteByUser(user);
        passwordResetTokenRepository.flush();

        // Generate a secure random token valid for 15 minutes
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(15);

        PasswordResetToken resetToken = new PasswordResetToken(token, user, expiryDate);
        passwordResetTokenRepository.save(resetToken);

        // Return token in response for local/dev testing (no SMTP required)
        return Map.of(
                "message", "Password reset link generated successfully. Use the token below to reset your password.",
                "resetToken", token
        );
    }

    @Transactional
    public Map<String, String> resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token."));

        if (resetToken.isUsed()) {
            throw new RuntimeException("This reset token has already been used.");
        }

        if (resetToken.isExpired()) {
            throw new RuntimeException("Reset token has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        return Map.of("message", "Password has been reset successfully. You can now log in with your new password.");
    }

    public Map<String, Object> verifyResetToken(String token) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElse(null);

        if (resetToken == null || resetToken.isUsed() || resetToken.isExpired()) {
            return Map.of("valid", false, "message", "Invalid or expired reset token.");
        }

        return Map.of("valid", true, "message", "Token is valid.");
    }
}
