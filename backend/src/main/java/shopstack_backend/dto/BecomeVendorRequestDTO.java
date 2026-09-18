package shopstack_backend.dto;

public class BecomeVendorRequestDTO {

    // All optional — defaults to the account's existing name if omitted,
    // matching what registering directly as a VENDOR already does today.
    private String businessName;
    private String phone;
    private String description;

    public BecomeVendorRequestDTO() {}

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
