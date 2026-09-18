package com.shopstack.backend.service;


import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstack.backend.entity.Product;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.WarehouseRepository;
import com.shopstack.backend.repository.WarehouseStockRepository;
import com.shopstack.backend.entity.Warehouse;
import com.shopstack.backend.entity.WarehouseStock;

import lombok.RequiredArgsConstructor;



@Service
@RequiredArgsConstructor
public class ProductService {



    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final WarehouseStockRepository warehouseStockRepository;







    // Vendor Add Product

    @Transactional
    public Product addProduct(
            Product product,
            User vendor
    ) {
        product.setVendor(vendor);
        product.setStock(Math.max(0, product.getStock()));
        product.setDiscountPercentage(product.getDiscountPercentage());
        product.setApprovalStatus("PENDING");


        Product saved = productRepository.save(product);
        return saved;


    }








    // Vendor View Own Products

    public List<Product> getVendorProducts(
            User vendor
    ) {


        return productRepository.findByVendor(vendor);


    }









    // Customer View All Products

    public List<Product> getAllProducts(){
        return productRepository.findAll().stream()
                .filter(product -> "APPROVED".equals(product.getApprovalStatus()))
                .toList();


    }

    @Transactional
    public void allocateProductToWarehouses(Long productId, Map<Long, Integer> allocations) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found."));
        if ("APPROVED".equals(product.getApprovalStatus())
                && !warehouseStockRepository.findByProductId(productId).isEmpty()) {
            throw new IllegalArgumentException("This product has already been allocated and cannot be changed.");
        }
        if (allocations == null || allocations.isEmpty()) {
            throw new IllegalArgumentException("Enter a quantity for at least one warehouse.");
        }

        int total = allocations.values().stream().mapToInt(quantity -> quantity == null ? 0 : quantity).sum();
        if (allocations.values().stream().anyMatch(quantity -> quantity == null || quantity < 0)) {
            throw new IllegalArgumentException("Warehouse quantities cannot be negative.");
        }
        if (total > product.getStock()) {
            throw new IllegalArgumentException("You cannot allocate more than the vendor added: " + product.getStock() + " units.");
        }
        if (total != product.getStock()) {
            throw new IllegalArgumentException("Warehouse quantities must total exactly " + product.getStock() + " units.");
        }
        allocations.keySet().forEach(warehouseId -> warehouseRepository.findById(warehouseId)
                .filter(Warehouse::isActive)
                .orElseThrow(() -> new IllegalArgumentException("All selected warehouses must be active.")));

