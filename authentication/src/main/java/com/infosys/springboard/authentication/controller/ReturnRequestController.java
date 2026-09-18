package com.infosys.springboard.authentication.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.infosys.springboard.authentication.entity.ReturnRequest;
import com.infosys.springboard.authentication.service.ReturnRequestService;

@RestController
@RequestMapping("/returns")
@CrossOrigin(origins = "http://localhost:5173")
public class ReturnRequestController {

    private final ReturnRequestService returnRequestService;

    public ReturnRequestController(ReturnRequestService returnRequestService) {
        this.returnRequestService = returnRequestService;
    }

    // =========================================================
    // CUSTOMER - CREATE RETURN
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ReturnRequest createReturn(
            @RequestBody ReturnRequest request) {

        return returnRequestService.createReturnRequest(request);
    }

    // =========================================================
    // CUSTOMER - VIEW OWN RETURNS
    // =========================================================

    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public List<ReturnRequest> getCustomerReturns(
            @RequestParam String email) {

        return returnRequestService.getCustomerReturnRequests(email);
    }

    // =========================================================
    // CUSTOMER - VIEW RETURN BY ORDER
    // =========================================================

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMINISTRATOR')")
    public List<ReturnRequest> getReturnsByOrder(
            @PathVariable Long orderId) {

        return returnRequestService.getReturnRequestsByOrder(orderId);
    }

    // =========================================================
    // ADMIN - VIEW ALL RETURNS
    // =========================================================

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public List<ReturnRequest> getAllReturns() {

        return returnRequestService.getAllReturnRequests();
    }

    // =========================================================
    // ADMIN - VIEW RETURN BY ID
    // =========================================================

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ReturnRequest getReturnById(
            @PathVariable Long id) {

        return returnRequestService.getReturnRequestById(id);
    }

    // =========================================================
    // ADMIN - VIEW RETURNS BY STATUS
    // =========================================================

    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public List<ReturnRequest> getReturnsByStatus(
            @PathVariable String status) {

        return returnRequestService.getReturnRequestsByStatus(status);
    }

    // =========================================================
    // ADMIN - APPROVE RETURN
    // =========================================================

    @PutMapping("/admin/{id}/approve")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ReturnRequest approveReturn(
            @PathVariable Long id,
            @RequestParam(required = false) String remarks) {

        return returnRequestService.approveReturn(id, remarks);
    }

    // =========================================================
    // ADMIN - REJECT RETURN
    // =========================================================

    @PutMapping("/admin/{id}/reject")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ReturnRequest rejectReturn(
            @PathVariable Long id,
            @RequestParam(required = false) String remarks) {

        return returnRequestService.rejectReturn(id, remarks);
    }

    // =========================================================
    // ADMIN - MARK PRODUCT RECEIVED
    // =========================================================

    @PutMapping("/admin/{id}/received")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ReturnRequest markAsReceived(
            @PathVariable Long id) {

        return returnRequestService.markAsReceived(id);
    }

    // =========================================================
    // ADMIN - QUALITY CHECK
    // =========================================================

    @PutMapping("/admin/{id}/quality-check")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ReturnRequest qualityCheck(
            @PathVariable Long id,
            @RequestParam boolean passed,
            @RequestParam(required = false) String remarks) {

        return returnRequestService.qualityCheck(
                id,
                passed,
                remarks
        );
    }
}