package com.shopstack.backend.service;

import com.shopstack.backend.dto.AddToCartRequest;
import com.shopstack.backend.dto.CartItemResponse;
import com.shopstack.backend.dto.CartResponse;
import com.shopstack.backend.entity.Cart;
import com.shopstack.backend.entity.CartItem;
import com.shopstack.backend.entity.Product;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.repository.CartItemRepository;
import com.shopstack.backend.repository.CartRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;


    // Add product to cart
    public String addToCart(String email, AddToCartRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be greater than zero");
        }

        if (product.getStock() <= 0) {
            throw new RuntimeException("Product is Out of Stock");
        }

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> {

                    Cart newCart = new Cart();
                    newCart.setUser(user);

                    return cartRepository.save(newCart);
                });

        CartItem cartItem = cartItemRepository
                .findByCartAndProduct(cart, product)
                .orElse(null);

        int newQuantity;

        if (cartItem != null) {

            newQuantity = cartItem.getQuantity() + request.getQuantity();

            if (newQuantity > product.getStock()) {
                throw new RuntimeException(
                        "Only " + product.getStock() + " items available"
                );
            }

            cartItem.setQuantity(newQuantity);

        } else {

            if (request.getQuantity() > product.getStock()) {
                throw new RuntimeException(
                        "Only " + product.getStock() + " items available"
                );
            }

            cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(request.getQuantity());
        }

        cartItemRepository.save(cartItem);

        return "Product Added To Cart";
    }


    // Get current user's cart
    public CartResponse getCart(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElse(null);

        CartResponse response = new CartResponse();

        List<CartItemResponse> items = new ArrayList<>();

        if (cart == null) {
            response.setItems(items);
            response.setTotal(0.0);

            return response;
        }

        List<CartItem> cartItems = cartItemRepository.findByCart(cart);

        double total = 0.0;

        for (CartItem cartItem : cartItems) {

            Product product = cartItem.getProduct();

            CartItemResponse itemResponse = new CartItemResponse();

            itemResponse.setId(cartItem.getId());
            itemResponse.setProductId(product.getId());
            itemResponse.setProductName(product.getName());
            itemResponse.setImageUrl(product.getImageUrl());
            Double sellingPrice = product.getFinalPrice();

            if (sellingPrice == null) {
                sellingPrice = product.getPrice();
            }

            itemResponse.setPrice(sellingPrice);

            itemResponse.setQuantity(cartItem.getQuantity());

            double subtotal =
                    sellingPrice * cartItem.getQuantity();

            itemResponse.setSubtotal(subtotal);

            total += subtotal;

            items.add(itemResponse);
        }

        response.setItems(items);
        response.setTotal(total);

        return response;
    }


    // Increase cart item quantity
    public String increaseQuantity(String email, Long cartItemId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Access denied");
        }

        Product product = cartItem.getProduct();

        if (cartItem.getQuantity() >= product.getStock()) {
            throw new RuntimeException(
                    "Cannot add more. Only " + product.getStock() + " available"
            );
        }

        cartItem.setQuantity(cartItem.getQuantity() + 1);

        cartItemRepository.save(cartItem);

        return "Quantity Increased";
    }


    // Decrease cart item quantity
    public String decreaseQuantity(String email, Long cartItemId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Access denied");
        }

        if (cartItem.getQuantity() <= 1) {

            cartItemRepository.delete(cartItem);

            return "Product Removed From Cart";
        }

        cartItem.setQuantity(cartItem.getQuantity() - 1);

        cartItemRepository.save(cartItem);

        return "Quantity Decreased";
    }


    // Remove item from cart
    public String removeFromCart(String email, Long cartItemId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Access denied");
        }

        cartItemRepository.delete(cartItem);

        return "Product Removed From Cart";
    }
}