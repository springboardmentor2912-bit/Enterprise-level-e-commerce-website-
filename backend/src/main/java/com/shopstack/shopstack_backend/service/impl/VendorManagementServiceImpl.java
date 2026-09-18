package com.shopstack.shopstack_backend.service.impl;

import com.shopstack.shopstack_backend.dto.response.VendorResponse;
import com.shopstack.shopstack_backend.entity.Vendor;
import com.shopstack.shopstack_backend.service.VendorManagementService;
import com.shopstack.shopstack_backend.repository.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VendorManagementServiceImpl
        implements VendorManagementService {

    private final VendorRepository vendorRepository;

    public VendorManagementServiceImpl(
            VendorRepository vendorRepository) {

        this.vendorRepository = vendorRepository;
    }

    // =========================
    // GET ALL VENDORS
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<VendorResponse> getAllVendors() {

        return vendorRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================
    // GET VENDOR BY ID
    // =========================

    @Override
    @Transactional(readOnly = true)
    public VendorResponse getVendorById(Long id) {

        Vendor vendor =
                vendorRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor not found"
                                ));

        return mapToResponse(vendor);
    }

    // =========================
    // MAP VENDOR TO RESPONSE
    // =========================

    private VendorResponse mapToResponse(
            Vendor vendor) {

        return new VendorResponse(
                vendor.getId(),

                vendor.getUser() != null
                        ? vendor.getUser().getId()
                        : null,

                vendor.getUser() != null
                        ? vendor.getUser().getFirstName()
                        : null,

                vendor.getUser() != null
                        ? vendor.getUser().getLastName()
                        : null,

                vendor.getUser() != null
                        ? vendor.getUser().getEmail()
                        : null,

                vendor.getUser() != null
                        ? vendor.getUser().getPhoneNumber()
                        : null,

                vendor.getBusinessName(),

                vendor.getBusinessEmail(),

                vendor.getBusinessPhone(),

                vendor.getGstNumber(),

                vendor.getBusinessAddress(),

                vendor.isApproved()
        );
    }
}