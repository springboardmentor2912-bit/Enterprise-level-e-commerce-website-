package com.shopstack.service;

import com.shopstack.dto.order.AddressRequest;
import com.shopstack.dto.order.AddressResponse;
import com.shopstack.entity.Address;
import com.shopstack.entity.User;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserService userService;

    @Transactional
    public AddressResponse addAddress(Long userId, AddressRequest request) {
        User user = userService.getById(userId);

        if (request.isDefault()) {
            addressRepository.findByUserId(userId).forEach(a -> {
                a.setDefault(false);
                addressRepository.save(a);
            });
        }

        Address address = Address.builder()
                .user(user)
                .label(request.getLabel())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .country(request.getCountry())
                .contactPhone(request.getContactPhone())
                .isDefault(request.isDefault())
                .build();

        return toResponse(addressRepository.save(address));
    }

    public List<AddressResponse> getMyAddresses(Long userId) {
        return addressRepository.findByUserId(userId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (!address.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Address not found");
        }
        addressRepository.delete(address);
    }

    private AddressResponse toResponse(Address a) {
        return AddressResponse.builder()
                .id(a.getId())
                .label(a.getLabel())
                .addressLine1(a.getAddressLine1())
                .addressLine2(a.getAddressLine2())
                .city(a.getCity())
                .state(a.getState())
                .postalCode(a.getPostalCode())
                .country(a.getCountry())
                .contactPhone(a.getContactPhone())
                .isDefault(a.isDefault())
                .build();
    }
}
