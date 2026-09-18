package com.shopstack.shopstack_backend.repository;

import com.shopstack.shopstack_backend.entity.Cart;
import com.shopstack.shopstack_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUser(User user);
}