package com.shopstack.dto;

import jakarta.validation.constraints.NotBlank;

public class QcInspectionDto {

    @NotBlank(message = "QC decision is required (PASS or FAIL)")
    private String qcDecision; // "PASS" (Restock item) or "FAIL" (Move to Quarantine / Damaged stock)

    private String qcNotes;

    private String inspectedBy; // Name/badge of warehouse QC staff

    public QcInspectionDto() {}

    public QcInspectionDto(String qcDecision, String qcNotes, String inspectedBy) {
        this.qcDecision = qcDecision;
        this.qcNotes = qcNotes;
        this.inspectedBy = inspectedBy;
    }

    public String getQcDecision() { return qcDecision; }
    public void setQcDecision(String qcDecision) { this.qcDecision = qcDecision; }

    public String getQcNotes() { return qcNotes; }
    public void setQcNotes(String qcNotes) { this.qcNotes = qcNotes; }

    public String getInspectedBy() { return inspectedBy; }
    public void setInspectedBy(String inspectedBy) { this.inspectedBy = inspectedBy; }
}
