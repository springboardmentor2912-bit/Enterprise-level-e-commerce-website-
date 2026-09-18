package com.infosys.springboard.authentication.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.infosys.springboard.authentication.dto.AuthResponse;
import com.infosys.springboard.authentication.dto.ForgotPasswordRequest;
import com.infosys.springboard.authentication.dto.LoginRequest;
import com.infosys.springboard.authentication.dto.RegisterRequest;
import com.infosys.springboard.authentication.dto.ResetPasswordRequest;
import com.infosys.springboard.authentication.entity.Role;
import com.infosys.springboard.authentication.entity.User;
import com.infosys.springboard.authentication.repository.UserRepository;
import com.infosys.springboard.authentication.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    // =====================================================
    // REGISTER
    // =====================================================

    public AuthResponse register(RegisterRequest request) {

        System.out.println("REGISTER SERVICE CALLED");
        System.out.println("Email: " + request.getEmail());
        System.out.println("Role: " + request.getRole());

        // Check email
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {

            throw new RuntimeException(
                    "Email already registered"
            );
        }

        // Validate role
        Role userRole;

        try {

            userRole = Role.valueOf(
                    request.getRole().toUpperCase()
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Invalid role. Allowed roles: CUSTOMER, VENDOR, WAREHOUSE_STAFF"
            );
        }

        // Public registration should not allow Administrator.
        // Warehouse Staff is temporarily allowed so that
        // the warehouse account can be created and tested.

        if (userRole == Role.ADMINISTRATOR) {

            throw new RuntimeException(
                    "You cannot register as Administrator"
            );
        }

        // Create user
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(
                        passwordEncoder.encode(
                                request.getPassword()
                        )
                )
                .role(userRole.name())
                .build();

        // Save user
        User savedUser = userRepository.save(user);

        System.out.println(
                "USER SAVED WITH ID: " + savedUser.getId()
        );

        System.out.println(
                "USER ROLE: " + savedUser.getRole()
        );

        // Generate JWT
        String token =
                jwtService.generateToken(
                        savedUser.getEmail(),
                        savedUser.getRole()
                );

        return new AuthResponse(token);
    }


    // =====================================================
    // LOGIN
    // =====================================================

    public AuthResponse login(LoginRequest request) {

        System.out.println("LOGIN SERVICE CALLED");

        // Authenticate email + password
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Find user
        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        System.out.println(
                "LOGIN USER ROLE: " + user.getRole()
        );

        // Generate JWT
        String token =
                jwtService.generateToken(
                        user.getEmail(),
                        user.getRole()
                );

        return new AuthResponse(token);
    }


    // =====================================================
    // FORGOT PASSWORD
    // =====================================================

    public String forgotPassword(
            ForgotPasswordRequest request) {

        System.out.println(
                "FORGOT PASSWORD REQUEST: "
                        + request.getEmail()
        );

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        // Generate random reset token
        String resetToken =
                UUID.randomUUID().toString();

        // Token valid for 15 minutes
        LocalDateTime expiry =
                LocalDateTime.now().plusMinutes(15);

        // Save reset information
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(expiry);

        userRepository.save(user);

        System.out.println(
                "RESET TOKEN: " + resetToken
        );

        System.out.println(
                "RESET TOKEN EXPIRY: " + expiry
        );

        // For now we return the token.
        // Later we will send it through email.
        return resetToken;
    }


    // =====================================================
    // RESET PASSWORD
    // =====================================================

    public String resetPassword(
            ResetPasswordRequest request) {

        System.out.println(
                "RESET PASSWORD REQUEST"
        );

        User user = userRepository
                .findAll()
                .stream()
                .filter(u ->
                        request.getToken()
                                .equals(u.getResetToken())
                )
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid reset token"
                        )
                );

        // Check token expiry
        if (user.getResetTokenExpiry() == null
                || user.getResetTokenExpiry()
                        .isBefore(LocalDateTime.now())) {

            throw new RuntimeException(
                    "Reset token has expired"
            );
        }

        // Encode new password
        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        // Clear reset token
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userRepository.save(user);

        System.out.println(
                "PASSWORD RESET SUCCESSFUL"
        );

        return "Password reset successful!";
    }
}