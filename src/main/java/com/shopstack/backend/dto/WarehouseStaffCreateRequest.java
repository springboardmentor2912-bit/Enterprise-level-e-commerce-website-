package com.shopstack.backend.dto;

public class WarehouseStaffCreateRequest {
    private String name;
    private String email;
    private String password;
    public String getName(){return name;} public void setName(String v){name=v;}
    public String getEmail(){return email;} public void setEmail(String v){email=v;}
    public String getPassword(){return password;} public void setPassword(String v){password=v;}
}
