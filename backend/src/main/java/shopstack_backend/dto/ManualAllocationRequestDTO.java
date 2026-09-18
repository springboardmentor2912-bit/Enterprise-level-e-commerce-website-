package shopstack_backend.dto;

public class ManualAllocationRequestDTO {

    private Long warehouseId;

    // Optional — if omitted, allocates everything still unallocated on the item.
    private Integer quantity;

    public ManualAllocationRequestDTO() {}

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
