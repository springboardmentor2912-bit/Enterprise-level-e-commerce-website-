package com.shopstack.shopstack_backend.service.impl;

import com.shopstack.shopstack_backend.constant.ProductStatus;
import com.shopstack.shopstack_backend.dto.request.ProductRequest;
import com.shopstack.shopstack_backend.dto.response.InventoryReportResponse;
import com.shopstack.shopstack_backend.dto.response.ProductResponse;
import com.shopstack.shopstack_backend.entity.Category;
import com.shopstack.shopstack_backend.entity.InventoryHistory;
import com.shopstack.shopstack_backend.entity.Product;
import com.shopstack.shopstack_backend.entity.Vendor;
import com.shopstack.shopstack_backend.repository.CategoryRepository;
import com.shopstack.shopstack_backend.repository.InventoryHistoryRepository;
import com.shopstack.shopstack_backend.repository.ProductRepository;
import com.shopstack.shopstack_backend.repository.VendorRepository;
import com.shopstack.shopstack_backend.service.ProductService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final VendorRepository vendorRepository;
    private final InventoryHistoryRepository inventoryHistoryRepository;

    public ProductServiceImpl(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            VendorRepository vendorRepository,
            InventoryHistoryRepository inventoryHistoryRepository) {

        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.vendorRepository = vendorRepository;
        this.inventoryHistoryRepository = inventoryHistoryRepository;
    }

    // =========================
    // CREATE PRODUCT
    // =========================

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {

        Category category = categoryRepository
                .findById(request.getCategoryId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Category not found"
                        ));

        Vendor vendor = vendorRepository
                .findById(request.getVendorId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vendor not found"
                        ));

        if (request.getStockQuantity() == null ||
                request.getStockQuantity() < 0) {

            throw new RuntimeException(
                    "Stock quantity cannot be negative"
            );
        }

        Product product = new Product();

        product.setProductName(
                request.getProductName()
        );

        product.setBrand(
                request.getBrand()
        );

        product.setDescription(
                request.getDescription()
        );

        // =========================
        // PRICE
        // =========================

        product.setPrice(
                request.getPrice()
        );

        BigDecimal discountPercentage =
                request.getDiscountPercentage() == null
                        ? BigDecimal.ZERO
                        : request.getDiscountPercentage();

        product.setDiscountPercentage(
                discountPercentage
        );

        // =========================
        // CALCULATE FINAL PRICE
        // =========================

        BigDecimal discountAmount =
                request.getPrice()
                        .multiply(discountPercentage)
                        .divide(
                                BigDecimal.valueOf(100),
                                2,
                                RoundingMode.HALF_UP
                        );

        BigDecimal finalPrice =
                request.getPrice()
                        .subtract(discountAmount)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        product.setFinalPrice(
                finalPrice
        );

        // =========================
        // INITIAL STOCK
        // =========================

        Integer initialStock =
                request.getStockQuantity();

        product.setStockQuantity(
                initialStock
        );

        product.setCategory(
                category
        );

        product.setVendor(
                vendor
        );

        product.setActive(true);

        // Newly created products require admin approval
        product.setStatus(
                ProductStatus.PENDING
        );

        // Save product first
        Product savedProduct =
                productRepository.save(product);

        // =========================
        // CREATE INITIAL STOCK HISTORY
        // =========================

        InventoryHistory history =
                new InventoryHistory();

        history.setProductId(
                savedProduct.getId()
        );

        history.setProductName(
                savedProduct.getProductName()
        );

        history.setStockBefore(
                0
        );

        history.setQuantityChange(
                initialStock
        );

        history.setStockAfter(
                initialStock
        );

        history.setAction(
                "INITIAL_STOCK"
        );

        history.setReferenceId(
                savedProduct.getId()
        );

        inventoryHistoryRepository.save(
                history
        );

        return mapToResponse(
                savedProduct
        );
    }

    // =========================
    // GET PRODUCT BY ID
    // =========================

    @Override
    public ProductResponse getProductById(Long id) {

        Product product = productRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found"
                        ));

        /*
         * Customers should only see approved products.
         * Pending and rejected products are hidden.
         */
        if (!isAvailableForCustomer(product)) {
            throw new RuntimeException(
                    "Product is not available"
            );
        }

        return mapToResponse(product);
    }

    // =========================
    // GET ALL PRODUCTS
    // =========================

    @Override
    public List<ProductResponse> getAllProducts() {

        return productRepository.findAll()
                .stream()
                .filter(this::isAvailableForCustomer)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================
    // SEARCH PRODUCTS
    // =========================

    @Override
    public List<ProductResponse> searchProducts(
            String keyword) {

        return productRepository
                .findByProductNameContainingIgnoreCase(
                        keyword
                )
                .stream()
                .filter(this::isAvailableForCustomer)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================
    // PRODUCTS BY CATEGORY
    // =========================

    @Override
    public List<ProductResponse> getProductsByCategory(
            Long categoryId) {

        Category category = categoryRepository
                .findById(categoryId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Category not found"
                        ));

        return productRepository
                .findByCategory(category)
                .stream()
                .filter(this::isAvailableForCustomer)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================
    // PRODUCTS BY VENDOR
    // =========================

    @Override
    public List<ProductResponse> getProductsByVendor(
            Long vendorId) {

        Vendor vendor = vendorRepository
                .findById(vendorId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vendor not found"
                        ));

        return productRepository
                .findByVendor(vendor)
                .stream()
                .filter(this::isAvailableForCustomer)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================
    // FILTER PRODUCTS BY PRICE
    // =========================

    @Override
    public List<ProductResponse> filterProductsByPrice(
            BigDecimal minPrice,
            BigDecimal maxPrice) {

        return productRepository
                .findByPriceBetween(
                        minPrice,
                        maxPrice
                )
                .stream()
                .filter(this::isAvailableForCustomer)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================
    // APPROVE PRODUCT
    // =========================

    @Override
    public ProductResponse approveProduct(
            Long productId) {

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found"
                        ));

        product.setStatus(
                ProductStatus.APPROVED
        );

        Product updatedProduct =
                productRepository.save(product);

        return mapToResponse(
                updatedProduct
        );
    }

    // =========================
    // REJECT PRODUCT
    // =========================

    @Override
    public ProductResponse rejectProduct(
            Long productId) {

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found"
                        ));

        product.setStatus(
                ProductStatus.REJECTED
        );

        Product updatedProduct =
                productRepository.save(product);

        return mapToResponse(
                updatedProduct
        );
    }

    // =========================
    // UPDATE STOCK
    // =========================

    @Override
    @Transactional
    public ProductResponse updateStock(
            Long productId,
            Integer stockQuantity) {

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found"
                        ));

        if (stockQuantity == null ||
                stockQuantity < 0) {

            throw new RuntimeException(
                    "Stock quantity cannot be negative"
            );
        }

        // =========================
        // OLD STOCK
        // =========================

        Integer oldStock =
                product.getStockQuantity();

        if (oldStock == null) {
            oldStock = 0;
        }

        // =========================
        // UPDATE PRODUCT STOCK
        // =========================

        product.setStockQuantity(
                stockQuantity
        );

        Product updatedProduct =
                productRepository.save(product);

        // =========================
        // CALCULATE CHANGE
        // =========================

        int quantityChange =
                stockQuantity - oldStock;

        // =========================
        // CREATE STOCK HISTORY
        // =========================

        InventoryHistory history =
                new InventoryHistory();

        history.setProductId(
                updatedProduct.getId()
        );

        history.setProductName(
                updatedProduct.getProductName()
        );

        history.setStockBefore(
                oldStock
        );

        history.setQuantityChange(
                quantityChange
        );

        history.setStockAfter(
                stockQuantity
        );

        history.setAction(
                "STOCK_UPDATED"
        );

        history.setReferenceId(
                updatedProduct.getId()
        );

        inventoryHistoryRepository.save(
                history
        );

        return mapToResponse(
                updatedProduct
        );
    }

    // =========================
    // GET LOW STOCK PRODUCTS
    // =========================

    @Override
    public List<ProductResponse> getLowStockProducts(
            Integer threshold) {

        if (threshold == null ||
                threshold < 0) {

            throw new RuntimeException(
                    "Stock threshold cannot be negative"
            );
        }

        return productRepository
                .findByStockQuantityGreaterThanAndStockQuantityLessThanEqual(
                        0,
                        threshold
                )
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================
    // INVENTORY REPORT
    // =========================

    @Override
    public InventoryReportResponse getInventoryReport(
            Integer threshold) {

        if (threshold == null ||
                threshold < 0) {

            throw new RuntimeException(
                    "Stock threshold cannot be negative"
            );
        }

        List<Product> products =
                productRepository.findAll();

        long totalProducts =
                products.size();

        long totalStockUnits =
                products.stream()
                        .mapToLong(product -> {

                            Integer stock =
                                    product.getStockQuantity();

                            return stock == null
                                    ? 0
                                    : stock;
                        })
                        .sum();

        long lowStockProducts =
                products.stream()
                        .filter(product -> {

                            Integer stock =
                                    product.getStockQuantity();

                            return stock != null &&
                                    stock > 0 &&
                                    stock <= threshold;
                        })
                        .count();

        long outOfStockProducts =
                products.stream()
                        .filter(product -> {

                            Integer stock =
                                    product.getStockQuantity();

                            return stock == null ||
                                    stock == 0;
                        })
                        .count();

        return new InventoryReportResponse(
                totalProducts,
                totalStockUnits,
                lowStockProducts,
                outOfStockProducts
        );
    }

    // =========================
    // CUSTOMER PRODUCT VISIBILITY
    // =========================

    private boolean isAvailableForCustomer(
            Product product) {

        return product.getStatus() ==
                ProductStatus.APPROVED;
    }

    // =========================
    // MAP PRODUCT TO RESPONSE
    // =========================

    private ProductResponse mapToResponse(
            Product product) {

        ProductResponse response =
                new ProductResponse();

        response.setId(
                product.getId()
        );

        response.setProductName(
                product.getProductName()
        );

        response.setBrand(
                product.getBrand()
        );

        response.setDescription(
                product.getDescription()
        );

        // Original price
        response.setPrice(
                product.getPrice()
        );

        // Discount
        response.setDiscountPercentage(
                product.getDiscountPercentage()
        );

        // Final price
        response.setFinalPrice(
                product.getFinalPrice()
        );

        // Stock
        response.setStockQuantity(
                product.getStockQuantity()
        );

        // Category
        response.setCategoryName(
                product.getCategory().getName()
        );

        // Vendor
        response.setVendorName(
                product.getVendor().getBusinessName()
        );

        return response;
    }
}