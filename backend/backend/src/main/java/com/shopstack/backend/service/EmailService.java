package com.shopstack.backend.service;

import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.shopstack.backend.entity.Notification;
import com.shopstack.backend.entity.User;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${MAIL_FROM}")
    private String fromEmail;

    /**
     * Sends a notification email to the customer.
     */
    public boolean sendNotificationEmail(
            User user,
            Notification notification) {

        try {

            if (user == null || user.getEmail() == null
                    || user.getEmail().isBlank()) {

                System.err.println(
                        "Email notification skipped: customer email is missing."
                );

                return false;
            }

            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    true,
                    StandardCharsets.UTF_8.name()
            );

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());

            helper.setSubject(notification.getTitle());

            helper.setText(
                    buildEmailTemplate(user, notification),
                    true
            );

            mailSender.send(message);

            System.out.println(
                    "Notification email sent successfully to "
                            + user.getEmail()
            );

            return true;

        } catch (Exception e) {

            System.err.println(
                    "Failed to send notification email to "
                            + (user != null ? user.getEmail() : "unknown")
                            + ": "
                            + e.getMessage()
            );

            return false;
        }
    }

    /**
     * Creates the HTML email template.
     */
    private String buildEmailTemplate(
            User user,
            Notification notification) {

        String customerName = user.getDisplayName() != null
                ? user.getDisplayName()
                : "Customer";

        String orderDetails = "";

        if (notification.getOrderId() != null) {

            orderDetails += """
                    <div style="
                        margin-top:20px;
                        padding:16px;
                        background:#f4f7ff;
                        border-radius:10px;
                        border:1px solid #dbe4ff;
                    ">
                        <strong>Order ID:</strong>
                        %s
                    </div>
                    """.formatted(notification.getOrderId());
        }

        if (notification.getPaymentId() != null) {

            orderDetails += """
                    <div style="
                        margin-top:10px;
                        padding:16px;
                        background:#f4f7ff;
                        border-radius:10px;
                        border:1px solid #dbe4ff;
                    ">
                        <strong>Payment ID:</strong>
                        %s
                    </div>
                    """.formatted(notification.getPaymentId());
        }

        if (notification.getAmount() != null) {

            orderDetails += """
                    <div style="
                        margin-top:10px;
                        padding:16px;
                        background:#f4f7ff;
                        border-radius:10px;
                        border:1px solid #dbe4ff;
                    ">
                        <strong>Amount:</strong>
                        ₹%.2f
                    </div>
                    """.formatted(notification.getAmount());
        }

        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport"
                          content="width=device-width, initial-scale=1.0">
                    <title>ShopStack Notification</title>
                </head>

                <body style="
                    margin:0;
                    padding:0;
                    background:#eef4ff;
                    font-family:Arial,Helvetica,sans-serif;
                ">

                    <div style="
                        max-width:600px;
                        margin:40px auto;
                        background:#ffffff;
                        border-radius:14px;
                        overflow:hidden;
                        box-shadow:0 4px 18px rgba(0,0,0,0.08);
                    ">

                        <div style="
                            background:#2563eb;
                            color:#ffffff;
                            padding:24px;
                            text-align:center;
                        ">
                            <h1 style="
                                margin:0;
                                font-size:28px;
                            ">
                                ShopStack
                            </h1>

                            <p style="
                                margin:8px 0 0;
                                font-size:14px;
                                opacity:0.9;
                            ">
                                Your trusted shopping platform
                            </p>
                        </div>

                        <div style="padding:30px;">

                            <h2 style="
                                margin-top:0;
                                color:#172554;
                            ">
                                %s
                            </h2>

                            <p style="
                                color:#475569;
                                font-size:16px;
                                line-height:1.6;
                            ">
                                Hello %s,
                            </p>

                            <p style="
                                color:#475569;
                                font-size:16px;
                                line-height:1.6;
                            ">
                                %s
                            </p>

                            %s

                            <div style="
                                margin-top:30px;
                                padding-top:20px;
                                border-top:1px solid #e2e8f0;
                            ">
                                <p style="
                                    margin:0;
                                    color:#64748b;
                                    font-size:13px;
                                ">
                                    This is an automated notification
                                    from ShopStack.
                                </p>

                                <p style="
                                    margin:8px 0 0;
                                    color:#64748b;
                                    font-size:13px;
                                ">
                                    Please do not reply to this email.
                                </p>
                            </div>

                        </div>

                        <div style="
                            background:#f8fafc;
                            padding:18px;
                            text-align:center;
                            color:#94a3b8;
                            font-size:12px;
                        ">
                            © ShopStack. All rights reserved.
                        </div>

                    </div>

                </body>
                </html>
                """.formatted(
                notification.getTitle(),
                customerName,
                notification.getMessage(),
                orderDetails
        );
    }
}