package com.shopstack.dto;

public class PickRequest {
    private String pickerName = "Warehouse Associate";
    private String notes;

    public PickRequest() {}

    public PickRequest(String pickerName, String notes) {
        this.pickerName = pickerName;
        this.notes = notes;
    }

    public String getPickerName() { return pickerName; }
    public void setPickerName(String pickerName) { this.pickerName = pickerName; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
