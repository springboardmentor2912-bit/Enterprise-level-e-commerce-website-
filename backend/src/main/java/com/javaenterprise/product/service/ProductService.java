package com.javaenterprise.product.service;

import com.javaenterprise.product.dto.ProductRequest;
import com.javaenterprise.product.dto.ProductResponse;
import com.javaenterprise.product.entity.Category;
import com.javaenterprise.product.entity.Product;
import com.javaenterprise.product.entity.ProductStatus;
import com.javaenterprise.product.repository.CategoryRepository;
import com.javaenterprise.product.repository.ProductRepository;
import com.javaenterprise.user.entity.User;
import com.javaenterprise.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public ProductResponse add(ProductRequest request,
                               Authentication authentication){

        User vendor = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow();

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .category(category)
                .vendor(vendor)
                .active(true)
                .status(ProductStatus.PENDING)
                .build();

        productRepository.save(product);
        System.out.println("Saved successfully");
        return map(product);
    }

    public List<ProductResponse> getAll() {

        return productRepository
                .findByActiveTrueAndStatus(ProductStatus.APPROVED)
                .stream()
                .map(this::map)
                .toList();
    }

    public ProductResponse getById(Long id){

        Product product = productRepository.findById(id)
                .orElseThrow();

        return map(product);
    }

    public ProductResponse update(Long id,
                                  ProductRequest request){

        Product product = productRepository.findById(id)
                .orElseThrow();

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow();

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);

        productRepository.save(product);

        return map(product);
    }

    public void delete(Long id){

        Product product = productRepository.findById(id)
                .orElseThrow();

        productRepository.delete(product);
    }

    private ProductResponse map(Product product){

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .active(product.isActive())
                .category(product.getCategory() != null ? product.getCategory().getName() : null)
                .vendor(product.getVendor() != null ? product.getVendor().getName() : null)
                .status(product.getStatus())
                .discountPercentage(product.getDiscountPercentage() != null ? product.getDiscountPercentage() : 0)
                .build();
    }
    public List<ProductResponse> search(String keyword) {

        return productRepository
                .findByNameContainingIgnoreCaseAndActiveTrueAndStatus(
                        keyword,
                        ProductStatus.APPROVED
                )
                .stream()
                .map(this::map)
                .toList();
    }

    public List<ProductResponse> category(String category) {

        return productRepository
                .findByCategory_NameIgnoreCaseAndActiveTrueAndStatus(
                        category,
                        ProductStatus.APPROVED
                )
                .stream()
                .map(this::map)
                .toList();
    }

    public List<ProductResponse> price(BigDecimal min, BigDecimal max) {

        return productRepository
                .findByPriceBetweenAndActiveTrueAndStatus(
                        min,
                        max,
                        ProductStatus.APPROVED
                )
                .stream()
                .map(this::map)
                .toList();
    }
    public List<ProductResponse> getVendorProducts(Authentication authentication) {

        User vendor = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        return productRepository
                .findByVendor(vendor)
                .stream()
                .map(this::map)
                .toList();
    }
    @Transactional
    public ProductResponse updateDiscount(Long id, Integer discount, Authentication authentication) {

        User vendor = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        Product product = productRepository.findByIdAndVendor(id, vendor)
                .orElseThrow(() -> new RuntimeException("Product not found or access denied"));

        if (discount == null || discount < 0 || discount > 90) {
            throw new RuntimeException("Discount must be between 0 and 90");
        }

        product.setDiscountPercentage(discount);
        Product saved = productRepository.save(product);

        // ✅ Build response directly — no mapToResponse needed
        return ProductResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .description(saved.getDescription())
                .price(saved.getPrice())
                .stock(saved.getStock())
                .imageUrl(saved.getImageUrl())
                .active(saved.isActive())
                .category(saved.getCategory() != null ? saved.getCategory().getName() : null)
                .vendor(saved.getVendor() != null ? saved.getVendor().getName() : null)
                .status(saved.getStatus())
                .discountPercentage(saved.getDiscountPercentage())
                .build();
    }
    @Transactional
    public ProductResponse updateStock(Long id, Integer stock, Authentication authentication) {
        User vendor = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        // Security check: ensures vendor can only update their OWN products
        Product product = productRepository.findByIdAndVendor(id, vendor)
                .orElseThrow(() -> new RuntimeException("Product not found or access denied"));

        if (stock == null || stock < 0) {
            throw new RuntimeException("Stock cannot be negative");
        }

        product.setStock(stock);
        Product saved = productRepository.save(product);

        return ProductResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .description(saved.getDescription())
                .price(saved.getPrice())
                .stock(saved.getStock())
                .imageUrl(saved.getImageUrl())
                .active(saved.isActive())
                .category(saved.getCategory() != null ? saved.getCategory().getName() : null)
                .vendor(saved.getVendor() != null ? saved.getVendor().getName() : null)
                .status(saved.getStatus())
                .discountPercentage(saved.getDiscountPercentage())
                .build();
    }

    @Transactional
    public ProductResponse updatePrice(Long id, BigDecimal price, Authentication authentication) {
        User vendor = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        // Security check: ensures vendor can only update their OWN products
        Product product = productRepository.findByIdAndVendor(id, vendor)
                .orElseThrow(() -> new RuntimeException("Product not found or access denied"));

        if (price == null || price.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Price cannot be negative");
        }

        product.setPrice(price);
        Product saved = productRepository.save(product);

        return ProductResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .description(saved.getDescription())
                .price(saved.getPrice())
                .stock(saved.getStock())
                .imageUrl(saved.getImageUrl())
                .active(saved.isActive())
                .category(saved.getCategory() != null ? saved.getCategory().getName() : null)
                .vendor(saved.getVendor() != null ? saved.getVendor().getName() : null)
                .status(saved.getStatus())
                .discountPercentage(saved.getDiscountPercentage())
                .build();
    }
}