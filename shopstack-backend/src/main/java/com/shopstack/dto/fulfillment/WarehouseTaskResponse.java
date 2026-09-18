package com.shopstack.dto.fulfillment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseTaskResponse {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private String status;
    private String assignedToName;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
