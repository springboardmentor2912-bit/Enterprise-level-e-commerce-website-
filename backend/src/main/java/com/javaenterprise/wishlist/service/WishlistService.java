package com.javaenterprise.wishlist.service;

import com.javaenterprise.product.entity.Product;
import com.javaenterprise.product.repository.ProductRepository;
import com.javaenterprise.user.entity.User;
import com.javaenterprise.user.repository.UserRepository;
import com.javaenterprise.wishlist.dto.WishlistRequest;
import com.javaenterprise.wishlist.dto.WishlistResponse;
import com.javaenterprise.wishlist.entity.Wishlist;
import com.javaenterprise.wishlist.repository.WishlistRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public WishlistResponse add(Authentication authentication,
                                WishlistRequest request) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow();

        if (wishlistRepository.findByUserAndProduct(user, product).isPresent()) {
            throw new RuntimeException("Product already in wishlist");
        }

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .build();

        wishlistRepository.save(wishlist);

        return map(wishlist);
    }

    public List<WishlistResponse> get(Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        return wishlistRepository.findByUser(user)
                .stream()
                .map(this::map)
                .toList();
    }
    @Transactional
    public void remove(Long productId,
                       Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        Product product = productRepository.findById(productId)
                .orElseThrow();

        wishlistRepository.deleteByUserAndProduct(user, product);
    }

    private WishlistResponse map(Wishlist wishlist) {

        return WishlistResponse.builder()
                .wishlistId(wishlist.getId())
                .productId(wishlist.getProduct().getId())
                .productName(wishlist.getProduct().getName())
                .imageUrl(wishlist.getProduct().getImageUrl())
                .price(wishlist.getProduct().getPrice())
                .category(wishlist.getProduct().getCategory().getName())
                .build();
    }
}