package com.infosys.auth.service;

import com.infosys.auth.dto.ProfileRequest;
import com.infosys.auth.dto.ProfileResponse;
import com.infosys.auth.model.User;
import com.infosys.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public ProfileResponse getProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return mapToProfileResponse(user);
    }

    @Transactional
    public ProfileResponse updateProfile(String currentEmail, ProfileRequest request) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + currentEmail));

        // Validation for username change
        if (!user.getUsername().equals(request.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new RuntimeException("Username is already taken!");
            }
            user.setUsername(request.getUsername());
        }

        // Validation for email change
        if (!user.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email is already in use!");
            }
            user.setEmail(request.getEmail());
        }

        // Update profile fields
        user.setFullName(request.getFullName());
        user.setBio(request.getBio());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setLocation(request.getLocation());

        // Update password if provided
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            if (request.getPassword().trim().length() < 6) {
                throw new RuntimeException("Password must be at least 6 characters long!");
            }
            user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        }

        User updatedUser = userRepository.save(user);
        return mapToProfileResponse(updatedUser);
    }

    private ProfileResponse mapToProfileResponse(User user) {
        return ProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .bio(user.getBio())
                .phoneNumber(user.getPhoneNumber())
                .location(user.getLocation())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
