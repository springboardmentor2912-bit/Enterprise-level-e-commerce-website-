package com.shopstack.dto;

import com.shopstack.entity.DamageResponsibility;
import com.shopstack.entity.DamageType;
import com.shopstack.entity.QCResult;
import jakarta.validation.constraints.NotNull;

public class WarehouseQCRequestDto {

    @NotNull(message = "QC Result is required (PASSED, DAMAGED, FAILED)")
    private QCResult qcResult;

    private DamageType damageType;

    private String damageDescription;

    private DamageResponsibility damageResponsibility;

    public WarehouseQCRequestDto() {
    }

    public WarehouseQCRequestDto(QCResult qcResult, DamageType damageType, String damageDescription, DamageResponsibility damageResponsibility) {
        this.qcResult = qcResult;
        this.damageType = damageType;
        this.damageDescription = damageDescription;
        this.damageResponsibility = damageResponsibility;
    }

    public QCResult getQcResult() {
        return qcResult;
    }

    public void setQcResult(QCResult qcResult) {
        this.qcResult = qcResult;
    }

    public DamageType getDamageType() {
        return damageType;
    }

    public void setDamageType(DamageType damageType) {
        this.damageType = damageType;
    }

    public String getDamageDescription() {
        return damageDescription;
    }

    public void setDamageDescription(String damageDescription) {
        this.damageDescription = damageDescription;
    }

    public DamageResponsibility getDamageResponsibility() {
        return damageResponsibility;
    }

    public void setDamageResponsibility(DamageResponsibility damageResponsibility) {
        this.damageResponsibility = damageResponsibility;
    }
}
