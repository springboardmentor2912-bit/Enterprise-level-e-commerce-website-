package com.shopstack.service;

import com.shopstack.model.Role;
import com.shopstack.model.User;
import com.shopstack.model.VendorProfile;
import com.shopstack.model.VendorStatus;
import com.shopstack.repository.UserRepository;
import com.shopstack.repository.VendorProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VendorService {

    private final VendorProfileRepository vendorProfileRepository;
    private final UserRepository userRepository;

    public VendorService(VendorProfileRepository vendorProfileRepository, UserRepository userRepository) {
        this.vendorProfileRepository = vendorProfileRepository;
        this.userRepository = userRepository;
    }

    public List<VendorProfile> getAllVendors() {
        return vendorProfileRepository.findAll();
    }

    public List<VendorProfile> getVendorsByStatus(VendorStatus status) {
        return vendorProfileRepository.findByStatus(status);
    }

    public VendorProfile getVendorById(Long id) {
        return vendorProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor profile not found with ID: " + id));
    }

    public VendorProfile getVendorByUserId(Long userId) {
        return vendorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Vendor profile not found for user ID: " + userId));
    }

    @Transactional
    public VendorProfile updateVendorStatus(Long vendorId, VendorStatus status) {
        VendorProfile vendor = getVendorById(vendorId);
        vendor.setStatus(status);
        if (status == VendorStatus.APPROVED) {
            User user = vendor.getUser();
            user.setRole(Role.VENDOR);
            userRepository.save(user);
        }
        return vendorProfileRepository.save(vendor);
    }

    @Transactional
    public VendorProfile updateVendorProfile(Long vendorId, String storeName, String description, String logoUrl) {
        VendorProfile vendor = getVendorById(vendorId);
        if (storeName != null) vendor.setStoreName(storeName);
        if (description != null) vendor.setDescription(description);
        if (logoUrl != null) vendor.setLogoUrl(logoUrl);
        return vendorProfileRepository.save(vendor);
    }
}
