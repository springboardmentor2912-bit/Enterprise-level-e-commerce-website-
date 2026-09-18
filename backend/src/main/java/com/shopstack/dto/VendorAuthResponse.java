package com.shopstack.dto;

public class VendorAuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private VendorDTO vendor;

    public VendorAuthResponse() {
    }

    public VendorAuthResponse(String token, VendorDTO vendor) {
        this.token = token;
        this.vendor = vendor;
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

    public VendorDTO getVendor() {
        return vendor;
    }

    public void setVendor(VendorDTO vendor) {
        this.vendor = vendor;
    }
}
