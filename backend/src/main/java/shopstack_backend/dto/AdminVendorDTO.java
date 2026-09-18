package shopstack_backend.dto;

public class AdminVendorDTO {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String description;
    private String status;
    private long productCount;

    public AdminVendorDTO() {}

    public AdminVendorDTO(
            Long id,
            String name,
            String email,
            String phone,
            String description,
            String status,
            long productCount) {

        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.description = description;
        this.status = status;
        this.productCount = productCount;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getProductCount() {
        return productCount;
    }

    public void setProductCount(long productCount) {
        this.productCount = productCount;
    }
}