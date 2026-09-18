package com.shopstack.service;

import com.shopstack.dto.vendor.InventoryUpdateRequest;
import com.shopstack.entity.Inventory;
import com.shopstack.entity.InventoryHistory;
import com.shopstack.entity.Product;
import com.shopstack.exception.BadRequestException;
import com.shopstack.exception.InsufficientStockException;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.InventoryHistoryRepository;
import com.shopstack.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryHistoryRepository inventoryHistoryRepository;

    @Transactional
    public Inventory createForProduct(Product product, Integer initialStock, Integer lowStockThreshold, String warehouseLocation) {
        Inventory inventory = Inventory.builder()
                .product(product)
                .stockQuantity(initialStock != null ? initialStock : 0)
                .reservedQuantity(0)
                .lowStockThreshold(lowStockThreshold != null ? lowStockThreshold : 10)
                .warehouseLocation(warehouseLocation)
                .build();
        inventory = inventoryRepository.save(inventory);

        if (inventory.getStockQuantity() > 0) {
            logHistory(product, inventory.getStockQuantity(), inventory.getStockQuantity(), "INITIAL_STOCK", null);
        }
        return inventory;
    }

    public Inventory getByProductId(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory record not found for this product"));
    }

    @Transactional
    public Inventory adjustStock(Long productId, InventoryUpdateRequest request, String changedBy) {
        Inventory inventory = getByProductId(productId);

        int newQuantity = inventory.getStockQuantity() + request.getChangeQuantity();
        if (newQuantity < inventory.getReservedQuantity()) {
            throw new BadRequestException("Resulting stock cannot be less than already-reserved quantity");
        }

        inventory.setStockQuantity(newQuantity);
        if (request.getLowStockThreshold() != null) {
            inventory.setLowStockThreshold(request.getLowStockThreshold());
        }
        if (request.getWarehouseLocation() != null) {
            inventory.setWarehouseLocation(request.getWarehouseLocation());
        }
        inventory = inventoryRepository.save(inventory);

        logHistory(inventory.getProduct(), request.getChangeQuantity(), newQuantity,
                request.getReason() != null ? request.getReason() : "ADJUSTMENT", changedBy);

        return inventory;
    }

    @Transactional
    public void reserveStock(Long productId, int quantity) {
        Inventory inventory = getByProductId(productId);
        if (inventory.getAvailableQuantity() < quantity) {
            throw new InsufficientStockException("Insufficient stock for product: " + inventory.getProduct().getName());
        }
        inventory.setReservedQuantity(inventory.getReservedQuantity() + quantity);
        inventoryRepository.save(inventory);
    }

    @Transactional
    public void releaseReservedStock(Long productId, int quantity) {
        Inventory inventory = getByProductId(productId);
        inventory.setReservedQuantity(Math.max(0, inventory.getReservedQuantity() - quantity));
        inventoryRepository.save(inventory);
    }

    @Transactional
    public void confirmStockDeduction(Long productId, int quantity) {
        Inventory inventory = getByProductId(productId);
        inventory.setStockQuantity(inventory.getStockQuantity() - quantity);
        inventory.setReservedQuantity(Math.max(0, inventory.getReservedQuantity() - quantity));
        inventoryRepository.save(inventory);
        logHistory(inventory.getProduct(), -quantity, inventory.getStockQuantity(), "SALE", null);
    }

    @Transactional
    public void restockAfterCancellation(Long productId, int quantity) {
        Inventory inventory = getByProductId(productId);
        inventory.setStockQuantity(inventory.getStockQuantity() + quantity);
        inventoryRepository.save(inventory);
        logHistory(inventory.getProduct(), quantity, inventory.getStockQuantity(), "RETURN", null);
    }

    public List<Inventory> getLowStockForVendor(Long vendorId) {
        return inventoryRepository.findByVendorId(vendorId).stream().filter(Inventory::isLowStock).toList();
    }

    public List<InventoryHistory> getHistory(Long productId) {
        return inventoryHistoryRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    private void logHistory(Product product, int change, int resulting, String reason, String changedBy) {
        InventoryHistory history = InventoryHistory.builder()
                .product(product)
                .changeQuantity(change)
                .resultingStock(resulting)
                .reason(reason)
                .changedBy(changedBy)
                .build();
        inventoryHistoryRepository.save(history);
    }
}
