package com.shopstack.repository;

import com.shopstack.model.Product;
import com.shopstack.model.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStatusIn(List<ProductStatus> statuses);
    List<Product> findByVendorProfileId(Long vendorProfileId);
    List<Product> findByCategoryIdAndStatusIn(Long categoryId, List<ProductStatus> statuses);

    @Query("SELECT p FROM Product p WHERE p.status IN :statuses AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Product> searchProductsInStatuses(@Param("query") String query, @Param("statuses") List<ProductStatus> statuses);

    List<Product> findByFeaturedTrueAndStatusIn(List<ProductStatus> statuses);
}
