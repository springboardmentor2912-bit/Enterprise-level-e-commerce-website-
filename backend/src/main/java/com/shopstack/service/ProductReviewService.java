package com.shopstack.service;

import com.shopstack.dto.ProductReviewDTO;
import com.shopstack.dto.ProductReviewRequest;

import java.util.List;

public interface ProductReviewService {
    ProductReviewDTO addReview(Long productId, String customerEmail, ProductReviewRequest request);
    List<ProductReviewDTO> getReviewsByProduct(Long productId);
}
