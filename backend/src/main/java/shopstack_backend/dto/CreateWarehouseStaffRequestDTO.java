package shopstack_backend.dto;

public class CreateWarehouseStaffRequestDTO {

    private String fullName;
    private String email;
    private String password;
    private Long warehouseId;

    public CreateWarehouseStaffRequestDTO() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }
}
