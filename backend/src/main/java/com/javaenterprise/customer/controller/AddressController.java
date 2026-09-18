package com.javaenterprise.customer.controller;

import com.javaenterprise.customer.dto.AddressRequest;
import com.javaenterprise.customer.dto.AddressResponse;
import com.javaenterprise.customer.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/address")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @PostMapping
    public AddressResponse addAddress(@Valid @RequestBody AddressRequest request,
                                      Authentication authentication) {

        return addressService.addAddress(request, authentication);
    }

    @GetMapping
    public List<AddressResponse> getAddresses(Authentication authentication) {

        return addressService.getAddresses(authentication);
    }

    @PutMapping("/{id}")
    public AddressResponse updateAddress(@PathVariable Long id,
                                         @Valid @RequestBody AddressRequest request,
                                         Authentication authentication) {

        return addressService.updateAddress(id, request, authentication);
    }

    @DeleteMapping("/{id}")
    public void deleteAddress(@PathVariable Long id,
                              Authentication authentication) {

        addressService.deleteAddress(id, authentication);
    }
    @PutMapping("/{id}/default")
    public AddressResponse setDefaultAddress(@PathVariable Long id,
                                             Authentication authentication) {
        return addressService.setDefaultAddress(id, authentication);
    }
}