package com.shopstack.service;

import com.shopstack.dto.product.ReviewRequest;
import com.shopstack.dto.product.ReviewResponse;
import com.shopstack.entity.Product;
import com.shopstack.entity.Review;
import com.shopstack.entity.User;
import com.shopstack.exception.BadRequestException;
import com.shopstack.repository.ProductRepository;
import com.shopstack.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final UserService userService;

    @Transactional
    public Review addReview(Long userId, Long productId, ReviewRequest request) {
        if (reviewRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new BadRequestException("You have already reviewed this product");
        }
        User user = userService.getById(userId);
        Product product = productService.getById(productId);

        Review review = reviewRepository.save(Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .build());

        recalculateProductRating(product);
        return review;
    }

    public Page<Review> getProductReviews(Long productId, Pageable pageable) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
    }

    public ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .reviewerName(review.getUser().getFullName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }

    private void recalculateProductRating(Product product) {
        Double avg = reviewRepository.findAverageRatingByProductId(product.getId());
        long count = reviewRepository.countByProductId(product.getId());
        product.setAverageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        product.setReviewCount((int) count);
        productRepository.save(product);
    }
}
