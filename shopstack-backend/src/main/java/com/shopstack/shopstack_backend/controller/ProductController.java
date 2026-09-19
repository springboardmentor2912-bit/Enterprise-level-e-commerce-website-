
package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.entity.Product;
import com.shopstack.shopstack_backend.service.ProductService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }


    // =========================================================
    // Add Product
    // =========================================================

    @PostMapping("/add")
    public ResponseEntity<Product> addProduct(
            @RequestBody Product product) {

        return ResponseEntity.ok(
                productService.addProduct(product)
        );
    }


    // =========================================================
    // Get All Products
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {

        return ResponseEntity.ok(
                productService.getAllProducts()
        );
    }


    // =========================================================
    // Get Product By ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(
            @PathVariable Long id) {

        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    // =========================================================
    // Get Vendor Products
    // =========================================================

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<Product>> getVendorProducts(
            @PathVariable Long vendorId) {

        return ResponseEntity.ok(
                productService.getProductsByVendor(vendorId)
        );
    }


    // =========================================================
    // Get Available Products
    // =========================================================

    @GetMapping("/available")
    public ResponseEntity<List<Product>> getAvailableProducts() {

        return ResponseEntity.ok(
                productService.getAvailableProducts()
        );
    }


    // =========================================================
    // Update Product
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody Product product) {

        return ResponseEntity.ok(
                productService.updateProduct(id, product)
        );
    }


    // =========================================================
    // Update Price
    // =========================================================

    @PutMapping("/{id}/price")
    public Product updatePrice(
            @PathVariable Long id,
            @RequestBody Product updatedProduct) {

        return productService.updatePrice(
                id,
                updatedProduct.getPrice().doubleValue()
        );
    }


    // =========================================================
    // Update Discount
    // =========================================================

    @PutMapping("/{id}/discount")
    public ResponseEntity<Product> updateDiscount(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> data) {

        BigDecimal discountPercentage =
                data.get("discountPercentage");

        return ResponseEntity.ok(
                productService.updateDiscount(
                        id,
                        discountPercentage
                )
        );
    }


    // =========================================================
    // Update Stock
    // =========================================================

    @PutMapping("/{id}/stock")
    public Product updateStock(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> data) {

        return productService.updateStock(
                id,
                data.get("stockQuantity")
        );
    }


    // =========================================================
    // Delete Product
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable Long id) {

        productService.deleteProduct(id);

        return ResponseEntity.ok(
                "Product deleted successfully"
        );
    }


    // =========================================================
// ADMIN - GET PRODUCTS BY VENDOR
// =========================================================

@GetMapping("/admin/vendor/{vendorId}")
public ResponseEntity<List<Product>> getAdminVendorProducts(
        @PathVariable Long vendorId) {

    return ResponseEntity.ok(
            productService.getAllProductsByVendor(vendorId)
    );
}


// =========================================================
// ADMIN - APPROVE PRODUCT
// =========================================================

@PutMapping("/admin/{id}/approve")
public ResponseEntity<Product> approveProduct(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            productService.updateProductStatus(
                    id,
                    com.shopstack.shopstack_backend.entity.ProductStatus.APPROVED
            )
    );
}


// =========================================================
// ADMIN - REJECT PRODUCT
// =========================================================

@PutMapping("/admin/{id}/reject")
public ResponseEntity<Product> rejectProduct(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            productService.updateProductStatus(
                    id,
                    com.shopstack.shopstack_backend.entity.ProductStatus.REJECTED
            )
    );
}
}

