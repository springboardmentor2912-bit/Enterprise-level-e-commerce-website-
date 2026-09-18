package com.shopstack.service;

import com.shopstack.dto.InventoryHistoryDTO;
import com.shopstack.dto.ProductDTO;
import com.shopstack.dto.ProductRequestDTO;
import com.shopstack.entity.ApprovalStatus;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;

public interface ProductService {
    ProductDTO createProduct(String vendorEmail, ProductRequestDTO request);
    ProductDTO updateProduct(Long productId, String vendorEmail, ProductRequestDTO request);
    ProductDTO updatePrice(Long productId, String vendorEmail, BigDecimal newPrice);
    ProductDTO updateStock(Long productId, String vendorEmail, Integer newStock);
    ProductDTO applyDiscount(Long productId, String vendorEmail, Double discountPercentage);
    void deleteProduct(Long productId, String vendorEmail);
    ProductDTO getProductById(Long id);
    List<ProductDTO> filterProducts(Long categoryId, String search, BigDecimal minPrice, BigDecimal maxPrice);
    List<ProductDTO> getProductsByVendor(String vendorEmail);
    List<ProductDTO> getPendingProducts();
    ProductDTO updateApprovalStatus(Long productId, ApprovalStatus status);

    List<ProductDTO> getFeaturedProducts();
    List<ProductDTO> getNewArrivals();
    List<ProductDTO> getBestSellers();
    List<ProductDTO> searchProducts(String query);
    List<ProductDTO> getProductsByCategory(Long categoryId);
    Page<ProductDTO> filterProductsExtended(Long categoryId, String brand, String search, BigDecimal minPrice, BigDecimal maxPrice, Double minRating, String sort, int page, int size);
    List<InventoryHistoryDTO> getInventoryHistory(Long productId, String vendorEmail);
}
