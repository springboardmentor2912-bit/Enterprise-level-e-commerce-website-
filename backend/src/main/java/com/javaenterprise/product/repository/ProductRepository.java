package com.javaenterprise.product.repository;

import com.javaenterprise.product.entity.Category;
import com.javaenterprise.product.entity.Product;
import com.javaenterprise.product.entity.ProductStatus;
import com.javaenterprise.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import com.javaenterprise.product.entity.ProductStatus;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByActiveTrue();

    List<Product> findByCategory(Category category);

    List<Product> findByVendor(User vendor);

    List<Product> findByNameContainingIgnoreCase(String keyword);

    List<Product> findByPriceBetween(BigDecimal min, BigDecimal max);
    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String keyword);

    List<Product> findByCategory_NameIgnoreCaseAndActiveTrue(String category);

    List<Product> findByPriceBetweenAndActiveTrue(BigDecimal min, BigDecimal max);


    Optional<Product> findByIdAndVendor(Long id, User vendor);
    long countByVendor(User vendor);

    long countByVendorAndActiveTrue(User vendor);

    long countByVendorAndStock(User vendor, Integer stock);




    List<Product> findByVendorAndStatus(User vendor, ProductStatus status);

    long countByVendorAndStatus(User vendor, ProductStatus status);

    List<Product> findByActiveTrueAndStatus(ProductStatus status);

    List<Product> findByNameContainingIgnoreCaseAndActiveTrueAndStatus(
            String keyword,
            ProductStatus status
    );

    List<Product> findByCategory_NameIgnoreCaseAndActiveTrueAndStatus(
            String category,
            ProductStatus status
    );

    List<Product> findByPriceBetweenAndActiveTrueAndStatus(
            BigDecimal min,
            BigDecimal max,
            ProductStatus status
    );
    List<Product> findByStatus(ProductStatus status);

    long countByStatus(ProductStatus status);

    List<Product> findAllByOrderByCreatedAtDesc();

    long count();



}