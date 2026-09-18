package com.javaenterprise.auth.service;

import com.javaenterprise.auth.dto.*;
import com.javaenterprise.security.JwtUtil;
import com.javaenterprise.user.entity.Role;
import com.javaenterprise.user.entity.RoleName;
import com.javaenterprise.user.entity.User;
import com.javaenterprise.user.repository.RoleRepository;
import com.javaenterprise.user.repository.UserRepository;
import com.javaenterprise.user.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService customUserDetailsService;
    private final EmailService emailService;

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        RoleName roleName = request.getRole();

        if (roleName == null) {
            roleName = RoleName.CUSTOMER;
        }

        Role role = roleRepository.findByName(roleName.name())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(true)
                .build();

        user.getRoles().add(role);

        userRepository.save(user);

        UserDetails userDetails =
                customUserDetailsService.loadUserByUsername(user.getEmail());

        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(role.getName())
                .build();
    }

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDetails userDetails =
                customUserDetailsService.loadUserByUsername(user.getEmail());

        String token = jwtUtil.generateToken(userDetails);

        String role = user.getRoles().stream()
                .findFirst()
                .map(Role::getName)
                .orElse("");

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(role)
                .build();
    }

    public String resetPassword(ResetPasswordRequest request) {

        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (user.getResetTokenExpiry() == null ||
                user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {

            throw new RuntimeException("Reset token expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userRepository.save(user);

        return "Password reset successfully";
    }
    public UserResponse getProfile() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String role = user.getRoles().stream()
                .findFirst()
                .map(Role::getName)
                .orElse("");

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(role)
                .enabled(user.isEnabled())
                .build();
    }
    public UserResponse updateProfile(UpdateProfileRequest request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null)
            user.setName(request.getName());

        if (request.getPhone() != null)
            user.setPhone(request.getPhone());

        if (request.getAddress() != null)
            user.setAddress(request.getAddress());

        userRepository.save(user);

        String role = user.getRoles().stream()
                .findFirst()
                .map(Role::getName)
                .orElse("");

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(role)
                .enabled(user.isEnabled())
                .build();
    }
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = UUID.randomUUID().toString();

        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(30));

        userRepository.save(user);

        // 🆕 ACTUALLY SEND THE EMAIL NOW
        emailService.sendPasswordResetEmail(user.getEmail(), token);

        return "Password reset link sent successfully to " + user.getEmail();
    }

}