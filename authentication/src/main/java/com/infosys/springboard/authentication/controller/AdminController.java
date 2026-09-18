package com.infosys.springboard.authentication.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.springboard.authentication.dto.UserResponse;
import com.infosys.springboard.authentication.dto.VendorResponse;
import com.infosys.springboard.authentication.service.AdminService;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }


    // =========================================================
    // VENDOR MANAGEMENT
    // =========================================================

    // Get all vendors
    // GET /admin/vendors
    @GetMapping("/vendors")
    public ResponseEntity<List<VendorResponse>> getAllVendors() {

        List<VendorResponse> vendors =
                adminService.getAllVendors();

        return ResponseEntity.ok(vendors);
    }


    // Get vendor by ID
    // GET /admin/vendors/{id}
    @GetMapping("/vendors/{id}")
    public ResponseEntity<VendorResponse> getVendorById(
            @PathVariable Long id) {

        VendorResponse vendor =
                adminService.getVendorById(id);

        return ResponseEntity.ok(vendor);
    }


    // Approve vendor
    // PUT /admin/vendors/{id}/approve
    @PutMapping("/vendors/{id}/approve")
    public ResponseEntity<VendorResponse> approveVendor(
            @PathVariable Long id) {

        VendorResponse vendor =
                adminService.approveVendor(id);

        return ResponseEntity.ok(vendor);
    }


    // Reject vendor
    // PUT /admin/vendors/{id}/reject
    @PutMapping("/vendors/{id}/reject")
    public ResponseEntity<VendorResponse> rejectVendor(
            @PathVariable Long id) {

        VendorResponse vendor =
                adminService.rejectVendor(id);

        return ResponseEntity.ok(vendor);
    }


    // =========================================================
    // USER MANAGEMENT
    // =========================================================

    // Get all customers
    // GET /admin/users
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllCustomers() {

        List<UserResponse> users =
                adminService.getAllCustomers();

        return ResponseEntity.ok(users);
    }


    // Get customer by ID
    // GET /admin/users/{id}
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getCustomerById(
            @PathVariable Long id) {

        UserResponse user =
                adminService.getCustomerById(id);

        return ResponseEntity.ok(user);
    }
}