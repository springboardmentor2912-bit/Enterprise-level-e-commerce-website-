package com.shopstack.service;

import com.shopstack.dto.CreateProductRequest;
import com.shopstack.model.*;
import com.shopstack.repository.CategoryRepository;
import com.shopstack.repository.ProductRepository;
import com.shopstack.repository.UserRepository;
import com.shopstack.repository.VendorProfileRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ProductServiceTest {

    @Autowired
    private ProductService productService;

    @Autowired
    private VendorService vendorService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private VendorProfileRepository vendorProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("2.1 Product Creation - Successful creation by vendor")
    void testCreateProduct_Success() {
        VendorProfile vendor = vendorProfileRepository.findAll().get(0);
        Category category = categoryRepository.findAll().get(0);

        CreateProductRequest request = new CreateProductRequest(
                "Gaming Headset 7.1 Surround",
                "Immersive spatial audio headset with RGB lighting",
                "Nexus Tech",
                149.99,
                119.99,
                50,
                "https://images.unsplash.com/photo-1546435770-a3e426bf472b",
                category.getId()
        );

        Product created = productService.createProduct(vendor.getId(), request);

        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals("Gaming Headset 7.1 Surround", created.getTitle());
        assertEquals(50, created.getStockQuantity());
        assertEquals(ProductStatus.ACTIVE, created.getStatus());
        assertNotNull(created.getSku());
        assertTrue(created.getSku().startsWith("SKU-"));
    }

    @Test
    @DisplayName("2.2 Product Update - Updates metadata and price")
    void testUpdateProduct_Success() {
        Product product = productRepository.findAll().get(0);
        Long id = product.getId();

        CreateProductRequest updateReq = new CreateProductRequest();
        updateReq.setTitle("Updated Product Title Special");
        updateReq.setPrice(199.00);
        updateReq.setDiscountPrice(169.00);
        updateReq.setStockQuantity(25);

        Product updated = productService.updateProduct(id, updateReq);

        assertEquals("Updated Product Title Special", updated.getTitle());
        assertEquals(199.00, updated.getPrice());
        assertEquals(169.00, updated.getDiscountPrice());
        assertEquals(25, updated.getStockQuantity());
    }

    @Test
    @DisplayName("2.3 Product Stock Updates - Auto transitions to OUT_OF_STOCK and ACTIVE")
    void testUpdateStock_StatusTransition() {
        Product product = productRepository.findAll().get(0);
        Long id = product.getId();

        // 1. Set stock to 0 -> should become OUT_OF_STOCK
        Product outOfStockProduct = productService.updateStock(id, 0);
        assertEquals(0, outOfStockProduct.getStockQuantity());
        assertEquals(ProductStatus.OUT_OF_STOCK, outOfStockProduct.getStatus());

        // 2. Replenish stock to 20 -> should become ACTIVE again
        Product replenishedProduct = productService.updateStock(id, 20);
        assertEquals(20, replenishedProduct.getStockQuantity());
        assertEquals(ProductStatus.ACTIVE, replenishedProduct.getStatus());
    }

    @Test
    @DisplayName("2.4 Product Search - Finds products matching title/description/brand")
    void testSearchProducts() {
        List<Product> results = productService.searchProducts("Headphones");
        assertNotNull(results);
        assertFalse(results.isEmpty());
        assertTrue(results.stream().anyMatch(p -> p.getTitle().toLowerCase().contains("headphones") || p.getDescription().toLowerCase().contains("headphones")));
    }

    @Test
    @DisplayName("2.5 Product Category Filtering")
    void testGetProductsByCategory() {
        Category category = categoryRepository.findAll().get(0);
        List<Product> products = productService.getProductsByCategory(category.getId());

        assertNotNull(products);
        assertFalse(products.isEmpty());
        assertTrue(products.stream().allMatch(p -> p.getCategory().getId().equals(category.getId())));
    }

    @Test
    @DisplayName("2.6 Product Reviews - Rating calculation")
    void testAddReview_CalculatesAverageRating() {
        Product product = productRepository.findAll().get(0);
        User user = userRepository.findAll().stream().filter(u -> u.getRole() == Role.CUSTOMER).findFirst().get();

        Product reviewed = productService.addReview(product.getId(), user, 5, "Outstanding build quality and acoustics!");
        assertNotNull(reviewed);
        assertTrue(reviewed.getReviewCount() > 0);
        assertTrue(reviewed.getRating() >= 1.0 && reviewed.getRating() <= 5.0);
    }

    @Test
    @DisplayName("2.7 Vendor Governance - Status update by Admin")
    void testVendorStatusUpdate() {
        VendorProfile vendor = vendorProfileRepository.findAll().get(0);
        VendorProfile rejected = vendorService.updateVendorStatus(vendor.getId(), VendorStatus.REJECTED);
        assertEquals(VendorStatus.REJECTED, rejected.getStatus());

        VendorProfile approved = vendorService.updateVendorStatus(vendor.getId(), VendorStatus.APPROVED);
        assertEquals(VendorStatus.APPROVED, approved.getStatus());
        assertEquals(Role.VENDOR, approved.getUser().getRole());
    }
}
