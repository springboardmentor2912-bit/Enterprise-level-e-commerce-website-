package com.shopstack.shopstack_backend.service.impl;

import com.shopstack.shopstack_backend.dto.response.CartItemResponse;
import com.shopstack.shopstack_backend.dto.response.CartResponse;
import com.shopstack.shopstack_backend.entity.Cart;
import com.shopstack.shopstack_backend.entity.CartItem;
import com.shopstack.shopstack_backend.entity.Product;
import com.shopstack.shopstack_backend.entity.User;
import com.shopstack.shopstack_backend.repository.CartRepository;
import com.shopstack.shopstack_backend.repository.ProductRepository;
import com.shopstack.shopstack_backend.repository.UserRepository;
import com.shopstack.shopstack_backend.service.CartService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartServiceImpl(
            CartRepository cartRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {

        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // =========================
    // ADD TO CART
    // =========================

    @Override
    @Transactional
    public CartResponse addToCart(
            Long productId,
            Integer quantity) {

        if (quantity == null || quantity <= 0) {
            throw new RuntimeException(
                    "Quantity must be greater than zero"
            );
        }

        User user = getAuthenticatedUser();

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found"
                        )
                );

        if (!product.isActive()) {
            throw new RuntimeException(
                    "Product is not active"
            );
        }

        if (product.getStockQuantity() == null ||
                product.getStockQuantity() <= 0) {

            throw new RuntimeException(
                    product.getProductName()
                            + " is Out of Stock"
            );
        }

        Cart cart = cartRepository
                .findByUser(user)
                .orElseGet(() -> {

                    Cart newCart = new Cart();
                    newCart.setUser(user);

                    return cartRepository.save(newCart);
                });

        CartItem cartItem = cart.getItems()
                .stream()
                .filter(item ->
                        item.getProduct()
                                .getId()
                                .equals(productId)
                )
                .findFirst()
                .orElse(null);

        int finalQuantity;

        if (cartItem == null) {

            cartItem = new CartItem();

            cartItem.setProduct(product);

            finalQuantity = quantity;

            cart.addItem(cartItem);

        } else {

            finalQuantity =
                    cartItem.getQuantity() + quantity;
        }

        if (finalQuantity > product.getStockQuantity()) {

            throw new RuntimeException(
                    "Insufficient stock for "
                            + product.getProductName()
                            + ". Available: "
                            + product.getStockQuantity()
                            + ", Requested: "
                            + finalQuantity
            );
        }

        /*
         * IMPORTANT:
         *
         * Always use finalPrice,
         * not original price.
         */
        BigDecimal unitPrice =
                product.getFinalPrice();

        cartItem.setQuantity(finalQuantity);
        cartItem.setUnitPrice(unitPrice);

        BigDecimal subtotal =
                unitPrice.multiply(
                        BigDecimal.valueOf(finalQuantity)
                );

        cartItem.setSubtotal(subtotal);

        /*
         * CascadeType.ALL saves the CartItem.
         */
        Cart savedCart =
                cartRepository.save(cart);

        return mapToResponse(savedCart);
    }

    // =========================
    // GET MY CART
    // =========================

    @Override
    @Transactional(readOnly = true)
    public CartResponse getMyCart() {

        User user = getAuthenticatedUser();

        Cart cart = cartRepository
                .findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Cart not found"
                        )
                );

        return mapToResponse(cart);
    }

    // =========================
    // UPDATE CART ITEM
    // =========================

    @Override
    @Transactional
    public CartResponse updateCartItem(
            Long productId,
            Integer quantity) {

        if (quantity == null || quantity <= 0) {
            throw new RuntimeException(
                    "Quantity must be greater than zero"
            );
        }

        User user = getAuthenticatedUser();

        Cart cart = cartRepository
                .findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Cart not found"
                        )
                );

        CartItem cartItem = cart.getItems()
                .stream()
                .filter(item ->
                        item.getProduct()
                                .getId()
                                .equals(productId)
                )
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product is not in cart"
                        )
                );

        Product product = cartItem.getProduct();

        if (quantity > product.getStockQuantity()) {

            throw new RuntimeException(
                    "Insufficient stock for "
                            + product.getProductName()
                            + ". Available: "
                            + product.getStockQuantity()
                            + ", Requested: "
                            + quantity
            );
        }

        BigDecimal unitPrice =
                product.getFinalPrice();

        cartItem.setQuantity(quantity);
        cartItem.setUnitPrice(unitPrice);

        BigDecimal subtotal =
                unitPrice.multiply(
                        BigDecimal.valueOf(quantity)
                );

        cartItem.setSubtotal(subtotal);

        Cart savedCart =
                cartRepository.save(cart);

        return mapToResponse(savedCart);
    }

    // =========================
    // REMOVE FROM CART
    // =========================

    @Override
    @Transactional
    public void removeFromCart(Long productId) {

        User user = getAuthenticatedUser();

        Cart cart = cartRepository
                .findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Cart not found"
                        )
                );

        CartItem cartItem = cart.getItems()
                .stream()
                .filter(item ->
                        item.getProduct()
                                .getId()
                                .equals(productId)
                )
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product is not in cart"
                        )
                );

        cart.removeItem(cartItem);

        cartRepository.save(cart);
    }

    // =========================
    // CLEAR CART
    // =========================

    @Override
    @Transactional
    public void clearCart() {

        User user = getAuthenticatedUser();

        Cart cart = cartRepository
                .findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Cart not found"
                        )
                );

        cart.getItems().clear();

        cartRepository.save(cart);
    }

    // =========================
    // GET AUTHENTICATED USER
    // =========================

    private User getAuthenticatedUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String email = authentication.getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );
    }

    // =========================
    // MAP CART TO RESPONSE
    // =========================

    private CartResponse mapToResponse(Cart cart) {

        List<CartItemResponse> items =
                cart.getItems()
                        .stream()
                        .map(item ->
                                new CartItemResponse(
                                        item.getProduct().getId(),
                                        item.getProduct().getProductName(),
                                        item.getUnitPrice(),
                                        item.getQuantity(),
                                        item.getSubtotal()
                                )
                        )
                        .toList();

        BigDecimal totalAmount =
                items.stream()
                        .map(CartItemResponse::getSubtotal)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        return new CartResponse(
                cart.getId(),
                items,
                totalAmount
        );
    }
}