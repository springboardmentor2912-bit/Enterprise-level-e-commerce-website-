package com.shopstack.service;

import com.shopstack.dto.product.WishlistItemResponse;
import com.shopstack.entity.Product;
import com.shopstack.entity.User;
import com.shopstack.entity.Wishlist;
import com.shopstack.exception.BadRequestException;
import com.shopstack.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductService productService;
    private final UserService userService;

    @Transactional
    public Wishlist addToWishlist(Long userId, Long productId) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new BadRequestException("Product already in your wishlist");
        }
        User user = userService.getById(userId);
        Product product = productService.getById(productId);
        return wishlistRepository.save(Wishlist.builder().user(user).product(product).build());
    }

    public List<Wishlist> getMyWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId);
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    public WishlistItemResponse toResponse(Wishlist wishlist) {
        return WishlistItemResponse.builder()
                .id(wishlist.getId())
                .product(productService.toResponse(wishlist.getProduct()))
                .addedAt(wishlist.getAddedAt())
                .build();
    }
}
