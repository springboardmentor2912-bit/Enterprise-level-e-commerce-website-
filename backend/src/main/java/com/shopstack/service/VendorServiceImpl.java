package com.shopstack.service;

import com.shopstack.dto.*;
import com.shopstack.entity.ApprovalStatus;
import com.shopstack.entity.OrderItem;
import com.shopstack.entity.Product;
import com.shopstack.entity.Vendor;
import com.shopstack.exception.CustomerAlreadyExistsException;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.OrderItemRepository;
import com.shopstack.repository.ProductRepository;
import com.shopstack.repository.VendorRepository;
import com.shopstack.security.JwtUtils;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class VendorServiceImpl implements VendorService {

    private final VendorRepository vendorRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public VendorServiceImpl(VendorRepository vendorRepository,
                             ProductRepository productRepository,
                             OrderItemRepository orderItemRepository,
                             PasswordEncoder passwordEncoder,
                             JwtUtils jwtUtils) {
        this.vendorRepository = vendorRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Override
    @Transactional
    public VendorAuthResponse registerVendor(VendorRegisterRequest request) {
        if (vendorRepository.existsByEmail(request.getEmail())) {
            throw new CustomerAlreadyExistsException("Vendor email is already registered: " + request.getEmail());
        }

        Vendor vendor = new Vendor();
        vendor.setBusinessName(request.getBusinessName());
        vendor.setEmail(request.getEmail());
        vendor.setPassword(passwordEncoder.encode(request.getPassword()));
        vendor.setPhone(request.getPhone());
        vendor.setAddress(request.getAddress());
        vendor.setDescription(request.getDescription());

        Vendor savedVendor = vendorRepository.save(vendor);
        String token = jwtUtils.generateTokenFromUsername(savedVendor.getEmail());

        return new VendorAuthResponse(token, new VendorDTO(savedVendor));
    }

    @Override
    public VendorAuthResponse loginVendor(VendorLoginRequest request) {
        Vendor vendor = vendorRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with email: " + request.getEmail()));

        if (!passwordEncoder.matches(request.getPassword(), vendor.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtUtils.generateTokenFromUsername(vendor.getEmail());
        return new VendorAuthResponse(token, new VendorDTO(vendor));
    }

    @Override
    @Transactional(readOnly = true)
    public VendorDTO getVendorByEmail(String email) {
        Vendor vendor = vendorRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found for email: " + email));
        return new VendorDTO(vendor);
    }

    @Override
    @Transactional(readOnly = true)
    public VendorAnalyticsDTO getVendorAnalytics(String email) {
        Vendor vendor = vendorRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found for email: " + email));

        List<Product> products = productRepository.findByVendorId(vendor.getId());
        List<OrderItem> salesItems = orderItemRepository.findByVendorIdOrderByOrderCreatedAtDesc(vendor.getId());

        long totalProducts = products.size();
        long pendingApprovals = products.stream().filter(p -> p.getApprovalStatus() == ApprovalStatus.PENDING).count();
        long lowStockProducts = products.stream().filter(p -> p.getStockQuantity() < 5).count();

        long totalSalesCount = salesItems.stream().mapToInt(OrderItem::getQuantity).sum();
        BigDecimal totalRevenue = salesItems.stream()
                .map(item -> item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new VendorAnalyticsDTO(totalProducts, totalSalesCount, totalRevenue, pendingApprovals, lowStockProducts);
    }
}
