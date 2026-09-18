package com.shopstack.service;

import com.shopstack.dto.InventoryHistoryDTO;
import com.shopstack.dto.ProductDTO;
import com.shopstack.dto.ProductRequestDTO;
import com.shopstack.entity.ApprovalStatus;
import com.shopstack.entity.Category;
import com.shopstack.entity.InventoryHistory;
import com.shopstack.entity.Product;
import com.shopstack.entity.Vendor;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.CategoryRepository;
import com.shopstack.repository.InventoryHistoryRepository;
import com.shopstack.repository.ProductRepository;
import com.shopstack.repository.VendorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final VendorRepository vendorRepository;
    private final InventoryHistoryRepository inventoryHistoryRepository;

    public ProductServiceImpl(ProductRepository productRepository,
                               CategoryRepository categoryRepository,
                               VendorRepository vendorRepository,
                               InventoryHistoryRepository inventoryHistoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.vendorRepository = vendorRepository;
        this.inventoryHistoryRepository = inventoryHistoryRepository;
    }

    @Override
    @Transactional
    public ProductDTO createProduct(String vendorEmail, ProductRequestDTO request) {
        Vendor vendor = vendorRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found for email: " + vendorEmail));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        Product product = new Product();
        product.setName(request.getName());
        product.setBrand(request.getBrand());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setDiscountPercentage(request.getDiscountPercentage() != null ? request.getDiscountPercentage() : 0.0);
        product.setStockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0);
        product.setCategory(category);
        product.setVendor(vendor);
        product.setImages(request.getImages() != null ? request.getImages() : new ArrayList<>());
        product.setApprovalStatus(ApprovalStatus.APPROVED);
        // finalPrice is computed in @PrePersist

        Product savedProduct = productRepository.save(product);

        // Record initial inventory history
        InventoryHistory history = new InventoryHistory(
                savedProduct,
                savedProduct.getStockQuantity(),
                savedProduct.getStockQuantity(),
                "INITIAL_STOCK"
        );
        inventoryHistoryRepository.save(history);

        return new ProductDTO(savedProduct);
    }

    @Override
    @Transactional
    public ProductDTO updateProduct(Long productId, String vendorEmail, ProductRequestDTO request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        if (!product.getVendor().getEmail().equalsIgnoreCase(vendorEmail)) {
            throw new RuntimeException("Unauthorized: Product does not belong to vendor");
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));
            product.setCategory(category);
        }

        product.setName(request.getName());
        product.setBrand(request.getBrand());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        if (request.getDiscountPercentage() != null) {
            product.setDiscountPercentage(request.getDiscountPercentage());
        }
        // finalPrice is recomputed in @PreUpdate
        if (request.getStockQuantity() != null && !request.getStockQuantity().equals(product.getStockQuantity())) {
            int oldStock = product.getStockQuantity();
            int diff = request.getStockQuantity() - oldStock;
            product.setStockQuantity(request.getStockQuantity());

            InventoryHistory history = new InventoryHistory(
                    product,
                    diff,
                    request.getStockQuantity(),
                    "VENDOR_MANUAL_UPDATE"
            );
            inventoryHistoryRepository.save(history);
        }
        if (request.getImages() != null) {
            product.setImages(request.getImages());
        }

        Product updatedProduct = productRepository.save(product);
        return new ProductDTO(updatedProduct);
    }

    @Override
    @Transactional
    public ProductDTO updatePrice(Long productId, String vendorEmail, BigDecimal newPrice) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        if (!product.getVendor().getEmail().equalsIgnoreCase(vendorEmail)) {
            throw new RuntimeException("Unauthorized to modify product price");
        }

        product.setPrice(newPrice);
        // finalPrice is recomputed in @PreUpdate
        return new ProductDTO(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductDTO applyDiscount(Long productId, String vendorEmail, Double discountPercentage) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        if (!product.getVendor().getEmail().equalsIgnoreCase(vendorEmail)) {
            throw new RuntimeException("Unauthorized to modify product discount");
        }

        product.setDiscountPercentage(discountPercentage != null ? discountPercentage : 0.0);
        // finalPrice is recomputed in @PreUpdate
        return new ProductDTO(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductDTO updateStock(Long productId, String vendorEmail, Integer newStock) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        if (!product.getVendor().getEmail().equalsIgnoreCase(vendorEmail)) {
            throw new RuntimeException("Unauthorized to modify product inventory stock");
        }

        int oldStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        int diff = newStock - oldStock;
        product.setStockQuantity(newStock);

        Product saved = productRepository.save(product);

        InventoryHistory history = new InventoryHistory(
                saved,
                diff,
                newStock,
                "VENDOR_STOCK_ADJUSTMENT"
        );
        inventoryHistoryRepository.save(history);

        return new ProductDTO(saved);
    }

    @Override
    @Transactional
    public void deleteProduct(Long productId, String vendorEmail) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        if (!product.getVendor().getEmail().equalsIgnoreCase(vendorEmail)) {
            throw new RuntimeException("Unauthorized to delete product");
        }

        productRepository.delete(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        return new ProductDTO(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> filterProducts(Long categoryId, String search, BigDecimal minPrice, BigDecimal maxPrice) {
        List<Product> products = productRepository.filterProducts(ApprovalStatus.APPROVED, categoryId, search, minPrice, maxPrice);
        return products.stream().map(ProductDTO::new).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByVendor(String vendorEmail) {
        Vendor vendor = vendorRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found for email: " + vendorEmail));

        return productRepository.findByVendorId(vendor.getId()).stream()
                .map(ProductDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getPendingProducts() {
        return productRepository.findByApprovalStatus(ApprovalStatus.PENDING).stream()
                .map(ProductDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductDTO updateApprovalStatus(Long productId, ApprovalStatus status) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        product.setApprovalStatus(status);
        return new ProductDTO(productRepository.save(product));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getFeaturedProducts() {
        Pageable pageable = PageRequest.of(0, 8, Sort.by(Sort.Direction.DESC, "rating", "reviewCount"));
        List<Product> list = productRepository.findByApprovalStatus(ApprovalStatus.APPROVED, pageable).getContent();
        return list.stream().map(ProductDTO::new).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getNewArrivals() {
        Pageable pageable = PageRequest.of(0, 8, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Product> list = productRepository.findByApprovalStatus(ApprovalStatus.APPROVED, pageable).getContent();
        return list.stream().map(ProductDTO::new).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getBestSellers() {
        Pageable pageable = PageRequest.of(0, 8, Sort.by(Sort.Direction.DESC, "reviewCount", "rating"));
        List<Product> list = productRepository.findByApprovalStatus(ApprovalStatus.APPROVED, pageable).getContent();
        return list.stream().map(ProductDTO::new).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> searchProducts(String query) {
        return filterProducts(null, query, null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByCategory(Long categoryId) {
        List<Product> list = productRepository.findByApprovalStatusAndCategoryId(ApprovalStatus.APPROVED, categoryId);
        return list.stream().map(ProductDTO::new).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDTO> filterProductsExtended(Long categoryId, String brand, String search, BigDecimal minPrice, BigDecimal maxPrice, Double minRating, String sort, int page, int size) {
        String cleanBrand = (brand != null && !brand.isBlank()) ? brand.trim() : null;
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;

        Sort sorting = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("price_asc".equalsIgnoreCase(sort)) {
            sorting = Sort.by(Sort.Direction.ASC, "price");
        } else if ("price_desc".equalsIgnoreCase(sort)) {
            sorting = Sort.by(Sort.Direction.DESC, "price");
        } else if ("rating_desc".equalsIgnoreCase(sort)) {
            sorting = Sort.by(Sort.Direction.DESC, "rating");
        } else if ("newest".equalsIgnoreCase(sort)) {
            sorting = Sort.by(Sort.Direction.DESC, "createdAt");
        }

        Pageable pageable = PageRequest.of(page, size, sorting);
        Page<Product> products = productRepository.filterProductsExtended(
                ApprovalStatus.APPROVED, categoryId, cleanBrand, cleanSearch, minPrice, maxPrice, minRating, pageable
        );

        return products.map(ProductDTO::new);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryHistoryDTO> getInventoryHistory(Long productId, String vendorEmail) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        if (!product.getVendor().getEmail().equalsIgnoreCase(vendorEmail)) {
            throw new RuntimeException("Unauthorized: Product does not belong to vendor");
        }

        return inventoryHistoryRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(InventoryHistoryDTO::new)
                .collect(Collectors.toList());
    }
}
