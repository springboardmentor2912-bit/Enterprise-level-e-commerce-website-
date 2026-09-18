package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.dto.request.ProductRequest;
import com.shopstack.shopstack_backend.dto.response.InventoryReportResponse;
import com.shopstack.shopstack_backend.dto.response.ProductResponse;

import java.math.BigDecimal;
import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request);

    ProductResponse getProductById(Long id);

    List<ProductResponse> getAllProducts();

    List<ProductResponse> searchProducts(String keyword);

    List<ProductResponse> getProductsByCategory(Long categoryId);

    List<ProductResponse> getProductsByVendor(Long vendorId);

    List<ProductResponse> filterProductsByPrice(
            BigDecimal minPrice,
            BigDecimal maxPrice
    );

    ProductResponse approveProduct(Long productId);

    ProductResponse rejectProduct(Long productId);

    ProductResponse updateStock(
            Long productId,
            Integer stockQuantity
    );

    // =========================
    // LOW STOCK PRODUCTS
    // =========================

    List<ProductResponse> getLowStockProducts(
            Integer threshold
    );

    // =========================
    // INVENTORY REPORT
    // =========================

    InventoryReportResponse getInventoryReport(
            Integer threshold
    );
}