package com.shopstack.dto;

import com.shopstack.model.Role;

public class AuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private Long id;
    private String email;
    private String fullName;
    private Role role;
    private Long vendorProfileId;
    private String storeName;
    private Long assignedWarehouseId;
    private String assignedWarehouseName;
    private String assignedWarehouseCode;

    public AuthResponse() {}

    public AuthResponse(String accessToken, String tokenType, Long id, String email, String fullName, Role role, Long vendorProfileId, String storeName,
                        Long assignedWarehouseId, String assignedWarehouseName, String assignedWarehouseCode) {
        this.accessToken = accessToken;
        this.tokenType = tokenType != null ? tokenType : "Bearer";
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.vendorProfileId = vendorProfileId;
        this.storeName = storeName;
        this.assignedWarehouseId = assignedWarehouseId;
        this.assignedWarehouseName = assignedWarehouseName;
        this.assignedWarehouseCode = assignedWarehouseCode;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Long getVendorProfileId() { return vendorProfileId; }
    public void setVendorProfileId(Long vendorProfileId) { this.vendorProfileId = vendorProfileId; }

    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }

    public Long getAssignedWarehouseId() { return assignedWarehouseId; }
    public void setAssignedWarehouseId(Long assignedWarehouseId) { this.assignedWarehouseId = assignedWarehouseId; }

    public String getAssignedWarehouseName() { return assignedWarehouseName; }
    public void setAssignedWarehouseName(String assignedWarehouseName) { this.assignedWarehouseName = assignedWarehouseName; }

    public String getAssignedWarehouseCode() { return assignedWarehouseCode; }
    public void setAssignedWarehouseCode(String assignedWarehouseCode) { this.assignedWarehouseCode = assignedWarehouseCode; }

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private String accessToken;
        private String tokenType = "Bearer";
        private Long id;
        private String email;
        private String fullName;
        private Role role;
        private Long vendorProfileId;
        private String storeName;
        private Long assignedWarehouseId;
        private String assignedWarehouseName;
        private String assignedWarehouseCode;

        public AuthResponseBuilder accessToken(String accessToken) { this.accessToken = accessToken; return this; }
        public AuthResponseBuilder tokenType(String tokenType) { this.tokenType = tokenType; return this; }
        public AuthResponseBuilder id(Long id) { this.id = id; return this; }
        public AuthResponseBuilder email(String email) { this.email = email; return this; }
        public AuthResponseBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public AuthResponseBuilder role(Role role) { this.role = role; return this; }
        public AuthResponseBuilder vendorProfileId(Long vendorProfileId) { this.vendorProfileId = vendorProfileId; return this; }
        public AuthResponseBuilder storeName(String storeName) { this.storeName = storeName; return this; }
        public AuthResponseBuilder assignedWarehouseId(Long assignedWarehouseId) { this.assignedWarehouseId = assignedWarehouseId; return this; }
        public AuthResponseBuilder assignedWarehouseName(String assignedWarehouseName) { this.assignedWarehouseName = assignedWarehouseName; return this; }
        public AuthResponseBuilder assignedWarehouseCode(String assignedWarehouseCode) { this.assignedWarehouseCode = assignedWarehouseCode; return this; }

        public AuthResponse build() {
            return new AuthResponse(accessToken, tokenType, id, email, fullName, role, vendorProfileId, storeName,
                    assignedWarehouseId, assignedWarehouseName, assignedWarehouseCode);
        }
    }
}
