package com.javaenterprise.wishlist.repository;

import com.javaenterprise.product.entity.Product;
import com.javaenterprise.user.entity.User;
import com.javaenterprise.wishlist.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    List<Wishlist> findByUser(User user);

    Optional<Wishlist> findByUserAndProduct(User user, Product product);

    void deleteByUserAndProduct(User user, Product product);
}