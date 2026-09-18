package com.infosys.auth.dto;

public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String role;
    private String message;
    private Long assignedWarehouseId;
    private String assignedWarehouseName;

    public AuthResponse() {
    }

    public AuthResponse(String token, String type, Long id, String username, String email, String role, String message) {
        this.token = token;
        this.type = type;
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.message = message;
    }

    public AuthResponse(String token, Long id, String username, String email, String role) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.type = "Bearer";
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getAssignedWarehouseId() {
        return assignedWarehouseId;
    }

    public void setAssignedWarehouseId(Long assignedWarehouseId) {
        this.assignedWarehouseId = assignedWarehouseId;
    }

    public String getAssignedWarehouseName() {
        return assignedWarehouseName;
    }

    public void setAssignedWarehouseName(String assignedWarehouseName) {
        this.assignedWarehouseName = assignedWarehouseName;
    }

    // Builder implementation
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String token;
        private String type = "Bearer";
        private Long id;
        private String username;
        private String email;
        private String role;
        private String message;
        private Long assignedWarehouseId;
        private String assignedWarehouseName;

        public Builder token(String token) {
            this.token = token;
            return this;
        }

        public Builder type(String type) {
            this.type = type;
            return this;
        }

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder username(String username) {
            this.username = username;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder role(String role) {
            this.role = role;
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder assignedWarehouseId(Long assignedWarehouseId) {
            this.assignedWarehouseId = assignedWarehouseId;
            return this;
        }

        public Builder assignedWarehouseName(String assignedWarehouseName) {
            this.assignedWarehouseName = assignedWarehouseName;
            return this;
        }

        public AuthResponse build() {
            AuthResponse res = new AuthResponse(token, type, id, username, email, role, message);
            res.setAssignedWarehouseId(assignedWarehouseId);
            res.setAssignedWarehouseName(assignedWarehouseName);
            return res;
        }
    }
}
