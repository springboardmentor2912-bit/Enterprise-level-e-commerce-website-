package com.shopstack.backend.service;

import com.shopstack.backend.model.Inventory;
import com.shopstack.backend.model.Product;
import com.shopstack.backend.model.StockTransfer;
import com.shopstack.backend.model.Warehouse;
import com.shopstack.backend.repository.InventoryRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.StockTransferRepository;
import com.shopstack.backend.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class StockTransferService {

    @Autowired
    private StockTransferRepository stockTransferRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    private final Random random = new Random();

    /**
     * Step 4 & 5: Admin / WMS creates an Inter-Warehouse Regional Stock Transfer Order.
     */
    @Transactional
    public StockTransfer createTransfer(Long sourceWarehouseId, Long destinationWarehouseId, Long productId, int quantity, String transferReason, String notes) {
        Warehouse destWh = warehouseRepository.findById(destinationWarehouseId)
                .orElseThrow(() -> new IllegalArgumentException("Destination warehouse not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Warehouse sourceWh = null;
        if (sourceWarehouseId != null) {
            if (sourceWarehouseId.equals(destinationWarehouseId)) {
                throw new IllegalArgumentException("Source and destination warehouse cannot be the same");
            }
            sourceWh = warehouseRepository.findById(sourceWarehouseId)
                    .orElseThrow(() -> new IllegalArgumentException("Source warehouse not found"));

            // Verify source inventory has enough available stock
            Optional<Inventory> srcInvOpt = inventoryRepository.findByWarehouseIdAndProductId(sourceWarehouseId, productId);
            if (srcInvOpt.isEmpty() || srcInvOpt.get().getAvailableQuantity() < quantity) {
                int avail = srcInvOpt.map(Inventory::getAvailableQuantity).orElse(0);
                throw new IllegalArgumentException("Insufficient available stock in " + sourceWh.getName() + " (Available: " + avail + ", Requested: " + quantity + ")");
            }
        }

        String prefix = sourceWh == null ? "DIST-" : "TRF-";
        String transferNumber = prefix + LocalDateTime.now().getYear() + "-" + (10000 + random.nextInt(90000));
        StockTransfer transfer = new StockTransfer(transferNumber, sourceWh, destWh, product, quantity, transferReason, notes);
        
        if (sourceWh == null) {
            transfer.setSourceOrigin("VENDOR");
            transfer.setSourceVendorName(product.getVendorName() != null ? product.getVendorName() : "Vendor Listed Stock");
            // If vendor distribution, immediately add to destination inventory and mark as distributed
            Inventory destInv = inventoryRepository.findByWarehouseIdAndProductId(destinationWarehouseId, productId)
                    .orElseGet(() -> new Inventory(destWh, product, 0));
            destInv.setQuantity(destInv.getQuantity() + quantity);
            inventoryRepository.save(destInv);
            transfer.setStatus("RECEIVED_AND_SHELVED");
            transfer.setReceivedAt(LocalDateTime.now());
        }

        return stockTransferRepository.save(transfer);
    }

    /**
     * Source Warehouse dispatches the physical stock transfer.
     */
    @Transactional
    public StockTransfer dispatchTransfer(Long transferId, String courierPartner, String trackingNumber) {
        StockTransfer transfer = stockTransferRepository.findById(transferId)
                .orElseThrow(() -> new IllegalArgumentException("Transfer order not found"));

        if (!"APPROVED_BY_ADMIN".equals(transfer.getStatus()) && !"REQUESTED".equals(transfer.getStatus())) {
            throw new IllegalStateException("Transfer cannot be dispatched in status " + transfer.getStatus());
        }

        // Deduct physical stock from source warehouse inventory
        Optional<Inventory> srcInvOpt = inventoryRepository.findByWarehouseIdAndProductId(transfer.getSourceWarehouse().getId(), transfer.getProduct().getId());
        if (srcInvOpt.isPresent()) {
            Inventory srcInv = srcInvOpt.get();
            srcInv.setQuantity(Math.max(0, srcInv.getQuantity() - transfer.getQuantity()));
            inventoryRepository.save(srcInv);
        }

        transfer.setCourierPartner(courierPartner != null && !courierPartner.trim().isEmpty() ? courierPartner : "ShopStack Express");
        transfer.setTrackingNumber(trackingNumber != null ? trackingNumber : "TRK-TRF-" + (100000 + random.nextInt(900000)));
        transfer.setStatus("DISPATCHED");
        transfer.setDispatchedAt(LocalDateTime.now());

        return stockTransferRepository.save(transfer);
    }

    /**
     * Destination Warehouse receives and shelves the transferred stock.
     */
    @Transactional
    public StockTransfer receiveAndShelveTransfer(Long transferId, String binLocation) {
        StockTransfer transfer = stockTransferRepository.findById(transferId)
                .orElseThrow(() -> new IllegalArgumentException("Transfer order not found"));

        if (!"DISPATCHED".equals(transfer.getStatus())) {
            throw new IllegalStateException("Transfer must be in DISPATCHED status to receive");
        }

        // Add physical stock to destination warehouse inventory
        Optional<Inventory> destInvOpt = inventoryRepository.findByWarehouseIdAndProductId(transfer.getDestinationWarehouse().getId(), transfer.getProduct().getId());
        Inventory destInv;

        if (destInvOpt.isPresent()) {
            destInv = destInvOpt.get();
            destInv.setQuantity(destInv.getQuantity() + transfer.getQuantity());
            if (binLocation != null && !binLocation.trim().isEmpty()) {
                destInv.setBinLocation(binLocation);
            }
        } else {
            destInv = new Inventory(transfer.getDestinationWarehouse(), transfer.getProduct(), transfer.getQuantity());
            destInv.setBinLocation(binLocation != null && !binLocation.trim().isEmpty() ? binLocation : "BIN-" + transfer.getDestinationWarehouse().getCode().replace("WH-", "") + "-01");
        }
        inventoryRepository.save(destInv);

        transfer.setStatus("RECEIVED_AND_SHELVED");
        transfer.setReceivedAt(LocalDateTime.now());

        return stockTransferRepository.save(transfer);
    }

    public List<StockTransfer> getAllTransfers() {
        return stockTransferRepository.findAllByOrderByIdDesc();
    }

    public List<StockTransfer> getTransfersForWarehouse(Long warehouseId) {
        return stockTransferRepository.findBySourceWarehouseIdOrDestinationWarehouseIdOrderByIdDesc(warehouseId, warehouseId);
    }
}
