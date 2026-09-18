package com.shopstack.shopstack_backend.service.impl;

import com.shopstack.shopstack_backend.constant.RoleName;
import com.shopstack.shopstack_backend.dto.response.VendorResponse;
import com.shopstack.shopstack_backend.entity.Role;
import com.shopstack.shopstack_backend.entity.User;
import com.shopstack.shopstack_backend.entity.Vendor;
import com.shopstack.shopstack_backend.repository.RoleRepository;
import com.shopstack.shopstack_backend.repository.UserRepository;
import com.shopstack.shopstack_backend.repository.VendorRepository;
import com.shopstack.shopstack_backend.service.AdminService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminServiceImpl implements AdminService {

    private final VendorRepository vendorRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    public AdminServiceImpl(
            VendorRepository vendorRepository,
            RoleRepository roleRepository,
            UserRepository userRepository) {

        this.vendorRepository = vendorRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public VendorResponse approveVendor(Long vendorId) {

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() ->
                        new RuntimeException("Vendor not found"));

        User user = vendor.getUser();

        Role vendorRole = roleRepository
                .findByRoleName(RoleName.ROLE_VENDOR)
                .orElseThrow(() ->
                        new RuntimeException("Vendor role not found"));

        vendor.setApproved(true);
        user.setRole(vendorRole);

        userRepository.save(user);
        Vendor savedVendor = vendorRepository.save(vendor);

        return mapToResponse(savedVendor);
    }

    @Override
    @Transactional
    public VendorResponse rejectVendor(Long vendorId) {

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() ->
                        new RuntimeException("Vendor not found"));

        vendor.setApproved(false);

        Vendor savedVendor = vendorRepository.save(vendor);

        return mapToResponse(savedVendor);
    }

    private VendorResponse mapToResponse(Vendor vendor) {

        User user = vendor.getUser();

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