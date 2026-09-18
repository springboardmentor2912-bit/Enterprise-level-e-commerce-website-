package com.shopstack.dto;

public class PackRequest {
    private String packerName = "Packaging Specialist";
    private String boxType = "Standard Corrugated Box B2";
    private String boxDimension = "25x20x15 cm";
    private Double packageWeightKg = 0.85;
    private String notes;

    public PackRequest() {}

    public String getPackerName() { return packerName; }
    public void setPackerName(String packerName) { this.packerName = packerName; }

    public String getBoxType() { return boxType; }
    public void setBoxType(String boxType) { this.boxType = boxType; }

    public String getBoxDimension() { return boxDimension; }
    public void setBoxDimension(String boxDimension) { this.boxDimension = boxDimension; }

    public Double getPackageWeightKg() { return packageWeightKg; }
    public void setPackageWeightKg(Double packageWeightKg) { this.packageWeightKg = packageWeightKg; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
