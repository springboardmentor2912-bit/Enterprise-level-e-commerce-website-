package com.javaenterprise.returnRequest.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "return_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReturnRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;
    private Long orderItemId; // Tracks exactly which item in the order is being returned
    private Long userId;      // The customer who requested it

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    private ReturnStatus status;

    private BigDecimal refundAmount;

    // True if Admin decides the item is in good condition and should go back to inventory
    private boolean restock;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String customerName;
    private String productName;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = ReturnStatus.REQUESTED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}