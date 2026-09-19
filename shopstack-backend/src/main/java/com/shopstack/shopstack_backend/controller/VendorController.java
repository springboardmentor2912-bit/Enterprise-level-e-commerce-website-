package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.entity.User;
import com.shopstack.shopstack_backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/vendor")
@CrossOrigin(origins = "http://localhost:3000")
public class VendorController {

    private final UserRepository userRepository;

    public VendorController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // =====================================================
    // GET VENDOR PROFILE
    // =====================================================

    @GetMapping("/profile/{id}")
    public ResponseEntity<?> getVendorProfile(
            @PathVariable Long id) {

        System.out.println(
                "Fetching vendor profile for ID: " + id
        );

        return userRepository.findById(id)
                .map(user -> {

                    System.out.println(
                            "Vendor found: " + user.getName()
                    );

                    return ResponseEntity.ok(user);
                })
                .orElseGet(() -> {

                    System.out.println(
                            "Vendor not found for ID: " + id
                    );

                    return ResponseEntity.notFound().build();
                });
    }

    // =====================================================
    // UPDATE VENDOR PROFILE
    // =====================================================

    @PutMapping("/profile/{id}")
    public ResponseEntity<?> updateVendorProfile(
            @PathVariable Long id,
            @RequestBody User updatedUser) {

        System.out.println(
                "Updating vendor profile for ID: " + id
        );

        return userRepository.findById(id)
                .map(user -> {

                    user.setName(updatedUser.getName());
                    user.setEmail(updatedUser.getEmail());
                    user.setPhoneNumber(
                            updatedUser.getPhoneNumber()
                    );
                    user.setAddress(
                            updatedUser.getAddress()
                    );
                    user.setCity(
                            updatedUser.getCity()
                    );
                    user.setState(
                            updatedUser.getState()
                    );
                    user.setPincode(
                            updatedUser.getPincode()
                    );
                    user.setCountry(
                            updatedUser.getCountry()
                    );

                    User savedUser =
                            userRepository.save(user);

                    System.out.println(
                            "Vendor profile updated successfully."
                    );

                    return ResponseEntity.ok(savedUser);
                })
                .orElseGet(() -> {

                    System.out.println(
                            "Vendor not found for ID: " + id
                    );

                    return ResponseEntity.notFound().build();
                });
    }
}