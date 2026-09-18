package com.shopstack.controller;

import com.shopstack.dto.CustomerDTO;
import com.shopstack.dto.UpdateProfileRequest;
import com.shopstack.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/profile")
    public ResponseEntity<CustomerDTO> getProfile(Authentication authentication) {
        String email = authentication.getName();
        CustomerDTO customerDTO = customerService.getProfileByEmail(email);
        return ResponseEntity.ok(customerDTO);
    }

    @PutMapping("/profile")
    public ResponseEntity<CustomerDTO> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        String email = authentication.getName();
        CustomerDTO updatedCustomer = customerService.updateProfile(email, request);
        return ResponseEntity.ok(updatedCustomer);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerDTO> getCustomerById(@PathVariable Long id) {
        CustomerDTO customerDTO = customerService.getCustomerById(id);
        return ResponseEntity.ok(customerDTO);
    }
}
