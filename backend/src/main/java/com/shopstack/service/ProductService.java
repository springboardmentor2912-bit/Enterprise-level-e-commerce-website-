package com.shopstack.service;

import com.shopstack.dto.CreateProductRequest;
import com.shopstack.model.*;
import com.shopstack.repository.CategoryRepository;
import com.shopstack.repository.ProductRepository;
import com.shopstack.repository.ReviewRepository;
import com.shopstack.repository.VendorProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final ReviewRepository reviewRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository, VendorProfileRepository vendorProfileRepository, ReviewRepository reviewRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.vendorProfileRepository = vendorProfileRepository;
        this.reviewRepository = reviewRepository;
    }

    private final List<ProductStatus> VISIBLE_STATUSES = List.of(ProductStatus.ACTIVE, ProductStatus.OUT_OF_STOCK);

    public List<Product> getAllActiveProducts() {
        return productRepository.findByStatusIn(VISIBLE_STATUSES);
    }

    public List<Product> getFeaturedProducts() {
        return productRepository.findByFeaturedTrueAndStatusIn(VISIBLE_STATUSES);
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryIdAndStatusIn(categoryId, VISIBLE_STATUSES);
    }

    public List<Product> searchProducts(String query) {
        if (query == null || query.isBlank()) {
            return getAllActiveProducts();
        }
        return productRepository.searchProductsInStatuses(query.trim(), VISIBLE_STATUSES);
    }

    public List<Product> getProductsByVendor(Long vendorId) {
        return productRepository.findByVendorProfileId(vendorId);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));
    }

    public List<Review> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    @Transactional
    public Product createProduct(Long vendorId, CreateProductRequest request) {
        VendorProfile vendor = vendorProfileRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor profile not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        String sku = "SKU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Product product = Product.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .brand(request.getBrand() != null ? request.getBrand() : vendor.getStoreName())
                .price(request.getPrice())
                .discountPrice(request.getDiscountPrice())
                .stockQuantity(request.getStockQuantity())
                .imageUrl(request.getImageUrl() != null && !request.getImageUrl().isBlank() ? request.getImageUrl() : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80")
                .sku(sku)
                .category(category)
                .vendorProfile(vendor)
                .status(ProductStatus.ACTIVE)
                .featured(false)
                .rating(5.0)
                .reviewCount(0)
                .build();

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProductStatus(Long productId, ProductStatus status) {
        Product product = getProductById(productId);
        product.setStatus(status);
        return productRepository.save(product);
    }

    @Transactional
    public Product addReview(Long productId, User user, Integer rating, String comment) {
        Product product = getProductById(productId);

        Review review = Review.builder()
                .product(product)
                .user(user)
                .rating(rating)
                .comment(comment)
                .build();

        reviewRepository.save(review);

        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        double avgRating = reviews.stream().mapToInt(Review::getRating).average().orElse(5.0);
        product.setRating(Math.round(avgRating * 10.0) / 10.0);
        product.setReviewCount(reviews.size());

        return productRepository.save(product);
    }

    @Transactional
    public Product updateStock(Long productId, Integer stockQuantity) {
        if (stockQuantity == null || stockQuantity < 0) {
            throw new IllegalArgumentException("Stock quantity must be a non-negative integer.");
        }
        Product product = getProductById(productId);
        product.setStockQuantity(stockQuantity);
        if (stockQuantity == 0) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        } else if (product.getStatus() == ProductStatus.OUT_OF_STOCK) {
            product.setStatus(ProductStatus.ACTIVE);
        }
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long productId, CreateProductRequest request) {
        Product product = getProductById(productId);
        if (request.getTitle() != null) product.setTitle(request.getTitle());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getDiscountPrice() != null) product.setDiscountPrice(request.getDiscountPrice());
        if (request.getStockQuantity() != null) {
            product.setStockQuantity(request.getStockQuantity());
            if (request.getStockQuantity() == 0) {
                product.setStatus(ProductStatus.OUT_OF_STOCK);
            } else if (product.getStatus() == ProductStatus.OUT_OF_STOCK) {
                product.setStatus(ProductStatus.ACTIVE);
            }
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }
        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            product.setImageUrl(request.getImageUrl());
        }
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
