package com.infosys.springboard.authentication.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.infosys.springboard.authentication.dto.UserResponse;
import com.infosys.springboard.authentication.dto.VendorResponse;
import com.infosys.springboard.authentication.entity.User;
import com.infosys.springboard.authentication.repository.UserRepository;

@Service
public class AdminService {

    private final UserRepository userRepository;

    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // =========================================================
    // VENDOR MANAGEMENT
    // =========================================================

    // Get all vendors
    public List<VendorResponse> getAllVendors() {

        List<User> vendors =
                userRepository.findByRole("VENDOR");

        return vendors.stream()
                .map(user -> new VendorResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole(),
                        user.getStatus()
                ))
                .toList();
    }

    // Get vendor by ID
    public VendorResponse getVendorById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vendor not found with id: " + id
                        )
                );

        if (!"VENDOR".equals(user.getRole())) {
            throw new RuntimeException(
                    "User with id " + id + " is not a vendor"
            );
        }

        return new VendorResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus()
        );
    }

    // Approve vendor
    public VendorResponse approveVendor(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vendor not found with id: " + id
                        )
                );

        if (!"VENDOR".equals(user.getRole())) {
            throw new RuntimeException(
                    "User with id " + id + " is not a vendor"
            );
        }

        user.setStatus("APPROVED");

        User updatedUser =
                userRepository.save(user);

        return new VendorResponse(
                updatedUser.getId(),
                updatedUser.getFullName(),
                updatedUser.getEmail(),
                updatedUser.getRole(),
                updatedUser.getStatus()
        );
    }

    // Reject vendor
    public VendorResponse rejectVendor(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vendor not found with id: " + id
                        )
                );

        if (!"VENDOR".equals(user.getRole())) {
            throw new RuntimeException(
                    "User with id " + id + " is not a vendor"
            );
        }

        user.setStatus("REJECTED");

        User updatedUser =
                userRepository.save(user);

        return new VendorResponse(
                updatedUser.getId(),
                updatedUser.getFullName(),
                updatedUser.getEmail(),
                updatedUser.getRole(),
                updatedUser.getStatus()
        );
    }

    // =========================================================
    // USER MANAGEMENT
    // =========================================================

    // Get all customers
    public List<UserResponse> getAllCustomers() {

        List<User> customers =
                userRepository.findByRole("CUSTOMER");

        return customers.stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole(),
                        user.getStatus()
                ))
                .toList();
    }

    // Get customer by ID
    public UserResponse getCustomerById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: " + id
                        )
                );

        if (!"CUSTOMER".equals(user.getRole())) {
            throw new RuntimeException(
                    "User with id " + id + " is not a customer"
            );
        }

        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus()
        );
    }
}