package shopstack_backend.dto;

import java.time.LocalDateTime;

public class WarehouseResponseDTO {

    private Long id;
    private String name;
    private String location;
    private String contactPerson;
    private String phone;
    private boolean active;
    private LocalDateTime createdAt;

    // Rolled-up numbers so the warehouse list doubles as a quick dashboard
    private int distinctProductCount;
    private long totalAvailableStock;
    private long totalAllocatedStock;
    private long pendingPickCount;
    private long pendingPackCount;
    private long pendingShipCount;

    public WarehouseResponseDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public int getDistinctProductCount() {
        return distinctProductCount;
    }

    public void setDistinctProductCount(int distinctProductCount) {
        this.distinctProductCount = distinctProductCount;
    }

    public long getTotalAvailableStock() {
        return totalAvailableStock;
    }

    public void setTotalAvailableStock(long totalAvailableStock) {
        this.totalAvailableStock = totalAvailableStock;
    }

    public long getTotalAllocatedStock() {
        return totalAllocatedStock;
    }

    public void setTotalAllocatedStock(long totalAllocatedStock) {
        this.totalAllocatedStock = totalAllocatedStock;
    }

    public long getPendingPickCount() {
        return pendingPickCount;
    }

    public void setPendingPickCount(long pendingPickCount) {
        this.pendingPickCount = pendingPickCount;
    }

    public long getPendingPackCount() {
        return pendingPackCount;
    }

    public void setPendingPackCount(long pendingPackCount) {
        this.pendingPackCount = pendingPackCount;
    }

    public long getPendingShipCount() {
        return pendingShipCount;
    }

    public void setPendingShipCount(long pendingShipCount) {
        this.pendingShipCount = pendingShipCount;
    }
}