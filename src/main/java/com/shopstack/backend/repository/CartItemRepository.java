package com.shopstack.backend.repository;

import com.shopstack.backend.entity.Cart;
import com.shopstack.backend.entity.CartItem;
import com.shopstack.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);

    List<CartItem> findByCart(Cart cart);
}