package com.infosys.springboard.authentication.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.infosys.springboard.authentication.dto.AddressResponse;
import com.infosys.springboard.authentication.entity.Address;
import com.infosys.springboard.authentication.entity.User;
import com.infosys.springboard.authentication.repository.AddressRepository;
import com.infosys.springboard.authentication.repository.UserRepository;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository,
                          UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    public List<AddressResponse> getMyAddresses() {
        User user = getLoggedInUser();

        return addressRepository.findByUser(user)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public AddressResponse getAddressById(Long id) {
        User user = getLoggedInUser();

        Address address = addressRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        return convertToResponse(address);
    }

    public AddressResponse addAddress(Address address) {
        User user = getLoggedInUser();

        address.setId(null);
        address.setUser(user);

        Address savedAddress = addressRepository.save(address);

        return convertToResponse(savedAddress);
    }

    public AddressResponse updateAddress(Long id, Address updatedAddress) {
        User user = getLoggedInUser();

        Address existingAddress = addressRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        existingAddress.setAddressLine(updatedAddress.getAddressLine());
        existingAddress.setCity(updatedAddress.getCity());
        existingAddress.setState(updatedAddress.getState());
        existingAddress.setPostalCode(updatedAddress.getPostalCode());
        existingAddress.setCountry(updatedAddress.getCountry());
        existingAddress.setPhoneNumber(updatedAddress.getPhoneNumber());

        Address savedAddress = addressRepository.save(existingAddress);

        return convertToResponse(savedAddress);
    }

    public void deleteAddress(Long id) {
        User user = getLoggedInUser();

        Address address = addressRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        addressRepository.delete(address);
    }

    private AddressResponse convertToResponse(Address address) {

        return new AddressResponse(
                address.getId(),
                address.getAddressLine(),
                address.getCity(),
                address.getState(),
                address.getPostalCode(),
                address.getCountry(),
                address.getPhoneNumber()
        );
    }

    private User getLoggedInUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged-in user not found"));
    }
}