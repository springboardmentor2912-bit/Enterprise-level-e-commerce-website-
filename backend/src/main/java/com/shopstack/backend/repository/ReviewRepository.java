package com.shopstack.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shopstack.backend.model.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdOrderByIdDesc(Long productId);
    List<Review> findByUserIdAndProductId(Long userId, Long productId);
    List<Review> findAllByOrderByIdDesc();
}

