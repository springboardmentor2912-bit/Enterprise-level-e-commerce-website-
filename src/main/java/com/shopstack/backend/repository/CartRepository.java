package com.shopstack.backend.repository;

import com.shopstack.backend.entity.Cart;
import com.shopstack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUser(User user);
}