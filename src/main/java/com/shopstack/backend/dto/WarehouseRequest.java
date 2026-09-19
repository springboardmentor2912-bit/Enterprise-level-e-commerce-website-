package com.shopstack.backend.dto;

public class WarehouseRequest {
    private String name, code, address, city, state, pincode;
    private Boolean active;
    public String getName(){return name;} public void setName(String v){name=v;}
    public String getCode(){return code;} public void setCode(String v){code=v;}
    public String getAddress(){return address;} public void setAddress(String v){address=v;}
    public String getCity(){return city;} public void setCity(String v){city=v;}
    public String getState(){return state;} public void setState(String v){state=v;}
    public String getPincode(){return pincode;} public void setPincode(String v){pincode=v;}
    public Boolean getActive(){return active;} public void setActive(Boolean v){active=v;}
}
