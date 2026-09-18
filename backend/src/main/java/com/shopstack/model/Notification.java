package com.shopstack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String recipientEmail;

    private String recipientName;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String bodyHtml;

    @Column(columnDefinition = "TEXT")
    private String bodyText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationChannel channel = NotificationChannel.EMAIL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status = NotificationStatus.PENDING;

    private String referenceId;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    private Boolean isRead = false;

    private LocalDateTime createdAt;
    private LocalDateTime sentAt;

    public Notification() {}

    public Notification(Long id, User user, String recipientEmail, String recipientName, String subject,
                        String bodyHtml, String bodyText, NotificationType type, NotificationChannel channel,
                        NotificationStatus status, String referenceId, String errorMessage,
                        Boolean isRead, LocalDateTime createdAt, LocalDateTime sentAt) {
        this.id = id;
        this.user = user;
        this.recipientEmail = recipientEmail;
        this.recipientName = recipientName;
        this.subject = subject;
        this.bodyHtml = bodyHtml;
        this.bodyText = bodyText;
        this.type = type;
        this.channel = channel != null ? channel : NotificationChannel.EMAIL;
        this.status = status != null ? status : NotificationStatus.PENDING;
        this.referenceId = referenceId;
        this.errorMessage = errorMessage;
        this.isRead = isRead != null ? isRead : false;
        this.createdAt = createdAt;
        this.sentAt = sentAt;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.isRead == null) {
            this.isRead = false;
        }
        if (this.channel == null) {
            this.channel = NotificationChannel.EMAIL;
        }
        if (this.status == null) {
            this.status = NotificationStatus.PENDING;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getBodyHtml() { return bodyHtml; }
    public void setBodyHtml(String bodyHtml) { this.bodyHtml = bodyHtml; }

    public String getBodyText() { return bodyText; }
    public void setBodyText(String bodyText) { this.bodyText = bodyText; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public NotificationChannel getChannel() { return channel; }
    public void setChannel(NotificationChannel channel) { this.channel = channel; }

    public NotificationStatus getStatus() { return status; }
    public void setStatus(NotificationStatus status) { this.status = status; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public static NotificationBuilder builder() {
        return new NotificationBuilder();
    }

    public static class NotificationBuilder {
        private Long id;
        private User user;
        private String recipientEmail;
        private String recipientName;
        private String subject;
        private String bodyHtml;
        private String bodyText;
        private NotificationType type;
        private NotificationChannel channel = NotificationChannel.EMAIL;
        private NotificationStatus status = NotificationStatus.PENDING;
        private String referenceId;
        private String errorMessage;
        private Boolean isRead = false;
        private LocalDateTime createdAt;
        private LocalDateTime sentAt;

        public NotificationBuilder id(Long id) { this.id = id; return this; }
        public NotificationBuilder user(User user) { this.user = user; return this; }
        public NotificationBuilder recipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; return this; }
        public NotificationBuilder recipientName(String recipientName) { this.recipientName = recipientName; return this; }
        public NotificationBuilder subject(String subject) { this.subject = subject; return this; }
        public NotificationBuilder bodyHtml(String bodyHtml) { this.bodyHtml = bodyHtml; return this; }
        public NotificationBuilder bodyText(String bodyText) { this.bodyText = bodyText; return this; }
        public NotificationBuilder type(NotificationType type) { this.type = type; return this; }
        public NotificationBuilder channel(NotificationChannel channel) { this.channel = channel; return this; }
        public NotificationBuilder status(NotificationStatus status) { this.status = status; return this; }
        public NotificationBuilder referenceId(String referenceId) { this.referenceId = referenceId; return this; }
        public NotificationBuilder errorMessage(String errorMessage) { this.errorMessage = errorMessage; return this; }
        public NotificationBuilder isRead(Boolean isRead) { this.isRead = isRead; return this; }
        public NotificationBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public NotificationBuilder sentAt(LocalDateTime sentAt) { this.sentAt = sentAt; return this; }

        public Notification build() {
            return new Notification(id, user, recipientEmail, recipientName, subject, bodyHtml, bodyText,
                    type, channel, status, referenceId, errorMessage, isRead, createdAt, sentAt);
        }
    }
}
