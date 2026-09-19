package com.shopstack.shopstack_backend.repository;

import com.shopstack.shopstack_backend.entity.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductReviewRepository
        extends JpaRepository<ProductReview, Long> {

    List<ProductReview> findByProductIdOrderByCreatedAtDesc(Long productId);
}