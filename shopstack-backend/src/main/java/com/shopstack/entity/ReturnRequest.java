package com.shopstack.entity;

import com.shopstack.enums.ReturnStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "return_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(length = 1000)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ReturnStatus status = ReturnStatus.REQUESTED;

    private String adminNotes;

    @Column(updatable = false)
    private LocalDateTime requestedAt;
    private LocalDateTime resolvedAt;

    @PrePersist
    public void prePersist() {
        this.requestedAt = LocalDateTime.now();
    }
}
