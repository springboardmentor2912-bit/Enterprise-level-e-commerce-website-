package com.infosys.auth.service;

import com.infosys.auth.model.Product;
import com.infosys.auth.model.User;
import com.infosys.auth.repository.ProductRepository;
import com.infosys.auth.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ProductService(ProductRepository productRepository,
                          UserRepository userRepository,
                          NotificationService notificationService) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public List<Product> getAllProducts(String query, String category, Boolean approved) {
        String q = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        String cat = (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("ALL")) ? category.trim() : null;
        
        if (q == null && cat == null && approved == null) {
            return productRepository.findAll();
        }
        return productRepository.searchProducts(q, cat, approved);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    public List<Product> getProductsByVendor(Long vendorId) {
        return productRepository.findByVendorId(vendorId);
    }

    public Product createProduct(Product product) {
        Product saved = productRepository.save(product);
        // Notify all admin users about the new pending product
        String vendorLabel = saved.getVendorName() != null ? saved.getVendorName() : "a vendor";
        String msg = "New product \"" + saved.getName() + "\" by " + vendorLabel + " is pending approval.";
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.ADMIN)
                .toList();
        admins.forEach(admin -> notificationService.createNotification(admin.getId(), "PRODUCT_ADDED", msg));
        return saved;
    }

    public Product updateProduct(Long id, Product details) {
        Product product = getProductById(id);
        Boolean previousApproved = product.getApproved();

        if (details.getName() != null) product.setName(details.getName());
        if (details.getDescription() != null) product.setDescription(details.getDescription());
        if (details.getPrice() != null) product.setPrice(details.getPrice());
        if (details.getCategory() != null) product.setCategory(details.getCategory());
        if (details.getStockQuantity() != null) product.setStockQuantity(details.getStockQuantity());
        if (details.getImageUrl() != null) product.setImageUrl(details.getImageUrl());
        if (details.getSku() != null) product.setSku(details.getSku());
        if (details.getDiscount() != null) product.setDiscount(details.getDiscount());
        if (details.getApproved() != null) product.setApproved(details.getApproved());
        
        Product saved = productRepository.save(product);

        // Notify vendor if admin changes product approval status
        if (details.getApproved() != null && !details.getApproved().equals(previousApproved) && saved.getVendorId() != null) {
            String statusLabel = saved.getApproved() ? "approved ✅" : "pending / revoked ❌";
            String msg = "Your product \"" + saved.getName() + "\" has been " + statusLabel + " by admin.";
            notificationService.createNotification(saved.getVendorId(), "PRODUCT_STATUS_CHANGED", msg);
        }

        return saved;
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
