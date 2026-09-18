package com.shopstack.repository;

import com.shopstack.entity.Product;
import com.shopstack.enums.ProductApprovalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByApprovalStatusAndActiveTrue(ProductApprovalStatus status, Pageable pageable);

    Page<Product> findByVendorId(Long vendorId, Pageable pageable);

    Page<Product> findByCategoryIdAndApprovalStatusAndActiveTrue(Long categoryId, ProductApprovalStatus status, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.approvalStatus = 'APPROVED' AND p.active = true AND " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchApprovedProducts(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.approvalStatus = 'APPROVED' AND p.active = true " +
            "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
            "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
            "AND (:brand IS NULL OR LOWER(p.brand) = LOWER(:brand))")
    Page<Product> filterProducts(@Param("categoryId") Long categoryId,
                                  @Param("minPrice") java.math.BigDecimal minPrice,
                                  @Param("maxPrice") java.math.BigDecimal maxPrice,
                                  @Param("brand") String brand,
                                  Pageable pageable);
}
