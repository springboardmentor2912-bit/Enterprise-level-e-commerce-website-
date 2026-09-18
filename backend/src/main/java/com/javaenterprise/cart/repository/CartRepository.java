package com.javaenterprise.cart.repository;

import com.javaenterprise.cart.entity.Cart;
import com.javaenterprise.product.entity.Product;
import com.javaenterprise.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    List<Cart> findByUser(User user);

    Optional<Cart> findByUserAndProduct(User user, Product product);

    void deleteByUser(User user);
}