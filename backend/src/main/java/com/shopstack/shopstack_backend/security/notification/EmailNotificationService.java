package com.shopstack.shopstack_backend.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {

        try {
            SimpleMailMessage message = new SimpleMailMessage();

            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

        } catch (Exception e) {
            // Email failure should not break the main business operation.
            System.err.println("Failed to send email to customer: " + e.getMessage());
        }
    }
}