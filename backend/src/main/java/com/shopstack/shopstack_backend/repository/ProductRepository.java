package com.shopstack.shopstack_backend.repository;

import com.shopstack.shopstack_backend.entity.Category;
import com.shopstack.shopstack_backend.entity.Product;
import com.shopstack.shopstack_backend.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategory(Category category);

    List<Product> findByVendor(Vendor vendor);

    List<Product> findByProductNameContainingIgnoreCase(
            String keyword
    );

    List<Product> findByPriceBetween(
            BigDecimal minPrice,
            BigDecimal maxPrice
    );

    // =========================
    // LOW STOCK PRODUCTS
    // Excludes out-of-stock products
    // =========================

    List<Product> findByStockQuantityGreaterThanAndStockQuantityLessThanEqual(
            Integer minimumStock,
            Integer threshold
    );
}