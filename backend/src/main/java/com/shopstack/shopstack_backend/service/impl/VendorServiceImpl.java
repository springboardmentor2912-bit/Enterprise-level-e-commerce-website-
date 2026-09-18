package com.shopstack.shopstack_backend.service.impl;

import com.shopstack.shopstack_backend.dto.request.VendorRequest;
import com.shopstack.shopstack_backend.dto.response.VendorResponse;
import com.shopstack.shopstack_backend.entity.User;
import com.shopstack.shopstack_backend.entity.Vendor;
import com.shopstack.shopstack_backend.repository.UserRepository;
import com.shopstack.shopstack_backend.repository.VendorRepository;
import com.shopstack.shopstack_backend.service.VendorService;
import org.springframework.stereotype.Service;

@Service
public class VendorServiceImpl implements VendorService {

    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;

    public VendorServiceImpl(VendorRepository vendorRepository,
                             UserRepository userRepository) {
        this.vendorRepository = vendorRepository;
        this.userRepository = userRepository;
    }

    @Override
    public VendorResponse createVendor(Long userId, VendorRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (vendorRepository.existsByBusinessEmail(request.getBusinessEmail())) {
            throw new RuntimeException("Business email already exists");
        }

        if (vendorRepository.existsByGstNumber(request.getGstNumber())) {
            throw new RuntimeException("GST Number already exists");
        }

        Vendor vendor = new Vendor();

        vendor.setUser(user);
        vendor.setBusinessName(request.getBusinessName());
        vendor.setBusinessEmail(request.getBusinessEmail());
        vendor.setBusinessPhone(request.getBusinessPhone());
        vendor.setBusinessAddress(request.getBusinessAddress());
        vendor.setGstNumber(request.getGstNumber());
        vendor.setApproved(false);

        Vendor savedVendor = vendorRepository.save(vendor);

        VendorResponse response = new VendorResponse();

        response.setId(savedVendor.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setBusinessName(savedVendor.getBusinessName());
        response.setBusinessEmail(savedVendor.getBusinessEmail());
        response.setBusinessPhone(savedVendor.getBusinessPhone());
        response.setBusinessAddress(savedVendor.getBusinessAddress());
        response.setGstNumber(savedVendor.getGstNumber());
        response.setApproved(savedVendor.isApproved());

        return response;
    }

    @Override
    public VendorResponse getVendorByUserId(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Vendor vendor = vendorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        VendorResponse response = new VendorResponse();

        response.setId(vendor.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setBusinessName(vendor.getBusinessName());
        response.setBusinessEmail(vendor.getBusinessEmail());
        response.setBusinessPhone(vendor.getBusinessPhone());
        response.setBusinessAddress(vendor.getBusinessAddress());
        response.setGstNumber(vendor.getGstNumber());
        response.setApproved(vendor.isApproved());

        return response;
    }
}