package com.shopstack.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.backend.model.Product;
import com.shopstack.backend.model.Review;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.ReviewRepository;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private com.shopstack.backend.repository.UserRepository userRepository;

    @Autowired
    private com.shopstack.backend.repository.WishlistItemRepository wishlistItemRepository;

    @Autowired
    private com.shopstack.backend.repository.ProductCouponRepository productCouponRepository;

    @Autowired
    private com.shopstack.backend.repository.InventoryRepository inventoryRepository;

    @Autowired
    private com.shopstack.backend.repository.InboundShipmentRepository inboundShipmentRepository;

    @Autowired
    private com.shopstack.backend.repository.StockTransferRepository stockTransferRepository;

    @Autowired
    private com.shopstack.backend.repository.WarehouseAllocationRepository warehouseAllocationRepository;

    @Autowired
    private com.shopstack.backend.repository.WarehouseRepository warehouseRepository;

    @Autowired
    private com.shopstack.backend.service.WarehouseService warehouseService;

    @Autowired
    private com.shopstack.backend.service.FileStorageService fileStorageService;

    // Upload single product image to disk
    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please select a valid image file."));
            }
            String imageUrl = fileStorageService.storeFile(file);
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Image upload failed: " + e.getMessage()));
        }
    }

    // Upload multiple product images to disk
    @PostMapping("/upload-images")
    public ResponseEntity<?> uploadMultipleImages(@RequestParam("files") org.springframework.web.multipart.MultipartFile[] files) {
        try {
            if (files == null || files.length == 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please select at least one image file."));
            }
            List<String> imageUrls = new java.util.ArrayList<>();
            for (org.springframework.web.multipart.MultipartFile file : files) {
                if (!file.isEmpty()) {
                    imageUrls.add(fileStorageService.storeFile(file));
                }
            }
            return ResponseEntity.ok(Map.of("imageUrls", imageUrls));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Image uploads failed: " + e.getMessage()));
        }
    }

    // Delete a single product image from disk storage
    @DeleteMapping("/delete-image")
    public ResponseEntity<?> deleteImage(@RequestParam("imageUrl") String imageUrl) {
        try {
            if (imageUrl == null || imageUrl.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Image URL is required."));
            }
            boolean deleted = fileStorageService.deleteFile(imageUrl);
            return ResponseEntity.ok(Map.of("success", true, "deleted", deleted));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to delete image: " + e.getMessage()));
        }
    }

    @jakarta.annotation.PostConstruct
    @org.springframework.transaction.annotation.Transactional
    public void initProducts() {
        // Ensure all existing products have discountPercentage and finalPrice populated
        List<Product> all = productRepository.findAll();
        for (Product p : all) {
            boolean changed = false;
            if (p.getDiscountPercentage() == null) {
                p.setDiscountPercentage(0.0);
                changed = true;
            }
            if (p.getFinalPrice() == null || p.getFinalPrice() == 0.0) {
                p.setFinalPrice(p.calculateFinalPrice());
                changed = true;
            }
            if (p.getStatus() == null || "PENDING".equalsIgnoreCase(p.getStatus())) {
                p.setStatus("APPROVED");
                changed = true;
            }
            // Sync stock with sum of available warehouse inventory
            List<com.shopstack.backend.model.Inventory> invs = inventoryRepository.findByProductId(p.getId());
            if (invs != null && !invs.isEmpty()) {
                int totalAvailable = invs.stream()
                        .mapToInt(com.shopstack.backend.model.Inventory::getAvailableQuantity)
                        .sum();
                if (p.getStock() == null || !p.getStock().equals(totalAvailable)) {
                    p.setStock(totalAvailable);
                    changed = true;
                }
            }
            // Check if any existing product has base64 data and migrate it to disk
            if (p.getImageUrl() != null && p.getImageUrl().startsWith("data:image/")) {
                p.setImageUrl(fileStorageService.processAndSaveIfBase64(p.getImageUrl()));
                changed = true;
            }
            if (p.getImages() != null && !p.getImages().isEmpty()) {
                List<String> updatedImages = new java.util.ArrayList<>();
                boolean imgChanged = false;
                for (String img : p.getImages()) {
                    if (img != null && img.startsWith("data:image/")) {
                        updatedImages.add(fileStorageService.processAndSaveIfBase64(img));
                        imgChanged = true;
                    } else {
                        updatedImages.add(img);
                    }
                }
                if (imgChanged) {
                    p.setImages(updatedImages);
                    changed = true;
                }
            }
            if (changed) {
                productRepository.save(p);
            }
        }
    }

    // Get all approved products
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll().stream()
                .filter(p -> "APPROVED".equalsIgnoreCase(p.getStatus()))
                .map(this::populateRatings)
                .collect(Collectors.toList());
    }

    // Get product by id
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        Optional<Product> optional = productRepository.findById(id);
        if (optional.isPresent()) {
            return ResponseEntity.ok(populateRatings(optional.get()));
        }
        return ResponseEntity.notFound().build();
    }

    // Search approved products
    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String query) {
        return productRepository.findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(query, query)
                .stream()
                .filter(p -> "APPROVED".equalsIgnoreCase(p.getStatus()))
                .map(this::populateRatings)
                .collect(Collectors.toList());
    }

    // Vendor: Add product (defaults to PENDING awaiting Admin approval)
    @PostMapping
    public ResponseEntity<?> addProduct(@RequestBody Product product) {
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Product name is required.");
        }
        if (product.getPrice() < 0) {
            return ResponseEntity.badRequest().body("Price cannot be negative.");
        }
        if (product.getDiscountPercentage() == null || product.getDiscountPercentage() < 0) {
            product.setDiscountPercentage(0.0);
        } else if (product.getDiscountPercentage() > 100) {
            return ResponseEntity.badRequest().body("Discount percentage cannot exceed 100%.");
        }
        product.setFinalPrice(product.calculateFinalPrice());

        // Sanitize any base64 images into disk files to prevent DB 5MB limit bloat
        product = fileStorageService.sanitizeProductImages(product);

        // Always require admin approval for new products
        product.setStatus("PENDING");
        Product saved = productRepository.save(product);

        // Distribute initial stock across warehouses
        int totalStock = saved.getStock() != null ? saved.getStock() : 0;
        List<com.shopstack.backend.model.Warehouse> whs = warehouseRepository.findAll();
        if (whs != null && !whs.isEmpty()) {
            int kolQty = (int) Math.round(totalStock * 0.4);
            int mumQty = (int) Math.round(totalStock * 0.3);
            int delQty = (int) Math.round(totalStock * 0.2);
            int blrQty = Math.max(0, totalStock - (kolQty + mumQty + delQty));

            for (com.shopstack.backend.model.Warehouse wh : whs) {
                int q = 0;
                if ("Kolkata".equalsIgnoreCase(wh.getCity()) || (wh.getCode() != null && wh.getCode().contains("KOL"))) q = kolQty;
                else if ("Mumbai".equalsIgnoreCase(wh.getCity()) || (wh.getCode() != null && wh.getCode().contains("MUM"))) q = mumQty;
                else if ("Delhi".equalsIgnoreCase(wh.getCity()) || (wh.getCode() != null && wh.getCode().contains("DEL"))) q = delQty;
                else if ("Bangalore".equalsIgnoreCase(wh.getCity()) || (wh.getCode() != null && wh.getCode().contains("BLR"))) q = blrQty;
                inventoryRepository.save(new com.shopstack.backend.model.Inventory(wh, saved, q));
            }
        }

        return ResponseEntity.ok(populateRatings(saved));
    }

    // Vendor: Update product price, discount, stock, category, name
    // Whenever vendor updates product price or discount, status goes back to PENDING for Admin review
    @PutMapping("/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product updated) {
        Optional<Product> optional = productRepository.findById(id);
        if (optional.isPresent()) {
            Product p = optional.get();

            // Track old images to clean up any removed images from disk
            java.util.Set<String> oldImages = new java.util.HashSet<>();
            if (p.getImageUrl() != null && !p.getImageUrl().trim().isEmpty()) {
                oldImages.add(p.getImageUrl().trim());
            }
            if (p.getImages() != null) {
                for (String img : p.getImages()) {
                    if (img != null && !img.trim().isEmpty()) {
                        oldImages.add(img.trim());
                    }
                }
            }

            p.setName(updated.getName());
            p.setCategory(updated.getCategory());
            p.setPrice(updated.getPrice());
            if (updated.getDiscountPercentage() != null) {
                if (updated.getDiscountPercentage() < 0 || updated.getDiscountPercentage() > 100) {
                    return ResponseEntity.badRequest().body("Discount percentage must be between 0% and 100%.");
                }
                p.setDiscountPercentage(updated.getDiscountPercentage());
            } else {
                p.setDiscountPercentage(0.0);
            }
            p.setFinalPrice(p.calculateFinalPrice());
            if (updated.getStock() != null) {
                p.setStock(updated.getStock());
            }
            p.setImageUrl(updated.getImageUrl());
            p.setBrand(updated.getBrand());
            p.setDescription(updated.getDescription());
            p.setImages(updated.getImages());
            p.setCouponsEnabled(updated.isCouponsEnabled());
            if (updated.getReturnPolicy() != null) {
                p.setReturnPolicy(updated.getReturnPolicy());
            }

            // Sanitize any base64 images into disk files before persisting
            p = fileStorageService.sanitizeProductImages(p);

            // Track new images
            java.util.Set<String> newImages = new java.util.HashSet<>();
            if (p.getImageUrl() != null && !p.getImageUrl().trim().isEmpty()) {
                newImages.add(p.getImageUrl().trim());
            }
            if (p.getImages() != null) {
                for (String img : p.getImages()) {
                    if (img != null && !img.trim().isEmpty()) {
                        newImages.add(img.trim());
                    }
                }
            }

            // Automatically delete removed images from disk storage
            for (String oldImg : oldImages) {
                if (!newImages.contains(oldImg)) {
                    fileStorageService.deleteFile(oldImg);
                }
            }

            // Changes to product pricing/discount require Admin re-approval
            p.setStatus("PENDING");
            p.setRejectionReason(null);
            Product saved = productRepository.save(p);
            return ResponseEntity.ok(populateRatings(saved));
        }
        return ResponseEntity.notFound().build();
    }

    // Vendor: Directly update product stock inventory without triggering re-approval
    @PutMapping("/{id}/stock")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> updateProductStock(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<Product> optional = productRepository.findById(id);
        if (optional.isPresent()) {
            Product p = optional.get();
            if (!payload.containsKey("stock") || payload.get("stock") == null) {
                return ResponseEntity.badRequest().body("Stock quantity is required.");
            }
            int newStock = Integer.parseInt(payload.get("stock").toString());
            if (newStock < 0) {
                return ResponseEntity.badRequest().body("Stock cannot be negative.");
            }
            p.setStock(newStock);

            // Sync with warehouse inventories proportionally
            List<com.shopstack.backend.model.Inventory> invs = inventoryRepository.findByProductId(id);
            if (invs != null && !invs.isEmpty()) {
                int currentPhysicalTotal = invs.stream().mapToInt(com.shopstack.backend.model.Inventory::getQuantity).sum();
                if (newStock == 0) {
                    for (com.shopstack.backend.model.Inventory inv : invs) {
                        inv.setQuantity(0);
                        inventoryRepository.save(inv);
                    }
                } else if (currentPhysicalTotal > 0) {
                    int distributedSoFar = 0;
                    for (int i = 0; i < invs.size(); i++) {
                        com.shopstack.backend.model.Inventory inv = invs.get(i);
                        if (i == invs.size() - 1) {
                            inv.setQuantity(Math.max(0, newStock - distributedSoFar));
                        } else {
                            double ratio = (double) inv.getQuantity() / currentPhysicalTotal;
                            int allocatedQty = (int) Math.round(newStock * ratio);
                            inv.setQuantity(Math.max(0, allocatedQty));
                            distributedSoFar += inv.getQuantity();
                        }
                        inventoryRepository.save(inv);
                    }
                } else {
                    int perHub = newStock / invs.size();
                    int remainder = newStock % invs.size();
                    for (int i = 0; i < invs.size(); i++) {
                        com.shopstack.backend.model.Inventory inv = invs.get(i);
                        inv.setQuantity(perHub + (i == 0 ? remainder : 0));
                        inventoryRepository.save(inv);
                    }
                }
            } else {
                List<com.shopstack.backend.model.Warehouse> whs = warehouseRepository.findAll();
                if (whs != null && !whs.isEmpty()) {
                    int kolQty = (int) Math.round(newStock * 0.4);
                    int mumQty = (int) Math.round(newStock * 0.3);
                    int delQty = (int) Math.round(newStock * 0.2);
                    int blrQty = Math.max(0, newStock - (kolQty + mumQty + delQty));

                    for (com.shopstack.backend.model.Warehouse wh : whs) {
                        int q = 0;
                        if ("Kolkata".equalsIgnoreCase(wh.getCity()) || (wh.getCode() != null && wh.getCode().contains("KOL"))) q = kolQty;
                        else if ("Mumbai".equalsIgnoreCase(wh.getCity()) || (wh.getCode() != null && wh.getCode().contains("MUM"))) q = mumQty;
                        else if ("Delhi".equalsIgnoreCase(wh.getCity()) || (wh.getCode() != null && wh.getCode().contains("DEL"))) q = delQty;
                        else if ("Bangalore".equalsIgnoreCase(wh.getCity()) || (wh.getCode() != null && wh.getCode().contains("BLR"))) q = blrQty;
                        inventoryRepository.save(new com.shopstack.backend.model.Inventory(wh, p, q));
                    }
                }
            }

            Product saved = productRepository.save(p);
            return ResponseEntity.ok(populateRatings(saved));
        }
        return ResponseEntity.notFound().build();
    }

    // Vendor: Toggle product active/disabled status
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleProductStatus(@PathVariable Long id) {
        Optional<Product> optional = productRepository.findById(id);
        if (optional.isPresent()) {
            Product p = optional.get();
            if ("DISABLED".equalsIgnoreCase(p.getStatus())) {
                p.setStatus("APPROVED");
            } else {
                p.setStatus("DISABLED");
            }
            Product saved = productRepository.save(p);
            return ResponseEntity.ok(populateRatings(saved));
        }
        return ResponseEntity.notFound().build();
    }

    // Vendor: Disable product
    @PutMapping("/{id}/disable")
    public ResponseEntity<?> disableProduct(@PathVariable Long id) {
        Optional<Product> optional = productRepository.findById(id);
        if (optional.isPresent()) {
            Product p = optional.get();
            p.setStatus("DISABLED");
            Product saved = productRepository.save(p);
            return ResponseEntity.ok(populateRatings(saved));
        }
        return ResponseEntity.notFound().build();
    }

    // Vendor: Enable product
    @PutMapping("/{id}/enable")
    public ResponseEntity<?> enableProduct(@PathVariable Long id) {
        Optional<Product> optional = productRepository.findById(id);
        if (optional.isPresent()) {
            Product p = optional.get();
            p.setStatus("APPROVED");
            Product saved = productRepository.save(p);
            return ResponseEntity.ok(populateRatings(saved));
        }
        return ResponseEntity.notFound().build();
    }

    // Delete product and automatically remove stored image files from disk and cascade references
    @DeleteMapping("/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        Optional<Product> optional = productRepository.findById(id);
        if (optional.isPresent()) {
            Product p = optional.get();
            // Automatically delete cover image and gallery images from disk
            if (p.getImageUrl() != null) {
                fileStorageService.deleteFile(p.getImageUrl());
            }
            if (p.getImages() != null) {
                for (String img : p.getImages()) {
                    fileStorageService.deleteFile(img);
                }
            }

            // 1. Inbound Shipments referencing product (foreign key parent)
            try {
                List<com.shopstack.backend.model.InboundShipment> shipments = inboundShipmentRepository.findAll().stream()
                        .filter(s -> s.getProduct() != null && id.equals(s.getProduct().getId()))
                        .collect(Collectors.toList());
                if (!shipments.isEmpty()) {
                    inboundShipmentRepository.deleteAll(shipments);
                }
            } catch (Exception ex) {
                System.err.println("Note cleaning shipments: " + ex.getMessage());
            }

            // 2. Stock Transfers referencing product (foreign key parent)
            try {
                List<com.shopstack.backend.model.StockTransfer> transfers = stockTransferRepository.findAll().stream()
                        .filter(t -> t.getProduct() != null && id.equals(t.getProduct().getId()))
                        .collect(Collectors.toList());
                if (!transfers.isEmpty()) {
                    stockTransferRepository.deleteAll(transfers);
                }
            } catch (Exception ex) {
                System.err.println("Note cleaning transfers: " + ex.getMessage());
            }

            // 3. Keep historical WarehouseAllocation records for past orders (no foreign key constraint)

            // 4. Warehouse Inventories
            try {
                List<com.shopstack.backend.model.Inventory> inventories = inventoryRepository.findByProductId(id);
                if (inventories != null && !inventories.isEmpty()) {
                    inventoryRepository.deleteAll(inventories);
                }
            } catch (Exception ignored) {}

            // 5. Reviews
            try {
                List<Review> reviews = reviewRepository.findByProductIdOrderByIdDesc(id);
                if (reviews != null && !reviews.isEmpty()) {
                    reviewRepository.deleteAll(reviews);
                }
            } catch (Exception ignored) {}

            // 6. Wishlist Items
            try {
                List<com.shopstack.backend.model.WishlistItem> wishlists = wishlistItemRepository.findAll().stream()
                        .filter(w -> id.equals(w.getProductId()))
                        .collect(Collectors.toList());
                if (wishlists != null && !wishlists.isEmpty()) {
                    wishlistItemRepository.deleteAll(wishlists);
                }
            } catch (Exception ignored) {}

            // 7. Product Coupons
            try {
                List<com.shopstack.backend.model.ProductCoupon> coupons = productCouponRepository.findByProductId(id);
                if (coupons != null && !coupons.isEmpty()) {
                    productCouponRepository.deleteAll(coupons);
                }
            } catch (Exception ignored) {}

            // 8. Clear collection elements
            if (p.getImages() != null) {
                p.getImages().clear();
                productRepository.saveAndFlush(p);
            }

            productRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Product deleted successfully", "id", id));
        }
        return ResponseEntity.notFound().build();
    }

    // Vendor: Get all products listed by a vendor
    @GetMapping("/vendor/{vendorId}")
    public List<Product> getProductsByVendor(@PathVariable Long vendorId) {
        return productRepository.findAll().stream()
                .filter(p -> p.getVendorId() != null && p.getVendorId().equals(vendorId))
                .map(this::populateRatings)
                .collect(Collectors.toList());
    }

    // Admin: Get all pending products
    @GetMapping("/pending")
    public List<Product> getPendingProducts() {
        return productRepository.findAll().stream()
                .filter(p -> "PENDING".equalsIgnoreCase(p.getStatus()))
                .map(this::populateRatings)
                .collect(Collectors.toList());
    }

    // Admin: Approve product
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveProduct(@PathVariable Long id) {
        Optional<Product> optional = productRepository.findById(id);
        if (optional.isPresent()) {
            Product p = optional.get();
            p.setStatus("APPROVED");
            productRepository.save(p);
            return ResponseEntity.ok(p);
        }
        return ResponseEntity.notFound().build();
    }

    // Admin: Reject product with optional reason
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectProduct(@PathVariable Long id, @RequestBody(required = false) Map<String, String> payload) {
        Optional<Product> optional = productRepository.findById(id);
        if (optional.isPresent()) {
            Product p = optional.get();
            p.setStatus("REJECTED");
            if (payload != null && payload.containsKey("rejectionReason")) {
                p.setRejectionReason(payload.get("rejectionReason"));
            } else {
                p.setRejectionReason("Rejected by Administrator");
            }
            productRepository.save(p);
            return ResponseEntity.ok(p);
        }
        return ResponseEntity.notFound().build();
    }

    // Reviews: Get all reviews for a product
    @GetMapping("/{id}/reviews")
    public List<Review> getReviewsForProduct(@PathVariable Long id) {
        return reviewRepository.findByProductIdOrderByIdDesc(id);
    }

    // Reviews: Submit review
    @PostMapping("/{id}/reviews")
    public ResponseEntity<?> addReview(@PathVariable Long id, @RequestBody Review review) {
        review.setProductId(id);
        if (review.getRating() < 1 || review.getRating() > 5) {
            return ResponseEntity.badRequest().body("Rating must be between 1 and 5 stars.");
        }
        if (review.getImageUrl() != null && !review.getImageUrl().trim().isEmpty()) {
            review.setImageUrl(fileStorageService.processAndSaveIfBase64(review.getImageUrl().trim()));
        }
        Review saved = reviewRepository.save(review);
        return ResponseEntity.ok(saved);
    }

    private Product populateRatings(Product p) {
        if (p.getDiscountPercentage() == null) {
            p.setDiscountPercentage(0.0);
        }
        if (p.getFinalPrice() == null) {
            p.setFinalPrice(p.calculateFinalPrice());
        }
        List<Review> reviews = reviewRepository.findByProductIdOrderByIdDesc(p.getId());
        if (reviews.isEmpty()) {
            p.setAverageRating(0.0);
            p.setReviewCount(0);
        } else {
            double sum = 0;
            for (Review r : reviews) {
                sum += r.getRating();
            }
            p.setAverageRating(Math.round((sum / reviews.size()) * 10.0) / 10.0);
            p.setReviewCount(reviews.size());
        }

        // Populate Vendor Details
        if (p.getVendorId() != null) {
            Optional<com.shopstack.backend.model.User> vendorOpt = userRepository.findById(p.getVendorId());
            if (vendorOpt.isPresent()) {
                com.shopstack.backend.model.User v = vendorOpt.get();
                p.setVendorName(v.getFullName());
                p.setVendorEmail(v.getEmail());
                p.setVendorPhone(v.getPhone());
                p.setVendorCode(v.getVendorCode());
                p.setVendorAddress(v.getAddress());
            }
        }

        // Dynamically populate actual available stock from warehouse inventory
        List<com.shopstack.backend.model.Inventory> invs = inventoryRepository.findByProductId(p.getId());
        if (invs != null && !invs.isEmpty()) {
            int totalAvailable = invs.stream()
                    .mapToInt(com.shopstack.backend.model.Inventory::getAvailableQuantity)
                    .sum();
            p.setStock(totalAvailable);
        }

        return p;
    }

    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<?> updateReview(@PathVariable Long reviewId, @RequestBody Map<String, Object> payload) {
        Optional<Review> opt = reviewRepository.findById(reviewId);
        if (opt.isPresent()) {
            Review r = opt.get();
            Long userId = Long.valueOf(payload.get("userId").toString());
            if (!r.getUserId().equals(userId)) {
                return ResponseEntity.status(403).body("Error: You can only edit your own reviews!");
            }
            r.setRating(Integer.parseInt(payload.get("rating").toString()));
            r.setComment(payload.get("comment").toString());
            if (payload.containsKey("imageUrl") && payload.get("imageUrl") != null) {
                String img = payload.get("imageUrl").toString().trim();
                r.setImageUrl(fileStorageService.processAndSaveIfBase64(img));
            } else if (payload.containsKey("removeImage") && Boolean.parseBoolean(payload.get("removeImage").toString())) {
                r.setImageUrl(null);
            }
            Review saved = reviewRepository.save(r);
            return ResponseEntity.ok(saved);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId, @RequestParam Long userId) {
        Optional<Review> opt = reviewRepository.findById(reviewId);
        if (opt.isPresent()) {
            Review r = opt.get();
            if (!r.getUserId().equals(userId)) {
                return ResponseEntity.status(403).body("Error: You can only delete your own reviews!");
            }
            reviewRepository.deleteById(reviewId);
            return ResponseEntity.ok("Review deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }
}