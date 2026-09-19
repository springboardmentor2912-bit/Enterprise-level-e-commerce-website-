package com.shopstack.backend.controller;

import com.shopstack.backend.dto.ProfileResponse;
import com.shopstack.backend.service.JwtService;
import com.shopstack.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.shopstack.backend.dto.UpdateProfileRequest;

@RestController
@RequestMapping("/api/user")

public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @GetMapping("/profile")
    public ProfileResponse getProfile(
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7); // Remove "Bearer "

        String email = jwtService.extractEmail(token);

        return userService.getProfile(email);
    }

    @PutMapping("/profile")
    public String updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody UpdateProfileRequest request){

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        userService.updateProfile(email, request);

        return "Profile Updated Successfully";
    }
}