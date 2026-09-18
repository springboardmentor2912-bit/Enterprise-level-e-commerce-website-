package com.shopstack.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("ShopStack - Password Reset Request");
            message.setText("You requested a password reset. Click the link below to set a new password:\n\n"
                    + resetLink + "\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.");
            mailSender.send(message);
        } catch (Exception ex) {
            // Don't fail the request if mail isn't configured in a dev environment
            log.warn("Could not send password reset email to {}: {}", toEmail, ex.getMessage());
            log.info("Password reset link for {} (dev fallback): {}", toEmail, resetLink);
        }
    }

    public void sendOrderConfirmationEmail(String toEmail, String orderNumber) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("ShopStack - Order Confirmation: " + orderNumber);
            message.setText("Thank you for your order! Your order " + orderNumber + " has been confirmed and is being processed.");
            mailSender.send(message);
        } catch (Exception ex) {
            log.warn("Could not send order confirmation email to {}: {}", toEmail, ex.getMessage());
        }
    }
}
