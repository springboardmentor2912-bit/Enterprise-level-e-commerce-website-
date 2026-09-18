package com.javaenterprise.admin.controller;

import com.javaenterprise.admin.dto.AdminUserResponse;
import com.javaenterprise.admin.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public List<AdminUserResponse> getAllUsers() {
        return adminUserService.getAllUsers();
    }

    @GetMapping("/customers")
    public List<AdminUserResponse> getCustomers() {
        return adminUserService.getCustomers();
    }

    @GetMapping("/vendors")
    public List<AdminUserResponse> getVendors() {
        return adminUserService.getVendors();
    }

    @GetMapping("/warehouse")
    public List<AdminUserResponse> getWarehouseStaff() {
        return adminUserService.getWarehouseStaff();
    }

    @PatchMapping("/{id}/disable")
    public AdminUserResponse disableUser(@PathVariable Long id) {
        return adminUserService.disableUser(id);
    }

    @PatchMapping("/{id}/enable")
    public AdminUserResponse enableUser(@PathVariable Long id) {
        return adminUserService.enableUser(id);
    }
}