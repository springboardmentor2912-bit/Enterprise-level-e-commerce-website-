package com.infosys.springboard.authentication.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.infosys.springboard.authentication.dto.ProductRequest;
import com.infosys.springboard.authentication.dto.ProductResponse;
import com.infosys.springboard.authentication.dto.StockResponse;
import com.infosys.springboard.authentication.entity.Inventory;
import com.infosys.springboard.authentication.entity.Product;
import com.infosys.springboard.authentication.repository.InventoryRepository;
import com.infosys.springboard.authentication.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    public ProductService(
            ProductRepository productRepository,
            InventoryRepository inventoryRepository) {

        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
    }

    // =========================================================
    // CREATE PRODUCT
    // =========================================================

    public ProductResponse createProduct(
            ProductRequest request,
            String vendorEmail) {

        BigDecimal originalPrice =
                request.getOriginalPrice();

        BigDecimal discountPercentage =
                request.getDiscountPercentage();

        BigDecimal discountAmount =
                originalPrice
                        .multiply(discountPercentage)
                        .divide(
                                BigDecimal.valueOf(100),
                                2,
                                RoundingMode.HALF_UP
                        );

        BigDecimal finalPrice =
                originalPrice
                        .subtract(discountAmount)
                        .setScale(2, RoundingMode.HALF_UP);

        Product product = Product.builder()
                .name(request.getName())
                .category(request.getCategory())
                .brand(request.getBrand())
                .description(request.getDescription())
                .originalPrice(originalPrice)
                .discountPercentage(discountPercentage)
                .price(finalPrice)
                .quantity(
                        request.getQuantity() == null
                                ? 0
                                : request.getQuantity()
                )
                .imageUrl(request.getImageUrl())
                .vendorEmail(vendorEmail)
                .build();

        Product savedProduct =
                productRepository.save(product);

        // Create inventory automatically
        Inventory inventory = new Inventory();

        inventory.setProduct(savedProduct);

        int quantity =
                savedProduct.getQuantity() == null
                        ? 0
                        : savedProduct.getQuantity();

        inventory.setQuantity(quantity);
        inventory.setReservedQuantity(0);
        inventory.setAvailableQuantity(quantity);
        inventory.setLastUpdated(LocalDateTime.now());

        inventoryRepository.save(inventory);

        return convertToResponse(savedProduct);
    }

    // =========================================================
    // GET ALL PRODUCTS
    // =========================================================

    public List<ProductResponse> getAllProducts() {

        return productRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =========================================================
    // GET PRODUCTS OF A PARTICULAR VENDOR
    // =========================================================

    public List<ProductResponse> getVendorProducts(
            String vendorEmail) {

        return productRepository
                .findByVendorEmail(vendorEmail)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =========================================================
    // GET PRODUCT BY ID
    // =========================================================

    public ProductResponse getProductById(Long id) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"
                                )
                        );

        return convertToResponse(product);
    }

    // =========================================================
    // UPDATE PRODUCT
    // =========================================================

    public ProductResponse updateProduct(
            Long id,
            ProductRequest request,
            String vendorEmail) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"
                                )
                        );

        if (product.getVendorEmail() == null ||
                !product.getVendorEmail()
                        .equalsIgnoreCase(vendorEmail)) {

            throw new RuntimeException(
                    "You are not allowed to update this product"
            );
        }

        BigDecimal originalPrice =
                request.getOriginalPrice();

        BigDecimal discountPercentage =
                request.getDiscountPercentage();

        BigDecimal discountAmount =
                originalPrice
                        .multiply(discountPercentage)
                        .divide(
                                BigDecimal.valueOf(100),
                                2,
                                RoundingMode.HALF_UP
                        );

        BigDecimal finalPrice =
                originalPrice
                        .subtract(discountAmount)
                        .setScale(2, RoundingMode.HALF_UP);

        product.setName(request.getName());
        product.setCategory(request.getCategory());
        product.setBrand(request.getBrand());
        product.setDescription(request.getDescription());
        product.setOriginalPrice(originalPrice);
        product.setDiscountPercentage(discountPercentage);
        product.setPrice(finalPrice);
        product.setQuantity(
                request.getQuantity() == null
                        ? 0
                        : request.getQuantity()
        );
        product.setImageUrl(request.getImageUrl());

        Product updatedProduct =
                productRepository.save(product);

        // Update inventory
        Inventory inventory =
                inventoryRepository
                        .findByProductId(id)
                        .orElseGet(() -> {

                            Inventory newInventory =
                                    new Inventory();

                            newInventory.setProduct(
                                    updatedProduct
                            );

                            newInventory.setReservedQuantity(0);

                            newInventory.setLastUpdated(
                                    LocalDateTime.now()
                            );

                            return newInventory;
                        });

        int quantity =
                updatedProduct.getQuantity() == null
                        ? 0
                        : updatedProduct.getQuantity();

        inventory.setQuantity(quantity);

        int reserved =
                inventory.getReservedQuantity() == null
                        ? 0
                        : inventory.getReservedQuantity();

        inventory.setAvailableQuantity(
                Math.max(
                        0,
                        quantity - reserved
                )
        );

        inventory.setLastUpdated(
                LocalDateTime.now()
        );

        inventoryRepository.save(inventory);

        return convertToResponse(updatedProduct);
    }

    // =========================================================
    // DELETE PRODUCT BY VENDOR
    // =========================================================

    public void deleteProduct(
            Long id,
            String vendorEmail) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"
                                )
                        );

        if (product.getVendorEmail() == null ||
                !product.getVendorEmail()
                        .equalsIgnoreCase(vendorEmail)) {

            throw new RuntimeException(
                    "You are not allowed to delete this product"
            );
        }

        inventoryRepository
                .findByProductId(id)
                .ifPresent(inventory ->
                        inventoryRepository.delete(inventory)
                );

        productRepository.delete(product);
    }

    // =========================================================
    // DELETE PRODUCT BY ADMIN
    // =========================================================

    public void deleteProductByAdmin(Long id) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"
                                )
                        );

        inventoryRepository
                .findByProductId(id)
                .ifPresent(inventory ->
                        inventoryRepository.delete(inventory)
                );

        productRepository.delete(product);
    }

    // =========================================================
    // SEARCH PRODUCTS BY NAME
    // =========================================================

    public List<ProductResponse> searchProducts(
            String name) {

        return productRepository
                .findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =========================================================
    // SEARCH PRODUCTS BY CATEGORY
    // =========================================================

    public List<ProductResponse> searchByCategory(
            String category) {

        return productRepository
                .findByCategoryContainingIgnoreCase(category)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =========================================================
    // GET CURRENT STOCK
    // =========================================================

    public StockResponse getCurrentStock(
            Long id,
            String vendorEmail) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"
                                )
                        );

        if (product.getVendorEmail() == null ||
                !product.getVendorEmail()
                        .equalsIgnoreCase(vendorEmail)) {

            throw new RuntimeException(
                    "You are not allowed to view this product stock"
            );
        }

        String status;

        if (product.getQuantity() == null ||
                product.getQuantity() == 0) {

            status = "OUT OF STOCK";

        } else {

            status = "IN STOCK";
        }

        return new StockResponse(
                product.getId(),
                product.getName(),
                product.getQuantity(),
                status
        );
    }

    // =========================================================
    // CONVERT ENTITY → RESPONSE DTO
    // =========================================================

    private ProductResponse convertToResponse(
            Product product) {

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getCategory(),
                product.getBrand(),
                product.getDescription(),
                product.getOriginalPrice(),
                product.getDiscountPercentage(),
                product.getPrice(),
                product.getQuantity(),
                product.getImageUrl(),
                product.getVendorEmail()
        );
    }
}