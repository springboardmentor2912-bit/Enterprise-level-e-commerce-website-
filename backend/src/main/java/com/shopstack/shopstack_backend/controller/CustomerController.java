package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.dto.request.CustomerRequest;
import com.shopstack.shopstack_backend.dto.response.ApiResponse;
import com.shopstack.shopstack_backend.dto.response.CustomerResponse;
import com.shopstack.shopstack_backend.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/{userId}")
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(
            @PathVariable Long userId,
            @Valid @RequestBody CustomerRequest request) {

        CustomerResponse response = customerService.createCustomer(userId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Customer Profile Created Successfully",
                        response
                ));
    }

    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')")
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomer(
            @PathVariable Long userId) {

        CustomerResponse response = customerService.getCustomerByUserId(userId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Customer Details Retrieved Successfully",
                        response
                )
        );
    }
}