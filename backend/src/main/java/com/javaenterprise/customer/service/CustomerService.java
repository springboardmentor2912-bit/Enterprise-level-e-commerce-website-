package com.javaenterprise.customer.service;

import com.javaenterprise.auth.dto.UpdateProfileRequest;
import com.javaenterprise.auth.dto.UserResponse;
import com.javaenterprise.user.entity.User;
import com.javaenterprise.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final UserRepository userRepository;

    public UserResponse getProfile(Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return map(user);
    }

    public UserResponse updateProfile(UpdateProfileRequest request,
                                      Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null)
            user.setName(request.getName());

        if (request.getPhone() != null)
            user.setPhone(request.getPhone());

        if (request.getAddress() != null)
            user.setAddress(request.getAddress());

        userRepository.save(user);

        return map(user);
    }

    private UserResponse map(User user) {

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .enabled(user.isEnabled())
                .role(user.getRoles()
                        .stream()
                        .findFirst()
                        .map(role -> role.getName())
                        .orElse(""))
                .build();
    }
}