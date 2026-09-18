package com.shopstack.dto;

import com.shopstack.entity.ShipmentStatus;

public class UpdateShipmentStatusRequest {
    private ShipmentStatus status;
    private String currentLocation;
    private String trackingNotes;

    public UpdateShipmentStatusRequest() {
    }

    public ShipmentStatus getStatus() { return status; }
    public void setStatus(ShipmentStatus status) { this.status = status; }

    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }

    public String getTrackingNotes() { return trackingNotes; }
    public void setTrackingNotes(String trackingNotes) { this.trackingNotes = trackingNotes; }
}
