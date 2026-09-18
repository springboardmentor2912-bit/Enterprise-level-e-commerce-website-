package com.shopstack.repository;

import com.shopstack.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);
    boolean existsByUserIdAndProductId(Long userId, Long productId);

    @org.springframework.data.jpa.repository.Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double findAverageRatingByProductId(Long productId);

    long countByProductId(Long productId);
}
