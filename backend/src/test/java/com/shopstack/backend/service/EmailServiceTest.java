package com.shopstack.backend.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.IContext;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;

public class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private TemplateEngine templateEngine;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        emailService.setFromEmail("test@shopstack.com");
        emailService.setFromName("ShopStack Support");

        // Return a valid mock MimeMessage when createMimeMessage is called
        MimeMessage mimeMessage = new MimeMessage((Session) null);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    }

    @Test
    @DisplayName("Should successfully render template and dispatch email via JavaMailSender")
    public void testSendHtmlEmail_Success() {
        String to = "customer@example.com";
        String subject = "Order Confirmation - #ORD-123456";
        String templateName = "email/order-placed";
        Map<String, Object> model = new HashMap<>();
        model.put("recipientName", "John Doe");
        model.put("orderId", "ORD-123456");
        model.put("totalAmount", 999.0);

        when(templateEngine.process(any(String.class), any(IContext.class)))
                .thenReturn("<html><body><h1>Order Confirmation</h1></body></html>");

        boolean result = emailService.sendHtmlEmail(to, subject, templateName, model);

        assertTrue(result, "Email sending should return true on success");
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Should gracefully handle SMTP MailException and prevent exception propagation")
    public void testSendHtmlEmail_SmtpFailureGracefulHandling() {
        String to = "customer@example.com";
        String subject = "Payment Confirmed";
        String templateName = "email/payment-success";
        Map<String, Object> model = Collections.singletonMap("orderId", "ORD-999");

        when(templateEngine.process(any(String.class), any(IContext.class)))
                .thenReturn("<html><body>Payment Success</body></html>");

        // Simulate SMTP network / server failure
        doThrow(new MailSendException("SMTP server connection timeout: 587"))
                .when(mailSender).send(any(MimeMessage.class));

        // Must NOT throw exception to caller (transaction safe)
        boolean result = emailService.sendHtmlEmail(to, subject, templateName, model);

        assertFalse(result, "Email sending should return false when SMTP fails");
    }

    @Test
    @DisplayName("Should return false when recipient email is empty or null")
    public void testSendHtmlEmail_EmptyRecipient() {
        boolean resultNull = emailService.sendHtmlEmail(null, "Subject", "email/order-placed", Collections.emptyMap());
        assertFalse(resultNull, "Should return false for null recipient");

        boolean resultEmpty = emailService.sendHtmlEmail("   ", "Subject", "email/order-placed", Collections.emptyMap());
        assertFalse(resultEmpty, "Should return false for whitespace recipient");
    }
}
