package com.shopstack.service;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:notifications@shopstack.com}")
    private String mailFrom;

    @Value("${app.mail.sender-name:ShopStack Platform}")
    private String senderName;

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    @Value("${app.mail.mock-mode:false}")
    private boolean mockMode;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Autowired
    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends a rich multipart HTML email with plain-text fallback.
     * Returns true if sent or simulated successfully, false if an error occurred.
     */
    public boolean sendHtmlEmail(String toEmail, String recipientName, String subject, String bodyHtml, String bodyText) {
        if (!mailEnabled) {
            logger.info("[EmailService] Mail delivery is disabled via configuration. Skipping dispatch to: {}", toEmail);
            return true;
        }

        if (toEmail == null || toEmail.trim().isEmpty()) {
            logger.warn("[EmailService] Cannot send email: Recipient address is null or blank.");
            return false;
        }

        boolean hasCredentials = mailUsername != null && !mailUsername.isBlank() && mailPassword != null && !mailPassword.isBlank();

        // Mock mode, unconfigured credentials, or missing mailSender instance
        if (mockMode || !hasCredentials || mailSender == null) {
            logger.info("==================== [SHOPSTACK EMAIL NOTIFICATION (MOCK/SIMULATION)] ====================");
            logger.info("To: {} <{}>", recipientName, toEmail);
            logger.info("From: {} <{}>", senderName, mailFrom);
            logger.info("Subject: {}", subject);
            logger.info("Content Preview:\n{}", bodyText != null ? bodyText : "[HTML Body Preview]");
            logger.info("=========================================================================================");
            return true;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(new InternetAddress(mailFrom, senderName));
            if (recipientName != null && !recipientName.isBlank()) {
                helper.setTo(new InternetAddress(toEmail, recipientName));
            } else {
                helper.setTo(toEmail);
            }
            helper.setSubject(subject);

            // Set multipart text & HTML
            if (bodyText != null && !bodyText.isBlank()) {
                helper.setText(bodyText, bodyHtml);
            } else {
                helper.setText(bodyHtml, true);
            }

            mailSender.send(mimeMessage);
            logger.info("[EmailService] Real-time email successfully dispatched to '{}' with subject: '{}'", toEmail, subject);
            return true;
        } catch (Exception ex) {
            logger.error("[EmailService] Failed to send email to '{}' (Subject: '{}'). Error: {}", toEmail, subject, ex.getMessage(), ex);
            return false;
        }
    }

    public boolean isMailEnabled() {
        return mailEnabled;
    }

    public boolean isMockMode() {
        return mockMode;
    }
}
