package shopstack_backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class AdminOrderDTO {

    private Long id;
    private String customerName;
    private String customerEmail;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private int itemCount;

    // Full line-item detail — needed so admin can see and manually
    // allocate each item to a warehouse (AdminOrders / ManualAllocationPanel).
    private List<AdminOrderItemDTO> items;

    public AdminOrderDTO() {
    }

    public AdminOrderDTO(
            Long id,
            String customerName,
            String customerEmail,
            BigDecimal totalAmount,
            String status,
            LocalDateTime createdAt,
            int itemCount
    ) {
        this.id = id;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.totalAmount = totalAmount;
        this.status = status;
        this.createdAt = createdAt;
        this.itemCount = itemCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public int getItemCount() {
        return itemCount;
    }

    public void setItemCount(int itemCount) {
        this.itemCount = itemCount;
    }

    public List<AdminOrderItemDTO> getItems() {
        return items;
    }

    public void setItems(List<AdminOrderItemDTO> items) {
        this.items = items;
    }
}
