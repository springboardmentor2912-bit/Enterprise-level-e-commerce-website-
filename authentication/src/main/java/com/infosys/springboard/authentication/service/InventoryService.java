package com.infosys.springboard.authentication.service;

import com.infosys.springboard.authentication.entity.Inventory;
import com.infosys.springboard.authentication.entity.Product;
import com.infosys.springboard.authentication.repository.InventoryRepository;
import com.infosys.springboard.authentication.repository.ProductRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;

    public InventoryService(
            InventoryRepository inventoryRepository,
            ProductRepository productRepository) {

        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
    }

    // =========================================================
    // GET ALL INVENTORY BELONGING TO LOGGED-IN VENDOR
    // =========================================================

    public List<Inventory> getVendorInventory() {

        String vendorEmail = getLoggedInEmail();

        return inventoryRepository.findAll()
                .stream()
                .filter(inventory ->
                        inventory.getProduct() != null &&
                        vendorEmail.equalsIgnoreCase(
                                inventory.getProduct().getVendorEmail()
                        ))
                .toList();
    }

    // =========================================================
    // GET INVENTORY FOR ONE PRODUCT
    // =========================================================

    public Inventory getInventoryByProductId(Long productId) {

        String vendorEmail = getLoggedInEmail();

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        checkVendorOwnership(product, vendorEmail);

        return inventoryRepository.findByProductId(productId)
                .orElseGet(() -> createInventory(product));
    }

    // =========================================================
    // UPDATE STOCK
    // =========================================================

    public Inventory updateStock(
            Long productId,
            Integer quantity) {

        if (quantity == null || quantity < 0) {
            throw new RuntimeException(
                    "Quantity cannot be negative");
        }

        String vendorEmail = getLoggedInEmail();

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        checkVendorOwnership(product, vendorEmail);

        Inventory inventory = inventoryRepository
                .findByProductId(productId)
                .orElseGet(() -> createInventory(product));

        inventory.setQuantity(quantity);
        inventory.setLastUpdated(LocalDateTime.now());

        // Keep Product quantity synchronized
        product.setQuantity(quantity);
        productRepository.save(product);

        return inventoryRepository.save(inventory);
    }

    // =========================================================
    // INCREASE STOCK
    // =========================================================

    public Inventory increaseStock(
            Long productId,
            Integer amount) {

        if (amount == null || amount <= 0) {
            throw new RuntimeException(
                    "Increase amount must be greater than zero");
        }

        Inventory inventory =
                getInventoryByProductId(productId);

        int currentQuantity =
                inventory.getQuantity() == null
                        ? 0
                        : inventory.getQuantity();

        int newQuantity =
                currentQuantity + amount;

        return updateStock(productId, newQuantity);
    }

    // =========================================================
    // DECREASE STOCK
    // =========================================================

    public Inventory decreaseStock(
            Long productId,
            Integer amount) {

        if (amount == null || amount <= 0) {
            throw new RuntimeException(
                    "Decrease amount must be greater than zero");
        }

        Inventory inventory =
                getInventoryByProductId(productId);

        int availableQuantity =
                inventory.getAvailableQuantity() == null
                        ? 0
                        : inventory.getAvailableQuantity();

        if (amount > availableQuantity) {
            throw new RuntimeException(
                    "Insufficient available stock");
        }

        int currentQuantity =
                inventory.getQuantity() == null
                        ? 0
                        : inventory.getQuantity();

        int newQuantity =
                currentQuantity - amount;

        return updateStock(productId, newQuantity);
    }

    // =========================================================
    // ADD STOCK FROM A USABLE RETURN
    // =========================================================

    public Inventory addReturnedStock(
            Long productId,
            Integer quantity) {

        if (productId == null) {
            throw new RuntimeException(
                    "Product ID is required");
        }

        if (quantity == null || quantity <= 0) {
            throw new RuntimeException(
                    "Returned quantity must be greater than zero");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        Inventory inventory = inventoryRepository
                .findByProductId(productId)
                .orElseGet(() -> createInventory(product));

        int currentQuantity =
                inventory.getQuantity() == null
                        ? 0
                        : inventory.getQuantity();

        int newQuantity =
                currentQuantity + quantity;

        inventory.setQuantity(newQuantity);
        inventory.setLastUpdated(LocalDateTime.now());

        // Keep Product quantity synchronized
        product.setQuantity(newQuantity);
        productRepository.save(product);

        return inventoryRepository.save(inventory);
    }

    // =========================================================
    // CREATE INVENTORY AUTOMATICALLY
    // =========================================================

    private Inventory createInventory(Product product) {

        Inventory inventory = new Inventory();

        inventory.setProduct(product);

        Integer productQuantity =
                product.getQuantity();

        if (productQuantity == null) {
            productQuantity = 0;
        }

        inventory.setQuantity(productQuantity);
        inventory.setReservedQuantity(0);
        inventory.setAvailableQuantity(productQuantity);
        inventory.setLastUpdated(LocalDateTime.now());

        return inventoryRepository.save(inventory);
    }

    // =========================================================
    // CHECK VENDOR OWNERSHIP
    // =========================================================

    private void checkVendorOwnership(
            Product product,
            String vendorEmail) {

        if (product.getVendorEmail() == null ||
                !product.getVendorEmail()
                        .equalsIgnoreCase(vendorEmail)) {

            throw new RuntimeException(
                    "You are not authorized to manage this product");
        }
    }

    // =========================================================
    // GET LOGGED-IN EMAIL
    // =========================================================

    private String getLoggedInEmail() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                authentication.getName() == null) {

            throw new RuntimeException(
                    "Vendor is not authenticated");
        }

        return authentication.getName();
    }
}