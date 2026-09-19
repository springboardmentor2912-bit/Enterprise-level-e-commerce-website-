package com.shopstack.shopstack_backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.shopstack_backend.entity.User;
import com.shopstack.shopstack_backend.service.UserService;

@RestController
@RequestMapping
@CrossOrigin(origins = "http://localhost:3000")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    // Generic profile
    @GetMapping("/profile/{id}")
    public User getProfile(@PathVariable Long id) {
        return userService.getProfile(id);
    }

    // Customer profile
    @GetMapping("/customer/profile/{id}")
    public User getCustomerProfile(@PathVariable Long id) {
        return userService.getProfile(id);
    }

    // Generic profile update
    @PutMapping("/profile/{id}")
    public User updateProfile(
            @PathVariable Long id,
            @RequestBody User updatedUser) {

        return userService.updateProfile(id, updatedUser);
    }

    // Customer profile update
    @PutMapping("/customer/profile/{id}")
    public User updateCustomerProfile(
            @PathVariable Long id,
            @RequestBody User updatedUser) {

        return userService.updateProfile(id, updatedUser);
    }
}