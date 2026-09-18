package com.infosys.auth.repository;

import com.infosys.auth.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByVendorId(Long vendorId);

    List<Product> findByCategoryIgnoreCase(String category);

    @Query("SELECT p FROM Product p WHERE " +
           "(CAST(:query AS string) IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%'))) AND " +
           "(CAST(:category AS string) IS NULL OR LOWER(p.category) = LOWER(CAST(:category AS string))) AND " +
           "(:approved IS NULL OR p.approved = :approved)")
    List<Product> searchProducts(@Param("query") String query, @Param("category") String category, @Param("approved") Boolean approved);
}