        warehouseStockRepository.deleteAll(warehouseStockRepository.findByProductId(productId));
        allocations.forEach((warehouseId, quantity) -> {
            if (quantity > 0) warehouseStockRepository.save(new WarehouseStock(product.getId(), warehouseId, quantity));
        });
        product.setApprovalStatus("APPROVED");
        productRepository.save(product);
    }

    /** Adds the demo catalog for a vendor that has no inventory yet. */
    public void seedDefaultProducts(User vendor) {
        List<ProductSeed> seeds = List.of(
                new ProductSeed("Lenovo IdeaPad Laptop", "Fast everyday laptop for work, study and entertainment.", 54999, "Laptop", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900", 12, 8),
                new ProductSeed("Apple MacBook Air M3", "Lightweight premium laptop with long battery life and fast Apple silicon.", 99999, "Laptop", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900", 8, 10),
                new ProductSeed("HP Pavilion 15", "Reliable 15-inch laptop for productivity, study and everyday use.", 62999, "Laptop", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900", 14, 0),
                new ProductSeed("ASUS ROG Gaming Laptop", "High-performance gaming laptop with dedicated graphics and fast display.", 114999, "Gaming Laptop", "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=900", 6, 15),
                new ProductSeed("Dell G15 Gaming Laptop", "Powerful gaming laptop with dedicated graphics, fast refresh rate and upgraded cooling.", 84999, "Gaming Laptop", "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=900", 9, 12),
                new ProductSeed("Acer Aspire 5", "Versatile laptop for study, remote work and everyday multitasking.", 57999, "Laptop", "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=900", 11, 7),
                new ProductSeed("Samsung Galaxy Phone", "Modern smartphone with a bright display and powerful camera.", 29999, "Phone", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900", 20, 5),
                new ProductSeed("Apple iPhone 15", "Premium smartphone with an advanced camera and smooth performance.", 69999, "Phone", "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=900", 10, 0),
                new ProductSeed("OnePlus 12", "Fast Android smartphone with a high-refresh display and powerful charging.", 54999, "Phone", "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=900", 16, 9),
                new ProductSeed("Google Pixel 9", "Smartphone with an excellent camera and clean Android experience.", 74999, "Phone", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900", 9, 6),
                new ProductSeed("Wireless Bluetooth Headphones", "Comfortable wireless headphones with clear sound and long battery life.", 2499, "Headphones", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900", 25, 20),
                new ProductSeed("Mechanical Gaming Keyboard", "RGB mechanical keyboard with tactile switches and anti-ghosting keys.", 4499, "Accessories", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=900", 30, 15),
                new ProductSeed("Wireless Gaming Mouse", "Ergonomic wireless mouse with adjustable DPI and precision tracking.", 2199, "Accessories", "https://images.unsplash.com/photo-1527814050087-3793815479db?w=900", 35, 10),
                new ProductSeed("USB-C Laptop Hub", "Multi-port USB-C hub with HDMI, USB 3.0 and fast charging support.", 1799, "Accessories", "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=900", 28, 12),
                new ProductSeed("27-inch Full HD Monitor", "Slim bezel monitor with vivid colors for work, gaming and entertainment.", 15999, "Monitor", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=900", 10, 8),
                new ProductSeed("Portable SSD 1TB", "Fast and compact external SSD for backups, media and gaming libraries.", 6999, "Storage", "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=900", 18, 10),
                new ProductSeed("Smart Fitness Watch", "Fitness watch with heart-rate tracking, notifications and water resistance.", 3999, "Wearables", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900", 15, 18),
                new ProductSeed("1080p USB Webcam", "Plug-and-play webcam for clear video calls, classes and streaming.", 2499, "Accessories", "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=900", 22, 14),
                new ProductSeed("Bluetooth Portable Speaker", "Compact wireless speaker with rich sound and all-day battery life.", 2999, "Audio", "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900", 20, 16),
                new ProductSeed("Sony WH-1000XM5 Headphones", "Premium noise-cancelling headphones with immersive sound and all-day comfort.", 29990, "Headphones", "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=900", 12, 5),
                new ProductSeed("Samsung Galaxy Tab S9", "Powerful Android tablet with a vivid display for work, study and entertainment.", 55999, "Tablet", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=900", 10, 8),
                new ProductSeed("Kindle Paperwhite", "Waterproof e-reader with a glare-free display and weeks of battery life.", 13999, "E-reader", "https://images.unsplash.com/photo-1592496001020-d31bd830651f?w=900", 15, 0),
                new ProductSeed("Logitech MX Master 3S", "Ergonomic wireless productivity mouse with quiet clicks and precise tracking.", 8999, "Accessories", "https://images.unsplash.com/photo-1527814050087-3793815479db?w=900", 18, 10),
                new ProductSeed("JBL Tune Wireless Earbuds", "Compact true wireless earbuds with rich bass and a portable charging case.", 4999, "Audio", "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900", 24, 12),
                new ProductSeed("TP-Link WiFi 6 Router", "High-speed dual-band router for reliable whole-home connectivity.", 6499, "Networking", "https://images.unsplash.com/photo-1647427060118-4911c9821b82?w=900", 14, 0),
                new ProductSeed("Anker 20,000mAh Power Bank", "Fast-charging portable power bank with USB-C and dual USB outputs.", 3499, "Accessories", "https://images.unsplash.com/photo-1609592424846-7f3d0f4f2d2d?w=900", 30, 7)
        );

        saveSeedProducts(vendor, seeds);
    }

    /** Adds a distinct starter catalog for the second vendor account. */
    public void seedSecondVendorProducts(User vendor) {
        List<ProductSeed> seeds = List.of(
                new ProductSeed("Noise Cancelling Earbuds Pro", "Compact wireless earbuds with active noise cancellation and a charging case.", 3499, "Audio", "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=900", 20, 8),
                new ProductSeed("Smart LED Desk Lamp", "Adjustable desk lamp with touch controls, warm light and USB charging.", 1899, "Home Electronics", "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900", 18, 10),
                new ProductSeed("USB-C Fast Charger 65W", "Universal fast charger for phones, tablets and compatible laptops.", 2299, "Accessories", "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=900", 30, 5),
                new ProductSeed("Portable Power Station", "Rechargeable backup power station for travel, work and emergency use.", 12999, "Power", "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=900", 8, 12)
        );
        saveSeedProducts(vendor, seeds);
    }

    private void saveSeedProducts(User vendor, List<ProductSeed> seeds) {
        List<Product> existingProducts = productRepository.findByVendor(vendor);
        seeds.forEach(seed -> {
            Product product = existingProducts.stream()
                    .filter(existing -> existing.getName().equals(seed.name()))
                    .findFirst()
                    .orElseGet(Product::new);
            product.setName(seed.name());
            product.setDescription(seed.description());
            product.setPrice(seed.price());
            product.setCategory(seed.category());
            product.setImageUrl(seed.imageUrl());
            if (product.getId() == null) product.setStock(seed.stock());
            product.setDiscountPercentage(seed.discountPercentage());
            product.setVendor(vendor);
            productRepository.save(product);
        });
    }

    private record ProductSeed(String name, String description, double price, String category, String imageUrl, int stock, double discountPercentage) {}

    @Transactional
    public void reserveProducts(Map<Long, Integer> quantities) {
        quantities.forEach((id, quantity) -> {
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));

            if (quantity == null || quantity < 1 || product.getStock() < quantity) {
                throw new IllegalStateException("Only " + product.getStock() + " items are available.");
            }

            product.setStock(product.getStock() - quantity);
            productRepository.save(product);
        });
    }

    @Transactional
    public void releaseProducts(Map<Long, Integer> quantities) {
        quantities.forEach((id, quantity) -> {
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));

            if (quantity == null || quantity < 1) {
                throw new IllegalArgumentException("Release quantity must be at least 1");
            }

            product.setStock(product.getStock() + quantity);
            productRepository.save(product);
        });
    }

    @Transactional
    public void completeProducts(Map<Long, Integer> quantities) {
        quantities.forEach((id, quantity) -> {
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));

            if (quantity == null || quantity < 1) {
                throw new IllegalArgumentException("Quantity must be at least 1");
            }

            product.setSoldQuantity(product.getSoldQuantity() + quantity);
            productRepository.save(product);
        });
    }

    @Transactional
    public void cancelProducts(Map<Long, Integer> quantities) {
        quantities.forEach((id, quantity) -> {
            // Orders are kept as historical records, so a product may have
            // been deleted from the catalog after the order was placed.
            Product product = productRepository.findById(id).orElse(null);
            if (product == null) {
                return;
            }
            if (quantity == null || quantity < 1) {
                throw new IllegalArgumentException("Cancellation quantity must be at least 1");
            }
            product.setStock(product.getStock() + quantity);
            product.setSoldQuantity(Math.max(0, product.getSoldQuantity() - quantity));
            productRepository.save(product);
        });
    }

    private void adjustWarehouseStock(Long productId, int quantity, boolean release) {
        List<WarehouseStock> allocations = warehouseStockRepository.findByProductId(productId);
        if (allocations.isEmpty()) return;
        if (release) {
            allocations.get(0).setAvailableQuantity(allocations.get(0).getAvailableQuantity() + quantity);
            warehouseStockRepository.save(allocations.get(0));
            return;
        }
        int remaining = quantity;
        for (WarehouseStock allocation : allocations) {
            int moved = Math.min(remaining, allocation.getAvailableQuantity());
            allocation.setAvailableQuantity(allocation.getAvailableQuantity() - moved);
            warehouseStockRepository.save(allocation);
            remaining -= moved;
            if (remaining == 0) break;
        }
    }









    // Vendor Update Product

    public Product updateProduct(
            Long id,
            Product updatedProduct,
            User vendor
    ) {



        Product product =
                productRepository.findByIdAndVendor(id, vendor)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Product not found"
                        )
                );



        product.setName(
                updatedProduct.getName()
        );



        product.setDescription(
                updatedProduct.getDescription()
        );



        product.setPrice(
                updatedProduct.getPrice()
        );

        product.setDiscountPercentage(updatedProduct.getDiscountPercentage());



        product.setCategory(
                updatedProduct.getCategory()
        );



        product.setImageUrl(
                updatedProduct.getImageUrl()
        );

        product.setStock(
                Math.max(0, updatedProduct.getStock())
        );



        return productRepository.save(product);


    }









    // Vendor Delete Product

    public void deleteProduct(
            Long id
    ) {


        productRepository.deleteById(id);


    }



}
