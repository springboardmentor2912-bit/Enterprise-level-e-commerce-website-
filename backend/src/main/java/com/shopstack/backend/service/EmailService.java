package com.shopstack.backend.service;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Value("${shopstack.mail.from-email:anirbansasmal21@gmail.com}")
    private String fromEmail;

    @Value("${shopstack.mail.from-name:ShopStack Support}")
    private String fromName;

    /**
     * Renders a Thymeleaf HTML template and sends it via JavaMailSender.
     * All exceptions (MailException, MessagingException, rendering errors) are caught and logged,
     * ensuring business transactions are completely isolated from email transport failures.
     *
     * @param to Destination customer email
     * @param subject Subject line of the email
     * @param templateName Thymeleaf template path relative to templates/ (e.g. "email/order-placed")
     * @param templateModel Map of context variables for the template
     * @return true if successfully delivered to SMTP server, false otherwise
     */
    public boolean sendHtmlEmail(String to, String subject, String templateName, Map<String, Object> templateModel) {
        if (to == null || to.trim().isEmpty()) {
            log.warn("[ShopStack-Email] Aborted sending email '{}': Recipient email address is null or empty.", subject);
            return false;
        }

        if (mailSender == null) {
            log.warn("[ShopStack-Email] JavaMailSender is not configured or disabled. Skipping email to '{}'.", to);
            return false;
        }

        try {
            // Build Thymeleaf Context
            Context context = new Context();
            if (templateModel != null) {
                context.setVariables(templateModel);
            }

            // Render HTML content from template
            String htmlContent = templateEngine.process(templateName, context);

            // Create MIME message
            MimeMessage message = mailSender.createMimeMessage();
            if (message == null) {
                log.warn("[ShopStack-Email] JavaMailSender created a null MimeMessage. Skipping email to '{}'.", to);
                return false;
            }

            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

            try {
                helper.setFrom(fromEmail, fromName);
            } catch (Exception e) {
                helper.setFrom(fromEmail);
            }

            helper.setTo(to.trim());
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            // Send email
            mailSender.send(message);
            log.info("[ShopStack-Email] Transactional email '{}' sent successfully to '{}' [Template: {}]", subject, to, templateName);
            return true;

        } catch (MailException e) {
            log.error("[ShopStack-Email] MailException while sending email to '{}' with subject '{}' [Template: {}]. Error: {}",
                    to, subject, templateName, e.getMessage(), e);
            return false;
        } catch (MessagingException e) {
            log.error("[ShopStack-Email] MessagingException while constructing MIME message for '{}'. Error: {}",
                    to, e.getMessage(), e);
            return false;
        } catch (Exception e) {
            log.error("[ShopStack-Email] Unexpected error occurred while rendering/sending email to '{}'. Error: {}",
                    to, e.getMessage(), e);
            return false;
        }
    }

    // Setters for unit testing
    public void setMailSender(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void setTemplateEngine(TemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
    }

    public void setFromEmail(String fromEmail) {
        this.fromEmail = fromEmail;
    }

    public void setFromName(String fromName) {
        this.fromName = fromName;
    }
}
