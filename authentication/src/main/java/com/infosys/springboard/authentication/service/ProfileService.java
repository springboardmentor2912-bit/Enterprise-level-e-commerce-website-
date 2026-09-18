package com.infosys.springboard.authentication.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.infosys.springboard.authentication.dto.ProfileResponse;
import com.infosys.springboard.authentication.entity.User;
import com.infosys.springboard.authentication.repository.UserRepository;

@Service
public class ProfileService {

    private final UserRepository userRepository;

    public ProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public ProfileResponse getMyProfile() {

        User user = getLoggedInUser();

        return new ProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );
    }

    public ProfileResponse updateMyProfile(String fullName) {

        User user = getLoggedInUser();

        user.setFullName(fullName);

        User updatedUser = userRepository.save(user);

        return new ProfileResponse(
                updatedUser.getId(),
                updatedUser.getFullName(),
                updatedUser.getEmail(),
                updatedUser.getRole()
        );
    }

    private User getLoggedInUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Logged-in user not found"));
    }
}