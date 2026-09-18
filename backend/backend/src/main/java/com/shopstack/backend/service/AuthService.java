package com.shopstack.backend.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.shopstack.backend.dto.AuthResponse;
import com.shopstack.backend.dto.ForgotPasswordRequest;
import com.shopstack.backend.dto.LoginRequest;
import com.shopstack.backend.dto.PasswordResetResponse;
import com.shopstack.backend.dto.RegisterRequest;
import com.shopstack.backend.dto.ResetPasswordRequest;
import com.shopstack.backend.entity.Notification;
import com.shopstack.backend.entity.NotificationType;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.repository.NotificationRepository;
import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final AuthenticationManager authenticationManager;

    private final ProductService productService;

    private final NotificationRepository notificationRepository;


    // =========================================================
    // REGISTER
    // =========================================================

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {

            throw new IllegalArgumentException(
                    "Email already exists"
            );
        }

        User user = new User();

        user.setUsername(
                request.getUsername()
        );

        user.setEmail(
                request.getEmail()
        );

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        String role = request.getRole() == null
                ? "CUSTOMER"
                : request.getRole().trim().toUpperCase();

        if (!"CUSTOMER".equals(role) && !"VENDOR".equals(role)) {

            throw new IllegalArgumentException(
                    "Registration is available for customers and vendors only"
            );
        }

        user.setRole(role);

        if ("VENDOR".equals(role)) {

            user.setCommissionPercentage(
                    User.VENDOR_COMMISSION_PERCENTAGE
            );
        }

        // Save the new user first.
        // This gives the user a database ID.
        userRepository.save(user);

        // Create notification test data for THIS newly registered user.
        createTestNotifications(user);

        String token =
                jwtService.generateToken(
                        user.getEmail()
                );

        return new AuthResponse(
                token,
                user.getDisplayName(),
                user.getRole()
        );
    }


    // =========================================================
    // LOGIN
    // =========================================================

    public AuthResponse login(
            LoginRequest request
    ) {

        authenticationManager.authenticate(

                new UsernamePasswordAuthenticationToken(

                        request.getEmail(),

                        request.getPassword()

                )
        );

        User user =
                userRepository
                        .findByEmail(request.getEmail())
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "User not found"
                                )
                        );

        String token =
                jwtService.generateToken(
                        user.getEmail()
                );

        return new AuthResponse(
                token,
                user.getDisplayName(),
                user.getRole()
        );
    }


    // =========================================================
    // FORGOT PASSWORD
    // =========================================================

    public PasswordResetResponse forgotPassword(
            ForgotPasswordRequest request
    ) {

        User user =
                userRepository
                        .findByEmail(request.getEmail())
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "No account found for that email"
                                )
                        );

        String token =
                UUID.randomUUID().toString();

        user.setPasswordResetToken(token);

        user.setPasswordResetTokenExpiry(
                LocalDateTime.now().plusMinutes(15)
        );

        userRepository.save(user);

        return new PasswordResetResponse(
                "Reset token created. It expires in 15 minutes.",
                token
        );
    }


    // =========================================================
    // RESET PASSWORD
    // =========================================================

    public void resetPassword(
            ResetPasswordRequest request
    ) {

        User user =
                userRepository
                        .findByPasswordResetToken(
                                request.getToken()
                        )
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Invalid or expired reset token"
                                )
                        );

        if (
                user.getPasswordResetTokenExpiry() == null
                        || user.getPasswordResetTokenExpiry()
                        .isBefore(LocalDateTime.now())
        ) {

            throw new IllegalArgumentException(
                    "Invalid or expired reset token"
            );
        }

        if (
                request.getPassword() == null
                        || request.getPassword().length() < 6
        ) {

            throw new IllegalArgumentException(
                    "Password must be at least 6 characters"
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setPasswordResetToken(null);

        user.setPasswordResetTokenExpiry(null);

        userRepository.save(user);
    }


    // =========================================================
    // TEMPORARY NOTIFICATION TEST DATA
    // =========================================================

    private void createTestNotifications(User user) {

        // -----------------------------------------------------
        // 1. ORDER PLACED
        // -----------------------------------------------------

        Notification orderPlaced =
                new Notification(
                        user,
                        NotificationType.ORDER_PLACED,
                        "Order Placed Successfully",
                        "Your order ORD-TEST-1001 has been placed successfully."
                );

        orderPlaced.setOrderId(
                "ORD-TEST-1001"
        );

        orderPlaced.setAmount(
                499.00
        );


        // -----------------------------------------------------
        // 2. PAYMENT SUCCESS
        // -----------------------------------------------------

        Notification paymentSuccess =
                new Notification(
                        user,
                        NotificationType.PAYMENT_SUCCESS,
                        "Payment Successful",
                        "Your payment for order ORD-TEST-1001 was successful."
                );

        paymentSuccess.setOrderId(
                "ORD-TEST-1001"
        );

        paymentSuccess.setPaymentId(
                "pay_TEST_SUCCESS_1001"
        );

        paymentSuccess.setAmount(
                499.00
        );


        // -----------------------------------------------------
        // 3. PAYMENT FAILED
        // -----------------------------------------------------

        Notification paymentFailed =
                new Notification(
                        user,
                        NotificationType.PAYMENT_FAILED,
                        "Payment Failed",
                        "Your payment for order ORD-TEST-1002 could not be completed."
                );

        paymentFailed.setOrderId(
                "ORD-TEST-1002"
        );

        paymentFailed.setPaymentId(
                "pay_TEST_FAILED_1002"
        );

        paymentFailed.setAmount(
                799.00
        );


        // -----------------------------------------------------
        // 4. ORDER SHIPPED
        // -----------------------------------------------------

        Notification orderShipped =
                new Notification(
                        user,
                        NotificationType.ORDER_SHIPPED,
                        "Order Shipped",
                        "Your order ORD-TEST-1001 has been shipped. Tracking ID: TRACK-TEST-1001."
                );

        orderShipped.setOrderId(
                "ORD-TEST-1001"
        );


        // -----------------------------------------------------
        // 5. ORDER DELIVERED
        // -----------------------------------------------------

        Notification orderDelivered =
                new Notification(
                        user,
                        NotificationType.ORDER_DELIVERED,
                        "Order Delivered",
                        "Your order ORD-TEST-1001 has been delivered successfully."
                );

        orderDelivered.setOrderId(
                "ORD-TEST-1001"
        );


        // -----------------------------------------------------
        // 6. REFUND COMPLETED
        // -----------------------------------------------------

        Notification refundCompleted =
                new Notification(
                        user,
                        NotificationType.REFUND_COMPLETED,
                        "Refund Completed",
                        "Your refund for order ORD-TEST-1003 has been completed."
                );

        refundCompleted.setOrderId(
                "ORD-TEST-1003"
        );

        refundCompleted.setAmount(
                299.00
        );


        // -----------------------------------------------------
        // SAVE ALL NOTIFICATIONS
        // -----------------------------------------------------

        notificationRepository.save(orderPlaced);

        notificationRepository.save(paymentSuccess);

        notificationRepository.save(paymentFailed);

        notificationRepository.save(orderShipped);

        notificationRepository.save(orderDelivered);

        notificationRepository.save(refundCompleted);
    }
}