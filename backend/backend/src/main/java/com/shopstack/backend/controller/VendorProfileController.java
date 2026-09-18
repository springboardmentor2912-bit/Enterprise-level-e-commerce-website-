package com.shopstack.backend.controller;


import java.util.Optional;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.backend.entity.User;
import com.shopstack.backend.entity.VendorProfile;
import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.repository.VendorProfileRepository;

import lombok.RequiredArgsConstructor;



@RestController
@RequestMapping("/api/vendor/profile")
@RequiredArgsConstructor
public class VendorProfileController {



    private final VendorProfileRepository vendorProfileRepository;

    private final UserRepository userRepository;





    @PostMapping
    public ResponseEntity<?> createProfile(
            @RequestBody VendorProfile profile,
            Authentication authentication
    ) {


        User user =
                userRepository.findByEmail(
                        authentication.getName()
                )
                .orElseThrow(
                        () -> new RuntimeException("User not found")
                );



        profile.setUser(user);



        VendorProfile saved =
                vendorProfileRepository.save(profile);



        return ResponseEntity.ok(saved);

    }







    @GetMapping
    public ResponseEntity<?> getProfile(
            Authentication authentication
    ) {


        User user =
                userRepository.findByEmail(
                        authentication.getName()
                )
                .orElseThrow(
                        () -> new RuntimeException("User not found")
                );



        Optional<VendorProfile> profile =
                vendorProfileRepository.findByUser(user);



        Map<String, Object> response = new LinkedHashMap<>();
        response.put("displayName", user.getDisplayName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("businessName", profile.map(VendorProfile::getBusinessName).orElse(""));
        response.put("contactNumber", profile.map(VendorProfile::getContactNumber).orElse(""));
        response.put("address", profile.map(VendorProfile::getAddress).orElse(""));
        response.put("description", profile.map(VendorProfile::getDescription).orElse(""));
        return ResponseEntity.ok(response);

    }







    @PutMapping
    public ResponseEntity<?> updateProfile(
            @RequestBody VendorProfile updatedProfile,
            Authentication authentication
    ) {


        User user =
                userRepository.findByEmail(
                        authentication.getName()
                )
                .orElseThrow(
                        () -> new RuntimeException("User not found")
                );



        VendorProfile profile = vendorProfileRepository.findByUser(user).orElseGet(() -> {
            VendorProfile newProfile = new VendorProfile();
            newProfile.setUser(user);
            newProfile.setBusinessName(user.getDisplayName() + " Store");
            return newProfile;
        });

        if (updatedProfile.getVendorName() != null && !updatedProfile.getVendorName().isBlank()) {
            user.setUsername(updatedProfile.getVendorName().trim());
            userRepository.save(user);
        }



        profile.setBusinessName(
                updatedProfile.getBusinessName()
        );


        profile.setContactNumber(
                updatedProfile.getContactNumber()
        );


        profile.setAddress(
                updatedProfile.getAddress()
        );


        profile.setDescription(
                updatedProfile.getDescription()
        );



        return ResponseEntity.ok(
                vendorProfileRepository.save(profile)
        );

    }


}
