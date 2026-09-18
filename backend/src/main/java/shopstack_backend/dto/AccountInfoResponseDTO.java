package shopstack_backend.dto;

public class AccountInfoResponseDTO {

    private String fullName;
    private String email;
    private String primaryRole;
    private boolean isVendor;
    private Long vendorId;
    private String vendorStatus;

    public AccountInfoResponseDTO() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPrimaryRole() { return primaryRole; }
    public void setPrimaryRole(String primaryRole) { this.primaryRole = primaryRole; }

    public boolean isVendor() { return isVendor; }
    public void setVendor(boolean vendor) { isVendor = vendor; }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

    public String getVendorStatus() { return vendorStatus; }
    public void setVendorStatus(String vendorStatus) { this.vendorStatus = vendorStatus; }
}
