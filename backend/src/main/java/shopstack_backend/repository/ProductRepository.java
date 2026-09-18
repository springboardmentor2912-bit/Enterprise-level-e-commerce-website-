package shopstack_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import shopstack_backend.entity.Product;
import shopstack_backend.entity.User;
import shopstack_backend.entity.Vendor;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Get all products of a specific vendor
    List<Product> findByVendor(Vendor vendor);

    // Search products by category
    List<Product> findByCategoryId(Long categoryId);

    // Search products by name
    List<Product> findByNameContainingIgnoreCase(String name);
    Optional<Product> findByIdAndVendor(Long id, User vendor);
   
}