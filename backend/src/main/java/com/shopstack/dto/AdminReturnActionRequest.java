package com.shopstack.dto;

import jakarta.validation.constraints.NotBlank;

public class AdminReturnActionRequest {

    /** Either "APPROVE" or "REJECT" */
    @NotBlank(message = "Action is required (APPROVE or REJECT)")
    private String action;

    private String adminNotes;

    public AdminReturnActionRequest() {}

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }
}
