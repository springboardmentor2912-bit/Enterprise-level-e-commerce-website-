package com.shopstack.dto;

public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private CustomerDTO user;

    public AuthResponse() {
    }

    public AuthResponse(String token, CustomerDTO user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public CustomerDTO getUser() {
        return user;
    }

    public void setUser(CustomerDTO user) {
        this.user = user;
    }
}
