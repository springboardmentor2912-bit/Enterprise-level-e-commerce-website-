package com.infosys.springboard.authentication.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infosys.springboard.authentication.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // ==========================================
    // FIND PRODUCTS BY VENDOR
    // ==========================================

    List<Product> findByVendorEmail(String vendorEmail);


    // ==========================================
    // SEARCH PRODUCTS BY NAME
    // Case-insensitive
    // ==========================================

    List<Product> findByNameContainingIgnoreCase(String name);


    // ==========================================
    // SEARCH PRODUCTS BY CATEGORY
    // Case-insensitive
    // ==========================================

    List<Product> findByCategoryContainingIgnoreCase(String category);
}
