package com.shopstack.dto;

public class CreateShipmentRequest {
    private String carrier;
    private String trackingId;
    private String currentLocation;
    private String trackingNotes;

    public CreateShipmentRequest() {
    }

    public String getCarrier() { return carrier; }
    public void setCarrier(String carrier) { this.carrier = carrier; }

    public String getTrackingId() { return trackingId; }
    public void setTrackingId(String trackingId) { this.trackingId = trackingId; }

    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }

    public String getTrackingNotes() { return trackingNotes; }
    public void setTrackingNotes(String trackingNotes) { this.trackingNotes = trackingNotes; }
}
