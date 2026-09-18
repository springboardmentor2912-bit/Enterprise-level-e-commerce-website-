package com.infosys.springboard.authentication.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.infosys.springboard.authentication.dto.ProfileResponse;
import com.infosys.springboard.authentication.entity.User;
import com.infosys.springboard.authentication.repository.UserRepository;

@RestController
@RequestMapping("/profile")
@PreAuthorize("hasRole('CUSTOMER')")
public class ProfileController {

    private final UserRepository userRepository;

    public ProfileController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ProfileResponse getProfile(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return new ProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            Authentication authentication,
            @RequestParam String fullName) {

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        user.setFullName(fullName);

        User updatedUser = userRepository.save(user);

        ProfileResponse response = new ProfileResponse(
                updatedUser.getId(),
                updatedUser.getFullName(),
                updatedUser.getEmail(),
                updatedUser.getRole()
        );

        return ResponseEntity.ok(response);
    }
}