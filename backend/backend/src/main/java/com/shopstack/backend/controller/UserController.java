package com.shopstack.backend.controller;


import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.backend.dto.UserResponse;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;



@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {



    private final UserRepository userRepository;




    // Get logged-in user details
    @GetMapping("/me")
    public UserResponse getCurrentUser(
            Authentication authentication
    ){


        String email = authentication.getName();



        User user = userRepository
                .findByEmail(email)
                .orElseThrow(
                    () -> new RuntimeException("User not found")
                );



        return new UserResponse(
                user.getId(),
                user.getDisplayName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress()
        );

    }






    // Update user profile
    @PutMapping("/profile")
    public UserResponse updateProfile(
            @RequestBody Map<String,String> data,
            Authentication authentication
    ){
        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(
                    () -> new RuntimeException("User not found")
                );



        user.setUsername(
                data.get("username")
        );
        user.setPhone(data.get("phone"));
        user.setAddress(data.get("address"));



        User updatedUser = userRepository.save(user);



        return new UserResponse(
                updatedUser.getId(),
                updatedUser.getDisplayName(),
                updatedUser.getEmail(),
                updatedUser.getPhone(),
                updatedUser.getAddress()
        );

    }


}
