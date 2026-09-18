package com.shopstack.service;

import com.shopstack.dto.ProductReviewDTO;
import com.shopstack.dto.ProductReviewRequest;
import com.shopstack.entity.Customer;
import com.shopstack.entity.Product;
import com.shopstack.entity.ProductReview;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.CustomerRepository;
import com.shopstack.repository.ProductRepository;
import com.shopstack.repository.ProductReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductReviewServiceImpl implements ProductReviewService {

    private final ProductReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    public ProductReviewServiceImpl(ProductReviewRepository reviewRepository,
                                    ProductRepository productRepository,
                                    CustomerRepository customerRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    @Transactional
    public ProductReviewDTO addReview(Long productId, String customerEmail, ProductReviewRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found for email: " + customerEmail));

        ProductReview review = new ProductReview();
        review.setProduct(product);
        review.setCustomer(customer);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        ProductReview savedReview = reviewRepository.save(review);

        // Recalculate average rating for product
        List<ProductReview> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        double avgRating = reviews.stream().mapToInt(ProductReview::getRating).average().orElse(0.0);
        product.setRating(Math.round(avgRating * 10.0) / 10.0);
        product.setReviewCount(reviews.size());
        productRepository.save(product);

        return new ProductReviewDTO(savedReview);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductReviewDTO> getReviewsByProduct(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(ProductReviewDTO::new)
                .collect(Collectors.toList());
    }
}
