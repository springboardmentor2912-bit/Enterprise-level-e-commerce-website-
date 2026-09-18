package com.shopstack.service;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "mailFrom", "notifications@shopstack.com");
        ReflectionTestUtils.setField(emailService, "senderName", "ShopStack Notifications");
        ReflectionTestUtils.setField(emailService, "mailEnabled", true);
        ReflectionTestUtils.setField(emailService, "mockMode", false);
        ReflectionTestUtils.setField(emailService, "mailUsername", "testuser@shopstack.com");
        ReflectionTestUtils.setField(emailService, "mailPassword", "testpassword123");
    }

    @Test
    @DisplayName("1. Send HTML Email Successfully with JavaMailSender")
    void testSendHtmlEmail_Success() {
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doNothing().when(mailSender).send(any(MimeMessage.class));

        boolean result = emailService.sendHtmlEmail(
                "customer@example.com",
                "Customer Name",
                "Order Confirmation #ORD-12345",
                "<h1>Order Confirmed</h1>",
                "Order Confirmed"
        );

        assertTrue(result);
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("2. Graceful Exception Handling when SMTP Mail Server Fails")
    void testSendHtmlEmail_SmtpFailure_HandledGracefully() {
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new MailSendException("SMTP server connection timed out")).when(mailSender).send(any(MimeMessage.class));

        // Must not throw uncaught exception to caller
        boolean result = emailService.sendHtmlEmail(
                "customer@example.com",
                "Customer Name",
                "Payment Success",
                "<h1>Paid</h1>",
                "Paid"
        );

        assertFalse(result);
    }

    @Test
    @DisplayName("3. Send Email with Blank/Null Address Returns False")
    void testSendHtmlEmail_BlankAddress() {
        boolean resultNull = emailService.sendHtmlEmail(null, "Name", "Subject", "<p>Html</p>", "Text");
        boolean resultEmpty = emailService.sendHtmlEmail("   ", "Name", "Subject", "<p>Html</p>", "Text");

        assertFalse(resultNull);
        assertFalse(resultEmpty);
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("4. Mock Mode Active - Simulates Dispatch without Calling SMTP")
    void testSendHtmlEmail_MockMode() {
        ReflectionTestUtils.setField(emailService, "mockMode", true);

        boolean result = emailService.sendHtmlEmail(
                "customer@example.com",
                "Customer Name",
                "Subject",
                "<p>Html</p>",
                "Text"
        );

        assertTrue(result);
        verify(mailSender, never()).createMimeMessage();
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("5. Unconfigured Credentials Active - Simulates Dispatch without Calling SMTP")
    void testSendHtmlEmail_UnconfiguredCredentials() {
        ReflectionTestUtils.setField(emailService, "mailUsername", "");
        ReflectionTestUtils.setField(emailService, "mailPassword", "");

        boolean result = emailService.sendHtmlEmail(
                "customer@example.com",
                "Customer Name",
                "Subject",
                "<p>Html</p>",
                "Text"
        );

        assertTrue(result);
        verify(mailSender, never()).createMimeMessage();
        verify(mailSender, never()).send(any(MimeMessage.class));
    }
}
