package com.shopstack.backend.service;

import com.shopstack.backend.dto.AddressRequest;
import com.shopstack.backend.dto.AddressResponse;
import com.shopstack.backend.entity.Address;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.repository.AddressRepository;
import com.shopstack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;


    public List<AddressResponse> getMyAddresses(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Address> addresses =
                addressRepository.findByUser(user);

        List<AddressResponse> responseList = new ArrayList<>();

        for (Address address : addresses) {
            responseList.add(convertToResponse(address));
        }

        return responseList;
    }


    public AddressResponse addAddress(
            String email,
            AddressRequest request
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.isDefaultAddress()) {
            removeExistingDefault(user);
        }

        Address address = new Address();

        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setAddressLine(request.getAddressLine());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPincode(request.getPincode());
        address.setLabel(request.getLabel());
        address.setDefaultAddress(request.isDefaultAddress());
        address.setUser(user);

        Address savedAddress =
                addressRepository.save(address);

        return convertToResponse(savedAddress);
    }


    public AddressResponse updateAddress(
            Long id,
            String email,
            AddressRequest request
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Address address =
                addressRepository.findByIdAndUser(id, user)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Address not found or access denied"
                                )
                        );

        if (request.isDefaultAddress()) {
            removeExistingDefault(user);
        }

        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setAddressLine(request.getAddressLine());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPincode(request.getPincode());
        address.setLabel(request.getLabel());
        address.setDefaultAddress(request.isDefaultAddress());

        Address updatedAddress =
                addressRepository.save(address);

        return convertToResponse(updatedAddress);
    }


    public String deleteAddress(
            Long id,
            String email
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Address address =
                addressRepository.findByIdAndUser(id, user)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Address not found or access denied"
                                )
                        );

        addressRepository.delete(address);

        return "Address Deleted Successfully";
    }


    private void removeExistingDefault(User user) {

        List<Address> addresses =
                addressRepository.findByUser(user);

        for (Address address : addresses) {

            if (address.isDefaultAddress()) {
                address.setDefaultAddress(false);
                addressRepository.save(address);
            }
        }
    }


    private AddressResponse convertToResponse(Address address) {

        AddressResponse response = new AddressResponse();

        response.setId(address.getId());
        response.setFullName(address.getFullName());
        response.setPhone(address.getPhone());
        response.setAddressLine(address.getAddressLine());
        response.setCity(address.getCity());
        response.setState(address.getState());
        response.setPincode(address.getPincode());
        response.setLabel(address.getLabel());
        response.setDefaultAddress(
                address.isDefaultAddress()
        );

        return response;
    }
}