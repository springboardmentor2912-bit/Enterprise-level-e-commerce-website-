package com.shopstack.backend.service;

import com.shopstack.backend.dto.ProfileResponse;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.shopstack.backend.dto.UpdateProfileRequest;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public ProfileResponse getProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ProfileResponse response = new ProfileResponse();

        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setAddress(user.getAddress());
        response.setCity(user.getCity());
        response.setState(user.getState());
        response.setPincode(user.getPincode());

        return response;
    }

    public void updateProfile(String email, UpdateProfileRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setCity(request.getCity());
        user.setState(request.getState());
        user.setPincode(request.getPincode());

        userRepository.save(user);
    }
}