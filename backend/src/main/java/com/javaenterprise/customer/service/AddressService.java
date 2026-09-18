package com.javaenterprise.customer.service;

import com.javaenterprise.customer.dto.AddressRequest;
import com.javaenterprise.customer.dto.AddressResponse;
import com.javaenterprise.customer.entity.Address;
import com.javaenterprise.customer.repository.AddressRepository;
import com.javaenterprise.user.entity.User;
import com.javaenterprise.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressResponse addAddress(AddressRequest request, Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        Address address = Address.builder()
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .addressLine(request.getAddressLine())
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .postalCode(request.getPostalCode())
                .defaultAddress(request.isDefaultAddress())
                .user(user)
                .build();

        addressRepository.save(address);

        return map(address);
    }

    public List<AddressResponse> getAddresses(Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        return addressRepository.findByUser(user)
                .stream()
                .map(this::map)
                .toList();
    }

    public AddressResponse updateAddress(Long id,
                                         AddressRequest request,
                                         Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        Address address = addressRepository.findByIdAndUser(id, user)
                .orElseThrow();

        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setAddressLine(request.getAddressLine());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setCountry(request.getCountry());
        address.setPostalCode(request.getPostalCode());
        address.setDefaultAddress(request.isDefaultAddress());

        addressRepository.save(address);

        return map(address);
    }

    public void deleteAddress(Long id,
                              Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        Address address = addressRepository.findByIdAndUser(id, user)
                .orElseThrow();

        addressRepository.delete(address);
    }

    private AddressResponse map(Address address) {

        return AddressResponse.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .addressLine(address.getAddressLine())
                .city(address.getCity())
                .state(address.getState())
                .country(address.getCountry())
                .postalCode(address.getPostalCode())
                .defaultAddress(address.isDefaultAddress())
                .build();
    }
    @Transactional
    public AddressResponse setDefaultAddress(Long id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        // Find the address to set as default
        Address address = addressRepository.findByIdAndUser(id, user)
                .orElseThrow();

        // Unset all other default addresses for this user
        List<Address> allAddresses = addressRepository.findByUser(user);
        for (Address addr : allAddresses) {
            if (addr.isDefaultAddress() && !addr.getId().equals(id)) {
                addr.setDefaultAddress(false);
                addressRepository.save(addr);
            }
        }

        // Set this one as default
        address.setDefaultAddress(true);
        addressRepository.save(address);

        return map(address);
    }
}