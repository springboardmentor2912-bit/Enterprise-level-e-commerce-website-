package com.shopstack.backend.service;

import com.shopstack.backend.model.InboundShipment;
import com.shopstack.backend.model.Inventory;
import com.shopstack.backend.model.Product;
import com.shopstack.backend.model.User;
import com.shopstack.backend.model.Warehouse;
import com.shopstack.backend.repository.InboundShipmentRepository;
import com.shopstack.backend.repository.InventoryRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class InboundShipmentService {

    @Autowired
    private InboundShipmentRepository inboundShipmentRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    private final Random random = new Random();

    /**
     * Step 1: Vendor Stage - Declares product stock and creates an Inbound Shipment Request.
     */
    @Transactional
    public InboundShipment createInboundShipment(Long vendorId, Long productId, Long warehouseId, int declaredQuantity, String courierPartner, String trackingNumber, String vendorNotes) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse facility not found"));

        Optional<User> vendorOpt = userRepository.findById(vendorId);
        String vendorName = vendorOpt.map(User::getFullName).orElse("Vendor #" + vendorId);

        String shipmentNumber = "INB-" + LocalDateTime.now().getYear() + "-" + (10000 + random.nextInt(90000));

        InboundShipment shipment = new InboundShipment(shipmentNumber, vendorId, vendorName, product, warehouse, declaredQuantity, vendorNotes);
        if (courierPartner != null && !courierPartner.trim().isEmpty()) {
            shipment.setCourierPartner(courierPartner);
            shipment.setTrackingNumber(trackingNumber);
            shipment.setStatus("SHIPPED_BY_VENDOR");
            shipment.setShippedAt(LocalDateTime.now());
        }

        return inboundShipmentRepository.save(shipment);
    }

    /**
     * Step 2a: Vendor ships stock to warehouse/hub with courier & AWB tracking.
     */
    @Transactional
    public InboundShipment markShipmentDispatched(Long shipmentId, String courierPartner, String trackingNumber) {
        InboundShipment shipment = inboundShipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found"));

        shipment.setCourierPartner(courierPartner);
        shipment.setTrackingNumber(trackingNumber);
        shipment.setStatus("SHIPPED_BY_VENDOR");
        shipment.setShippedAt(LocalDateTime.now());

        return inboundShipmentRepository.save(shipment);
    }

    /**
     * Step 2b: Warehouse receives shipment & generates GRN (Goods Receipt Note).
     */
    @Transactional
    public InboundShipment receiveAndGenerateGRN(Long shipmentId) {
        InboundShipment shipment = inboundShipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found"));

        String grnNumber = "GRN-" + (100000 + random.nextInt(900000));
        shipment.setGrnNumber(grnNumber);
        shipment.setStatus("GRN_GENERATED");
        shipment.setReceivedAt(LocalDateTime.now());

        return inboundShipmentRepository.save(shipment);
    }

    /**
     * Step 2c: Warehouse Staff verifies declared quantity vs actual received quantity & quality inspection (QC).
     */
    @Transactional
    public InboundShipment performQcVerification(Long shipmentId, int receivedQuantity, int damagedQuantity, String staffNotes) {
        InboundShipment shipment = inboundShipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found"));

        shipment.setReceivedQuantity(receivedQuantity);
        shipment.setDamagedQuantity(damagedQuantity);
        shipment.setStaffInspectionNotes(staffNotes);

        if (damagedQuantity > 0 || receivedQuantity < shipment.getDeclaredQuantity()) {
            shipment.setStatus("GRN_VERIFIED_WITH_FLAG");
        } else {
            shipment.setStatus("GRN_VERIFIED");
        }

        return inboundShipmentRepository.save(shipment);
    }

    /**
     * Step 3: Physical Shelving & System Update - Assigns Bin Location and updates warehouse inventory & catalog stock.
     */
    @Transactional
    public InboundShipment shelveStockIntoBin(Long shipmentId, String binLocation) {
        InboundShipment shipment = inboundShipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found"));

        if (!"GRN_VERIFIED".equals(shipment.getStatus()) && !"GRN_VERIFIED_WITH_FLAG".equals(shipment.getStatus()) && !"GRN_GENERATED".equals(shipment.getStatus())) {
            throw new IllegalStateException("Shipment must be received and QC verified before shelving");
        }

        shipment.setBinLocation(binLocation != null && !binLocation.trim().isEmpty() ? binLocation : "BIN-" + shipment.getWarehouse().getCode().replace("WH-", "") + "-01");
        shipment.setStatus("STORED_IN_BIN");
        shipment.setShelvedAt(LocalDateTime.now());

        // Update physical warehouse inventory
        Optional<Inventory> invOpt = inventoryRepository.findByWarehouseIdAndProductId(shipment.getWarehouse().getId(), shipment.getProduct().getId());
        Inventory inventory;
        int sellableQuantity = Math.max(0, shipment.getReceivedQuantity() - shipment.getDamagedQuantity());

        if (invOpt.isPresent()) {
            inventory = invOpt.get();
            inventory.setQuantity(inventory.getQuantity() + sellableQuantity);
            inventory.setDamagedQuantity(inventory.getDamagedQuantity() + shipment.getDamagedQuantity());
            inventory.setBinLocation(shipment.getBinLocation());
        } else {
            inventory = new Inventory(shipment.getWarehouse(), shipment.getProduct(), sellableQuantity);
            inventory.setDamagedQuantity(shipment.getDamagedQuantity());
            inventory.setBinLocation(shipment.getBinLocation());
        }
        inventoryRepository.save(inventory);

        // Sync global product catalog stock to total physical available stock
        List<Inventory> allProductInventories = inventoryRepository.findByProductId(shipment.getProduct().getId());
        int totalPhysicalSellable = allProductInventories.stream().mapToInt(Inventory::getQuantity).sum();
        Product product = shipment.getProduct();
        product.setStock(totalPhysicalSellable);
        productRepository.save(product);

        return inboundShipmentRepository.save(shipment);
    }

    public List<InboundShipment> getVendorShipments(Long vendorId) {
        return inboundShipmentRepository.findByVendorIdOrderByIdDesc(vendorId);
    }

    public List<InboundShipment> getWarehouseShipments(Long warehouseId) {
        return inboundShipmentRepository.findByWarehouseIdOrderByIdDesc(warehouseId);
    }

    public List<InboundShipment> getAllShipments() {
        return inboundShipmentRepository.findAllByOrderByIdDesc();
    }
}
