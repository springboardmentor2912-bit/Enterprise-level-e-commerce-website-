package com.shopstack.backend.controller;

import com.shopstack.backend.dto.AddressRequest;
import com.shopstack.backend.dto.AddressResponse;
import com.shopstack.backend.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    @Autowired
    private AddressService addressService;


    @GetMapping
    public ResponseEntity<?> getMyAddresses(
            Authentication authentication
    ) {

        try {

            String email = authentication.getName();

            List<AddressResponse> addresses =
                    addressService.getMyAddresses(email);

            return ResponseEntity.ok(addresses);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    @PostMapping
    public ResponseEntity<?> addAddress(
            @RequestBody AddressRequest request,
            Authentication authentication
    ) {

        try {

            String email = authentication.getName();

            AddressResponse response =
                    addressService.addAddress(
                            email,
                            request
                    );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddress(
            @PathVariable Long id,
            @RequestBody AddressRequest request,
            Authentication authentication
    ) {

        try {

            String email = authentication.getName();

            AddressResponse response =
                    addressService.updateAddress(
                            id,
                            email,
                            request
                    );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(
            @PathVariable Long id,
            Authentication authentication
    ) {

        try {

            String email = authentication.getName();

            String message =
                    addressService.deleteAddress(
                            id,
                            email
                    );

            return ResponseEntity.ok(message);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}