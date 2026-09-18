package com.infosys.auth.service;

import com.infosys.auth.model.Product;
import com.infosys.auth.model.VendorProfile;
import com.infosys.auth.repository.OrderRepository;
import com.infosys.auth.repository.ProductRepository;
import com.infosys.auth.repository.VendorProfileRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class VendorService {

    private final VendorProfileRepository vendorProfileRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public VendorService(VendorProfileRepository vendorProfileRepository,
                         ProductRepository productRepository,
                         OrderRepository orderRepository) {
        this.vendorProfileRepository = vendorProfileRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    public VendorProfile getVendorProfile(Long userId) {
        return vendorProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    VendorProfile newProfile = new VendorProfile(
                            userId,
                            "Vendor Store #" + userId,
                            "Luxury verified seller storefront",
                            "vendor" + userId + "@shopnova.com",
                            "+1 (555) 019-2834",
                            "5th Avenue Commerce Plaza, NY",
                            "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&q=80"
                    );
                    return vendorProfileRepository.save(newProfile);
                });
    }

    public VendorProfile updateVendorProfile(Long userId, VendorProfile profile) {
        VendorProfile existing = getVendorProfile(userId);
        if (profile.getStoreName() != null) existing.setStoreName(profile.getStoreName());
        if (profile.getDescription() != null) existing.setDescription(profile.getDescription());
        if (profile.getBusinessEmail() != null) existing.setBusinessEmail(profile.getBusinessEmail());
        if (profile.getPhoneNumber() != null) existing.setPhoneNumber(profile.getPhoneNumber());
        if (profile.getAddress() != null) existing.setAddress(profile.getAddress());
        if (profile.getLogoUrl() != null) existing.setLogoUrl(profile.getLogoUrl());
        return vendorProfileRepository.save(existing);
    }

    public Map<String, Object> getVendorStats(Long userId) {
        List<Product> vendorProducts = productRepository.findByVendorId(userId);
        int totalProducts = vendorProducts.size();
        long lowStockCount = vendorProducts.stream().filter(p -> p.getStockQuantity() < 10).count();

        // Calculate sales estimate
        BigDecimal totalSales = vendorProducts.stream()
                .map(p -> p.getPrice().multiply(BigDecimal.valueOf(15)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", totalProducts);
        stats.put("lowStockCount", lowStockCount);
        stats.put("estimatedSales", totalSales);
        stats.put("storeRating", 4.9);
        stats.put("totalOrdersCount", totalProducts * 8);

        return stats;
    }
}
