package com.shopstack.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class EmailService {

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.from}")
    private String senderEmail;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public void sendSimpleEmail(
            String to,
            String subject,
            String body
    ) {
        String htmlBody =
                "<html><body>" +
                        body.replace("\n", "<br>") +
                        "</body></html>";

        sendEmail(to, subject, htmlBody);
    }

    public void sendHtmlEmail(
            String to,
            String subject,
            String htmlBody
    ) {
        sendEmail(to, subject, htmlBody);
    }

    private void sendEmail(
            String to,
            String subject,
            String htmlBody
    ) {

        if (to == null || to.isBlank()) {
            System.err.println(
                    "EMAIL SENDING SKIPPED: recipient email unavailable"
            );
            return;
        }

        try {

            String jsonBody = """
                    {
                      "sender": {
                        "name": "ShopStack",
                        "email": "%s"
                      },
                      "to": [
                        {
                          "email": "%s"
                        }
                      ],
                      "subject": "%s",
                      "htmlContent": %s
                    }
                    """.formatted(
                    escapeJson(senderEmail),
                    escapeJson(to),
                    escapeJson(subject),
                    toJsonString(htmlBody)
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(
                            URI.create(
                                    "https://api.brevo.com/v3/smtp/email"
                            )
                    )
                    .header(
                            "api-key",
                            brevoApiKey
                    )
                    .header(
                            "Content-Type",
                            "application/json"
                    )
                    .POST(
                            HttpRequest.BodyPublishers.ofString(
                                    jsonBody
                            )
                    )
                    .build();

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            if (response.statusCode() >= 200 &&
                    response.statusCode() < 300) {

                System.out.println(
                        "EMAIL SENT SUCCESSFULLY TO: " + to
                );

                System.out.println(
                        "BREVO RESPONSE: " + response.body()
                );

            } else {

                System.err.println(
                        "EMAIL SENDING FAILED TO: " + to
                );

                System.err.println(
                        "Brevo HTTP Status: " +
                                response.statusCode()
                );

                System.err.println(
                        "Brevo Response: " +
                                response.body()
                );
            }

        } catch (Exception e) {

            System.err.println(
                    "EMAIL SENDING FAILED TO: " + to
            );

            System.err.println(
                    "Reason: " + e.getMessage()
            );
        }
    }

    private String escapeJson(String value) {

        if (value == null) {
            return "";
        }

        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }

    private String toJsonString(String value) {
        return "\"" + escapeJson(value) + "\"";
    }
}