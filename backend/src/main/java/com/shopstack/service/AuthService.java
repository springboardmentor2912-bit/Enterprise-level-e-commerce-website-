package com.shopstack.service;

import com.shopstack.dto.AuthResponse;
import com.shopstack.dto.LoginRequest;
import com.shopstack.dto.RegisterRequest;
import com.shopstack.model.Role;
import com.shopstack.model.User;
import com.shopstack.model.VendorProfile;
import com.shopstack.model.VendorStatus;
import com.shopstack.repository.UserRepository;
import com.shopstack.repository.VendorProfileRepository;
import com.shopstack.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository, VendorProfileRepository vendorProfileRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.vendorProfileRepository = vendorProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Account with email '" + loginRequest.getEmail() + "' not found."));

        Long vendorId = null;
        String storeName = null;

        if (user.getRole() == Role.VENDOR) {
            VendorProfile vendor = vendorProfileRepository.findByUserId(user.getId()).orElse(null);
            if (vendor != null) {
                vendorId = vendor.getId();
                storeName = vendor.getStoreName();
            }
        }

        Long assignedWarehouseId = user.getAssignedWarehouse() != null ? user.getAssignedWarehouse().getId() : null;
        String assignedWarehouseName = user.getAssignedWarehouse() != null ? user.getAssignedWarehouse().getName() : null;
        String assignedWarehouseCode = user.getAssignedWarehouse() != null ? user.getAssignedWarehouse().getCode() : null;

        return AuthResponse.builder()
                .accessToken(jwt)
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .vendorProfileId(vendorId)
                .storeName(storeName)
                .assignedWarehouseId(assignedWarehouseId)
                .assignedWarehouseName(assignedWarehouseName)
                .assignedWarehouseCode(assignedWarehouseCode)
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email address '" + registerRequest.getEmail() + "' is already registered! Please log in or use another email.");
        }

        Role userRole = registerRequest.getRole() != null ? registerRequest.getRole() : Role.CUSTOMER;

        User user = User.builder()
                .fullName(registerRequest.getFullName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .phoneNumber(registerRequest.getPhoneNumber())
                .role(userRole)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);
        Long vendorId = null;
        String storeName = null;

        if (userRole == Role.VENDOR) {
            storeName = registerRequest.getStoreName() != null ? registerRequest.getStoreName() : savedUser.getFullName() + "'s Store";
            VendorProfile vendorProfile = VendorProfile.builder()
                    .user(savedUser)
                    .storeName(storeName)
                    .description(registerRequest.getStoreDescription() != null ? registerRequest.getStoreDescription() : "Official Multi-Vendor Marketplace Seller")
                    .status(VendorStatus.APPROVED)
                    .commissionRate(10.0)
                    .rating(5.0)
                    .build();
            VendorProfile savedVendor = vendorProfileRepository.save(vendorProfile);
            vendorId = savedVendor.getId();
        }

        return login(new LoginRequest(registerRequest.getEmail(), registerRequest.getPassword()));
    }

    public Map<String, String> forgotPassword(String email) {
        // Safe handling: Always return user-friendly message without leaking email existence
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }
        
        // Placeholder for actual email service integration
        // In production, token would be generated and dispatched here if user exists
        return Map.of("message", "If this email is registered, you will receive a reset link shortly.");
    }
}
