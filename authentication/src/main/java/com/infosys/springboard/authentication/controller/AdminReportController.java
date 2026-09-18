package com.infosys.springboard.authentication.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.springboard.authentication.entity.Commission;
import com.infosys.springboard.authentication.service.CommissionService;

@RestController
@RequestMapping("/admin/reports")
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class AdminReportController {

    private final CommissionService commissionService;

    public AdminReportController(CommissionService commissionService) {
        this.commissionService = commissionService;
    }

    @GetMapping("/commissions")
    public ResponseEntity<List<Commission>> getCommissionReport() {

        List<Commission> commissions =
                commissionService.getAllCommissions();

        return ResponseEntity.ok(commissions);
    }
}