package com.shopstack.backend.dto;

import com.shopstack.backend.enums.ReturnCondition;

public class ReturnInspectionRequest {
    private ReturnCondition condition;
    private String comment;

    public ReturnInspectionRequest() {}
    public ReturnCondition getCondition() { return condition; }
    public void setCondition(ReturnCondition condition) { this.condition = condition; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
