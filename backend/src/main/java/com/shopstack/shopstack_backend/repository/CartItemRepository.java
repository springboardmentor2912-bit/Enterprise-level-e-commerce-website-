package com.shopstack.shopstack_backend.repository;

import com.shopstack.shopstack_backend.entity.Cart;
import com.shopstack.shopstack_backend.entity.CartItem;
import com.shopstack.shopstack_backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartItemRepository
        extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartAndProduct(
            Cart cart,
            Product product
    );
}