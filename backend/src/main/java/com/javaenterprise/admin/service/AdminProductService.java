package com.javaenterprise.admin.service;

import com.javaenterprise.admin.dto.AdminProductResponse;
import com.javaenterprise.product.entity.Product;
import com.javaenterprise.product.entity.ProductStatus;
import com.javaenterprise.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminProductService {

    private final ProductRepository productRepository;

    // Pending Products
    public List<AdminProductResponse> getPendingProducts() {

        return productRepository.findByStatus(ProductStatus.PENDING)
                .stream()
                .map(this::map)
                .toList();
    }

    // All Products
    public List<AdminProductResponse> getAllProducts() {

        return productRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::map)
                .toList();
    }

    // Approve Product
    public AdminProductResponse approveProduct(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setStatus(ProductStatus.APPROVED);

        productRepository.save(product);

        return map(product);
    }

    // Reject Product
    public AdminProductResponse rejectProduct(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setStatus(ProductStatus.REJECTED);

        productRepository.save(product);

        return map(product);
    }

    // Disable Product
    public AdminProductResponse disableProduct(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setActive(false);

        productRepository.save(product);

        return map(product);
    }

    // Enable Product
    public AdminProductResponse enableProduct(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setActive(true);

        productRepository.save(product);

        return map(product);
    }

    private AdminProductResponse map(Product product) {

        return AdminProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .active(product.isActive())
                .status(product.getStatus())
                .category(product.getCategory().getName())
                .vendor(product.getVendor().getName())
                .build();
    }
}