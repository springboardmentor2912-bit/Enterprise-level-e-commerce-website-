package com.infosys.springboard.authentication.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.infosys.springboard.authentication.dto.AddressResponse;
import com.infosys.springboard.authentication.entity.Address;
import com.infosys.springboard.authentication.service.AddressService;

@RestController
@RequestMapping("/customer/addresses")
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasRole('CUSTOMER')")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getMyAddresses() {
        return ResponseEntity.ok(addressService.getMyAddresses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AddressResponse> getAddressById(
            @PathVariable Long id) {
        return ResponseEntity.ok(addressService.getAddressById(id));
    }

    @PostMapping
    public ResponseEntity<AddressResponse> addAddress(
            @RequestBody Address address) {
        return ResponseEntity.ok(addressService.addAddress(address));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponse> updateAddress(
            @PathVariable Long id,
            @RequestBody Address address) {
        return ResponseEntity.ok(
                addressService.updateAddress(id, address)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAddress(
            @PathVariable Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.ok("Address deleted successfully");
    }
}