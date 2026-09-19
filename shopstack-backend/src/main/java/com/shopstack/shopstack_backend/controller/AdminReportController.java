package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.service.AdminReportService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/reports")
@CrossOrigin
public class AdminReportController {

    private final AdminReportService reportService;

    public AdminReportController(
            AdminReportService reportService) {

        this.reportService = reportService;
    }

    @GetMapping("/summary")
    public Map<String, Object> getReportSummary() {

        return reportService.getReportSummary();
    }
}