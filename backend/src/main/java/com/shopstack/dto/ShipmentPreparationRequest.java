package com.shopstack.dto;

public class ShipmentPreparationRequest {
    private String carrier = "BlueDart Express";
    private String trackingNumber;
    private String notes;

    public ShipmentPreparationRequest() {}

    public String getCarrier() { return carrier; }
    public void setCarrier(String carrier) { this.carrier = carrier; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
