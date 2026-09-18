package com.shopstack.repository;

import com.shopstack.entity.ApprovalStatus;
import com.shopstack.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    List<Product> findByVendorId(Long vendorId);

    List<Product> findByApprovalStatus(ApprovalStatus approvalStatus);

    Page<Product> findByApprovalStatus(ApprovalStatus approvalStatus, Pageable pageable);

    List<Product> findByApprovalStatusAndCategoryId(ApprovalStatus approvalStatus, Long categoryId);

    @Query("SELECT p FROM Product p WHERE (:status IS NULL OR p.approvalStatus = :status OR p.approvalStatus IS NULL) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:search IS NULL OR LOWER(p.name) LIKE CONCAT('%', LOWER(CAST(:search AS string)), '%') OR LOWER(p.brand) LIKE CONCAT('%', LOWER(CAST(:search AS string)), '%') OR LOWER(p.category.name) LIKE CONCAT('%', LOWER(CAST(:search AS string)), '%')) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice)")
    List<Product> filterProducts(
            @Param("status") ApprovalStatus status,
            @Param("categoryId") Long categoryId,
            @Param("search") String search,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice
    );

    @Query("SELECT p FROM Product p WHERE (:status IS NULL OR p.approvalStatus = :status OR p.approvalStatus IS NULL) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:brand IS NULL OR LOWER(p.brand) = LOWER(CAST(:brand AS string))) " +
           "AND (:search IS NULL OR LOWER(p.name) LIKE CONCAT('%', LOWER(CAST(:search AS string)), '%') OR LOWER(p.brand) LIKE CONCAT('%', LOWER(CAST(:search AS string)), '%') OR LOWER(p.category.name) LIKE CONCAT('%', LOWER(CAST(:search AS string)), '%')) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
           "AND (:minRating IS NULL OR p.rating >= :minRating)")
    Page<Product> filterProductsExtended(
            @Param("status") ApprovalStatus status,
            @Param("categoryId") Long categoryId,
            @Param("brand") String brand,
            @Param("search") String search,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minRating") Double minRating,
            Pageable pageable
    );

    long countByVendorId(Long vendorId);

    long countByStockQuantityEquals(Integer stockQuantity);

    long countByStockQuantityLessThanEqual(Integer stockQuantity);

    @Query("SELECT p.category.name, COUNT(p) FROM Product p GROUP BY p.category.name")
    List<Object[]> findCategoryProductCounts();
}
