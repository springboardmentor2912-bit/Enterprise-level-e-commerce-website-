package com.shopstack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ReturnRequestDto {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    private Long orderItemId;

    @NotBlank(message = "Reason is required")
    private String reason;

    private String returnReasonType; // DEFECTIVE, DAMAGED_IN_TRANSIT, WRONG_ITEM, SIZE_FIT_ISSUE, CHANGED_MIND

    private String customerComments;

    public ReturnRequestDto() {}

    public ReturnRequestDto(Long orderId, Long orderItemId, String reason, String returnReasonType, String customerComments) {
        this.orderId = orderId;
        this.orderItemId = orderItemId;
        this.reason = reason;
        this.returnReasonType = returnReasonType;
        this.customerComments = customerComments;
    }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getOrderItemId() { return orderItemId; }
    public void setOrderItemId(Long orderItemId) { this.orderItemId = orderItemId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getReturnReasonType() { return returnReasonType; }
    public void setReturnReasonType(String returnReasonType) { this.returnReasonType = returnReasonType; }

    public String getCustomerComments() { return customerComments; }
    public void setCustomerComments(String customerComments) { this.customerComments = customerComments; }
}
