package com.shopstack.backend.repository;

import com.shopstack.backend.entity.Product;
import com.shopstack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByVendor(User vendor);

    Optional<Product> findByIdAndVendor(Long id, User vendor);
}