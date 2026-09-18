package com.shopstack.controller;

import com.shopstack.dto.*;
import com.shopstack.service.AdminDashboardService;
import com.shopstack.service.OrderService;
import com.shopstack.service.ProductService;
import com.shopstack.service.VendorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vendor")
@CrossOrigin(origins = "*")
public class VendorController {

    private final VendorService vendorService;
    private final ProductService productService;
    private final OrderService orderService;
    private final AdminDashboardService adminDashboardService;

    public VendorController(VendorService vendorService,
                            ProductService productService,
                            OrderService orderService,
                            AdminDashboardService adminDashboardService) {
        this.vendorService = vendorService;
        this.productService = productService;
        this.orderService = orderService;
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/profile")
    public ResponseEntity<VendorDTO> getVendorProfile(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(vendorService.getVendorByEmail(email));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<VendorAnalyticsDTO> getVendorAnalytics(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(vendorService.getVendorAnalytics(email));
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> getVendorProducts(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(productService.getProductsByVendor(email));
    }

    @PostMapping("/products")
    public ResponseEntity<ProductDTO> createVendorProduct(
            Authentication authentication,
            @Valid @RequestBody ProductRequestDTO request) {
        String email = authentication.getName();
        ProductDTO created = productService.createProduct(email, request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductDTO> updateVendorProduct(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody ProductRequestDTO request) {
        String email = authentication.getName();
        return ResponseEntity.ok(productService.updateProduct(id, email, request));
    }

    @PatchMapping("/products/{id}/price")
    public ResponseEntity<ProductDTO> updateProductPrice(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        String email = authentication.getName();
        BigDecimal price = new BigDecimal(body.get("price").toString());
        return ResponseEntity.ok(productService.updatePrice(id, email, price));
    }

    @PatchMapping("/products/{id}/stock")
    public ResponseEntity<ProductDTO> updateProductStock(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        String email = authentication.getName();
        Integer stock = Integer.parseInt(body.get("stockQuantity").toString());
        return ResponseEntity.ok(productService.updateStock(id, email, stock));
    }

    @PatchMapping("/products/{id}/discount")
    public ResponseEntity<ProductDTO> updateProductDiscount(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        String email = authentication.getName();
        Double discount = Double.parseDouble(body.get("discountPercentage").toString());
        return ResponseEntity.ok(productService.applyDiscount(id, email, discount));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteVendorProduct(Authentication authentication, @PathVariable Long id) {
        String email = authentication.getName();
        productService.deleteProduct(id, email);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderItemDTO>> getVendorSalesOrders(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(orderService.getVendorSalesOrders(email));
    }

    @GetMapping("/earnings")
    public ResponseEntity<VendorEarningsDTO> getVendorEarnings(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(adminDashboardService.getVendorEarnings(email));
    }
}
