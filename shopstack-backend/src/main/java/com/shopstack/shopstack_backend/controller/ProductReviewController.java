package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.entity.ProductReview;
import com.shopstack.shopstack_backend.repository.ProductReviewRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductReviewController {

    private final ProductReviewRepository reviewRepository;

    public ProductReviewController(
            ProductReviewRepository reviewRepository) {

        this.reviewRepository = reviewRepository;
    }


    @GetMapping("/product/{productId}")
    public List<ProductReview> getProductReviews(
            @PathVariable Long productId) {

        return reviewRepository
                .findByProductIdOrderByCreatedAtDesc(productId);
    }


    @PostMapping
    public ProductReview addReview(
            @RequestBody ProductReview review) {

        return reviewRepository.save(review);
    }
}