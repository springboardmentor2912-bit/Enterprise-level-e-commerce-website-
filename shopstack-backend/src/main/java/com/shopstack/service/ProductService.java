package com.shopstack.service;

import com.shopstack.dto.product.ProductRequest;
import com.shopstack.dto.product.ProductResponse;
import com.shopstack.dto.vendor.PriceUpdateRequest;
import com.shopstack.entity.Category;
import com.shopstack.entity.Inventory;
import com.shopstack.entity.Product;
import com.shopstack.entity.Vendor;
import com.shopstack.enums.ProductApprovalStatus;
import com.shopstack.enums.VendorApprovalStatus;
import com.shopstack.exception.BadRequestException;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.InventoryRepository;
import com.shopstack.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final CategoryService categoryService;
    private final InventoryService inventoryService;

    @Transactional
    public Product createProduct(Vendor vendor, ProductRequest request) {
        if (vendor.getApprovalStatus() != VendorApprovalStatus.APPROVED) {
            throw new BadRequestException("Your vendor account must be approved before listing products");
        }

        Category category = categoryService.getById(request.getCategoryId());

        Product product = Product.builder()
                .vendor(vendor)
                .category(category)
                .name(request.getName())
                .brand(request.getBrand())
                .description(request.getDescription())
                .price(request.getPrice())
                .discountPrice(request.getDiscountPrice())
                .images(request.getImages() != null ? request.getImages() : List.of())
                .approvalStatus(ProductApprovalStatus.PENDING)
                .active(true)
                .build();

        product = productRepository.save(product);
        inventoryService.createForProduct(product, request.getInitialStock(), request.getLowStockThreshold(), request.getWarehouseLocation());

        return product;
    }

    public Product getById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    public Page<Product> getApprovedProducts(Pageable pageable) {
        return productRepository.findByApprovalStatusAndActiveTrue(ProductApprovalStatus.APPROVED, pageable);
    }

    public Page<Product> searchProducts(String keyword, Pageable pageable) {
        return productRepository.searchApprovedProducts(keyword, pageable);
    }

    public Page<Product> filterProducts(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, String brand, Pageable pageable) {
        return productRepository.filterProducts(categoryId, minPrice, maxPrice, brand, pageable);
    }

    public Page<Product> getVendorProducts(Long vendorId, Pageable pageable) {
        return productRepository.findByVendorId(vendorId, pageable);
    }

    public Page<Product> getPendingProducts(Pageable pageable) {
        return productRepository.findByApprovalStatusAndActiveTrue(ProductApprovalStatus.PENDING, pageable);
    }

    @Transactional
    public Product approveProduct(Long productId) {
        Product product = getById(productId);
        product.setApprovalStatus(ProductApprovalStatus.APPROVED);
        return productRepository.save(product);
    }

    @Transactional
    public Product rejectProduct(Long productId) {
        Product product = getById(productId);
        product.setApprovalStatus(ProductApprovalStatus.REJECTED);
        return productRepository.save(product);
    }

    @Transactional
    public Product updatePrice(Long vendorId, Long productId, PriceUpdateRequest request) {
        Product product = getOwnedProduct(vendorId, productId);
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        product.setDiscountPrice(request.getDiscountPrice());
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long vendorId, Long productId, ProductRequest request) {
        Product product = getOwnedProduct(vendorId, productId);
        product.setName(request.getName());
        product.setBrand(request.getBrand());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setDiscountPrice(request.getDiscountPrice());
        if (request.getImages() != null) {
            product.setImages(request.getImages());
        }
        if (request.getCategoryId() != null) {
            product.setCategory(categoryService.getById(request.getCategoryId()));
        }
        // Editing core details sends it back for re-approval
        product.setApprovalStatus(ProductApprovalStatus.PENDING);
        return productRepository.save(product);
    }

    @Transactional
    public void deactivateProduct(Long vendorId, Long productId) {
        Product product = getOwnedProduct(vendorId, productId);
        product.setActive(false);
        productRepository.save(product);
    }

    public Product getOwnedProduct(Long vendorId, Long productId) {
        Product product = getById(productId);
        if (!product.getVendor().getId().equals(vendorId)) {
            throw new ResourceNotFoundException("Product not found for this vendor");
        }
        return product;
    }

    public ProductResponse toResponse(Product p) {
        Integer availableStock = inventoryRepository.findByProductId(p.getId())
                .map(Inventory::getAvailableQuantity)
                .orElse(0);

        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .brand(p.getBrand())
                .description(p.getDescription())
                .price(p.getPrice())
                .discountPrice(p.getDiscountPrice())
                .images(p.getImages())
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .vendorName(p.getVendor().getBusinessName())
                .vendorId(p.getVendor().getId())
                .approvalStatus(p.getApprovalStatus().name())
                .active(p.isActive())
                .averageRating(p.getAverageRating())
                .reviewCount(p.getReviewCount())
                .availableStock(availableStock)
                .createdAt(p.getCreatedAt())
                .build();
    }
}
