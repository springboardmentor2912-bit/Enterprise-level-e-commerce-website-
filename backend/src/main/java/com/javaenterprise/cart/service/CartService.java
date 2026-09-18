package com.javaenterprise.cart.service;

import com.javaenterprise.cart.dto.CartRequest;
import com.javaenterprise.cart.dto.CartResponse;
import com.javaenterprise.cart.dto.CartSummaryResponse;
import com.javaenterprise.cart.entity.Cart;
import com.javaenterprise.cart.repository.CartRepository;
import com.javaenterprise.product.entity.Product;
import com.javaenterprise.product.repository.ProductRepository;
import com.javaenterprise.user.entity.User;
import com.javaenterprise.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
// ✅ 1. ADD THIS IMPORT (Make sure it's the Spring one, not jakarta!)
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional // ✅ 2. ADD THIS ANNOTATION to wrap all write operations in a transaction
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartResponse addToCart(CartRequest request,
                                  Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow();

        Cart cart = cartRepository.findByUserAndProduct(user, product)
                .orElse(null);

        if (cart == null) {
            cart = Cart.builder()
                    .user(user)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
        } else {
            cart.setQuantity(cart.getQuantity() + request.getQuantity());
        }

        cartRepository.save(cart);

        return map(cart);
    }

    public CartSummaryResponse getCart(Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        List<Cart> items = cartRepository.findByUser(user);

        List<CartResponse> responses = items.stream()
                .map(this::map)
                .toList();

        BigDecimal total = responses.stream()
                .map(CartResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = responses.stream()
                .mapToInt(CartResponse::getQuantity)
                .sum();

        return CartSummaryResponse.builder()
                .items(responses)
                .totalAmount(total)
                .totalItems(totalItems)
                .build();
    }

    public CartResponse updateQuantity(Long cartId,
                                       CartRequest request,
                                       Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow();

        if (!cart.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        cart.setQuantity(request.getQuantity());

        cartRepository.save(cart);

        return map(cart);
    }

    public void removeItem(Long cartId,
                           Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow();

        if (!cart.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        // ✅ This will now work perfectly because of @Transactional
        cartRepository.delete(cart);
    }

    public void clearCart(Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        // ✅ This derived delete query also requires @Transactional
        cartRepository.deleteByUser(user);
    }



    private CartResponse map(Cart cart) {
        Product p = cart.getProduct();
        BigDecimal originalPrice = p.getPrice();

        // ✅ 1. Calculate the actual discounted price
        BigDecimal finalPrice = originalPrice;
        if (p.getDiscountPercentage() != null && p.getDiscountPercentage() > 0) {
            BigDecimal discountAmount = originalPrice
                    .multiply(BigDecimal.valueOf(p.getDiscountPercentage()))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            finalPrice = originalPrice.subtract(discountAmount);
        }

        // ✅ 2. Calculate subtotal using the DISCOUNTED price
        BigDecimal subtotal = finalPrice.multiply(BigDecimal.valueOf(cart.getQuantity()));

        return CartResponse.builder()
                .cartId(cart.getId())
                .productId(p.getId())
                .productName(p.getName())
                .imageUrl(p.getImageUrl())
                .price(originalPrice) // Keep original for UI strikethrough
                .discountPercentage(p.getDiscountPercentage() != null ? p.getDiscountPercentage() : 0)
                .quantity(cart.getQuantity())
                .subtotal(subtotal) // ✅ This ensures the backend total is correct!
                .build();
    }
}