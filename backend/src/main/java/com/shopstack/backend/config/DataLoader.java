package com.shopstack.backend.config;

import com.shopstack.backend.model.Inventory;
import com.shopstack.backend.model.Product;
import com.shopstack.backend.model.Warehouse;
import com.shopstack.backend.repository.InventoryRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.WarehouseRepository;
import com.shopstack.backend.model.Refund;
import com.shopstack.backend.model.OrderItem;
import com.shopstack.backend.model.WarehouseAllocation;
import com.shopstack.backend.repository.RefundRepository;
import com.shopstack.backend.repository.OrderItemRepository;
import com.shopstack.backend.repository.WarehouseAllocationRepository;
import com.shopstack.backend.model.User;
import com.shopstack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private RefundRepository refundRepository;

    @Autowired
    private WarehouseAllocationRepository warehouseAllocationRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Override
    public void run(String... args) throws Exception {
        // Seed or ensure all 4 default warehouses exist (Kolkata, Mumbai, Delhi, Bangalore)
        List<Warehouse> existingWarehouses = warehouseRepository.findAll();
        Warehouse whKolkata = existingWarehouses.stream().filter(w -> "Kolkata".equalsIgnoreCase(w.getCity()) || (w.getCode() != null && w.getCode().contains("KOL"))).findFirst().orElse(null);
        Warehouse whMumbai = existingWarehouses.stream().filter(w -> "Mumbai".equalsIgnoreCase(w.getCity()) || (w.getCode() != null && w.getCode().contains("MUM"))).findFirst().orElse(null);
        Warehouse whDelhi = existingWarehouses.stream().filter(w -> "Delhi".equalsIgnoreCase(w.getCity()) || (w.getCode() != null && w.getCode().contains("DEL"))).findFirst().orElse(null);
        Warehouse whBangalore = existingWarehouses.stream().filter(w -> "Bangalore".equalsIgnoreCase(w.getCity()) || (w.getCode() != null && w.getCode().contains("BLR"))).findFirst().orElse(null);

        if (whKolkata == null) {
            whKolkata = warehouseRepository.save(new Warehouse("Kolkata Regional Fulfillment Hub", "WH-KOL-01", "Salt Lake Sector V, Bidhannagar", "Kolkata"));
        }
        if (whMumbai == null) {
            whMumbai = warehouseRepository.save(new Warehouse("Mumbai Central Warehouse", "WH-MUM-02", "12 Industrial Area, Andheri East", "Mumbai"));
        }
        if (whDelhi == null) {
            whDelhi = warehouseRepository.save(new Warehouse("Delhi NCR Fulfillment Center", "WH-DEL-03", "45 Sector Road, Gurugram", "Delhi"));
        }
        if (whBangalore == null) {
            whBangalore = warehouseRepository.save(new Warehouse("Bangalore Logistics Hub", "WH-BLR-04", "88 Electronics City Phase 1", "Bangalore"));
        }

        System.out.println("Default warehouses (Kolkata, Mumbai, Delhi, Bangalore) verified.");

        // Ensure default seed accounts exist in PostgreSQL database
        if (!userRepository.existsByEmailIgnoreCase("admin@admin")) {
            User admin = new User("System Administrator", "admin@admin", "admin123", "ADMINISTRATOR", "+91 98765 43210", "ShopStack HQ, Tech City");
            userRepository.saveAndFlush(admin);
            System.out.println("Default Administrator seeded: admin@admin");
        }

        if (!userRepository.existsByEmailIgnoreCase("seller@seller")) {
            User vendor = new User("Prime Merchant", "seller@seller", "seller123", "VENDOR", "+91 98765 11223", "Merchant Boulevard, Sector 5");
            vendor.setVendorCode("123456");
            vendor.setCommissionRate(10.0);
            userRepository.saveAndFlush(vendor);
            System.out.println("Default Vendor seeded: seller@seller (Vendor Code: 123456)");
        }

        if (!userRepository.existsByEmailIgnoreCase("staff@staff")) {
            User staff = new User("Kolkata Hub Staff", "staff@staff", "staff123", "WAREHOUSE_STAFF", "+91 98765 99887", "Salt Lake Sector V, Kolkata");
            staff.setWarehouseId(whKolkata.getId());
            staff.setWarehouseName(whKolkata.getName() + " (" + whKolkata.getCode() + ")");
            userRepository.saveAndFlush(staff);
            System.out.println("Default Warehouse Staff seeded: staff@staff");
        }

        if (!userRepository.existsByEmailIgnoreCase("customer@gmail.com")) {
            User customer = new User("Demo Customer", "customer@gmail.com", "customer123", "CUSTOMER", "+91 98765 00001", "12 Park Street, Kolkata");
            userRepository.saveAndFlush(customer);
            System.out.println("Default Customer seeded: customer@gmail.com");
        }

        // Distribute stock for any product that has no warehouse inventory yet
        List<Product> products = productRepository.findAll();
        for (Product product : products) {
            List<Inventory> existingInv = inventoryRepository.findByProductId(product.getId());
            if (existingInv == null || existingInv.isEmpty()) {
                int totalStock = product.getStock() != null ? product.getStock() : 10;
                
                // Distribute stock: 40% Kolkata, 30% Mumbai, 20% Delhi, 10% Bangalore
                int kolQty = (int) Math.round(totalStock * 0.4);
                int mumQty = (int) Math.round(totalStock * 0.3);
                int delQty = (int) Math.round(totalStock * 0.2);
                int blrQty = Math.max(0, totalStock - (kolQty + mumQty + delQty));

                if (kolQty > 0 || totalStock == 0) {
                    inventoryRepository.save(new Inventory(whKolkata, product, kolQty));
                }
                if (mumQty > 0) {
                    inventoryRepository.save(new Inventory(whMumbai, product, mumQty));
                }
                if (delQty > 0) {
                    inventoryRepository.save(new Inventory(whDelhi, product, delQty));
                }
                if (blrQty > 0) {
                    inventoryRepository.save(new Inventory(whBangalore, product, blrQty));
                }
            } else {
                // Synchronize global product stock with existing warehouse inventories
                int totalAvailable = existingInv.stream().mapToInt(Inventory::getAvailableQuantity).sum();
                if (product.getStock() == null || product.getStock() != totalAvailable) {
                    product.setStock(totalAvailable);
                    productRepository.save(product);
                }
            }
        }

        // Reconcile any return damaged stock to match the order's allocated warehouse
        try {
            List<Refund> refunds = refundRepository.findAll();
            for (Refund r : refunds) {
                if ("QC_PASSED".equalsIgnoreCase(r.getReturnStage()) || "QC_FAILED".equalsIgnoreCase(r.getReturnStage()) || "REFUNDED".equalsIgnoreCase(r.getStatus())) {
                    List<WarehouseAllocation> allocs = warehouseAllocationRepository.findByOrderId(r.getOrderId());
                    if (allocs != null && !allocs.isEmpty() && allocs.get(0).getWarehouse() != null) {
                        Long allocWhId = allocs.get(0).getWarehouse().getId();
                        List<OrderItem> items = orderItemRepository.findByOrderId(r.getOrderId());
                        for (OrderItem item : items) {
                            if (item.getProductId() != null) {
                                // If damaged inventory was placed in Mumbai (1) instead of allocated Wh (e.g. Delhi 2)
                                Optional<Inventory> mumInv = inventoryRepository.findByWarehouseIdAndProductId(1L, item.getProductId());
                                if (mumInv.isPresent() && mumInv.get().getDamagedQuantity() > 0 && !allocWhId.equals(1L)) {
                                    int damaged = mumInv.get().getDamagedQuantity();
                                    mumInv.get().setDamagedQuantity(0);
                                    inventoryRepository.save(mumInv.get());

                                    Optional<Inventory> targetInv = inventoryRepository.findByWarehouseIdAndProductId(allocWhId, item.getProductId());
                                    Warehouse targetWh = warehouseRepository.findById(allocWhId).orElse(null);
                                    Product prod = productRepository.findById(item.getProductId()).orElse(null);
                                    if (targetWh != null && prod != null) {
                                        Inventory target = targetInv.orElseGet(() -> new Inventory(targetWh, prod, 0));
                                        target.setDamagedQuantity(target.getDamagedQuantity() + damaged);
                                        inventoryRepository.save(target);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Note: Return stock reconciliation skipped: " + e.getMessage());
        }
    }
}
