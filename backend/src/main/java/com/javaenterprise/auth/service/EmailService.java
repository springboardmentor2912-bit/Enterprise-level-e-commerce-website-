package com.javaenterprise.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("ShopStack - Password Reset Request");
        message.setText("Click the link below to reset your password:\n\n" +
                "http://localhost:5173/reset-password?token=" + resetToken + "\n\n" +
                "This link will expire in 30 minutes. If you did not request this, please ignore this email.");

        mailSender.send(message);
    }
}