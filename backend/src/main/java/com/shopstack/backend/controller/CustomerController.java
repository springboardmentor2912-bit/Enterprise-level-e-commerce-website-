package com.shopstack.backend.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.backend.model.Address;
import com.shopstack.backend.model.Order;
import com.shopstack.backend.model.OrderItem;
import com.shopstack.backend.model.Product;
import com.shopstack.backend.model.User;
import com.shopstack.backend.model.WishlistItem;
import com.shopstack.backend.repository.AddressRepository;
import com.shopstack.backend.repository.OrderItemRepository;
import com.shopstack.backend.repository.OrderRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.repository.WishlistItemRepository;
import com.shopstack.backend.service.CouponService;
import com.shopstack.backend.service.WarehouseService;
import com.shopstack.backend.event.OrderPlacedEvent;
import org.springframework.context.ApplicationEventPublisher;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class CustomerController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CouponService couponService;

    @Autowired
    private WishlistItemRepository wishlistItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private com.shopstack.backend.repository.ReviewRepository reviewRepository;

    @Autowired
    private com.shopstack.backend.service.FileStorageService fileStorageService;

    @Autowired
    private WarehouseService warehouseService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    // Get Customer Profile Details
    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomerProfile(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.notFound().build();
    }

    // Update Customer Profile Details (Phone, Address, Full Name)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomerProfile(@PathVariable Long id, @RequestBody User updatedData) {
        Optional<User> optionalUser = userRepository.findById(id);

        if (optionalUser.isPresent()) {
            User existingUser = optionalUser.get();
            existingUser.setFullName(updatedData.getFullName());
            existingUser.setPhone(updatedData.getPhone());
            existingUser.setAddress(updatedData.getAddress());

            User savedUser = userRepository.save(existingUser);
            return ResponseEntity.ok(savedUser);
        }

        return ResponseEntity.notFound().build();
    }

    // Wishlist: Get all wishlisted products
    @GetMapping("/{id}/wishlist")
    public ResponseEntity<?> getWishlist(@PathVariable Long id) {
        List<WishlistItem> items = wishlistItemRepository.findByUserId(id);
        List<Product> products = new ArrayList<>();
        for (WishlistItem item : items) {
            Optional<Product> prod = productRepository.findById(item.getProductId());
            prod.ifPresent(products::add);
        }
        return ResponseEntity.ok(products);
    }

    // Wishlist: Add item to wishlist
    @PostMapping("/{id}/wishlist/{productId}")
    public ResponseEntity<?> addToWishlist(@PathVariable Long id, @PathVariable Long productId) {
        Optional<WishlistItem> existing = wishlistItemRepository.findByUserIdAndProductId(id, productId);
        if (existing.isPresent()) {
            return ResponseEntity.ok("Product already in wishlist.");
        }
        WishlistItem newItem = new WishlistItem(id, productId);
        wishlistItemRepository.save(newItem);
        return ResponseEntity.ok("Added to wishlist.");
    }

    // Wishlist: Remove item from wishlist
    @DeleteMapping("/{id}/wishlist/{productId}")
    @Transactional
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long id, @PathVariable Long productId) {
        wishlistItemRepository.deleteByUserIdAndProductId(id, productId);
        return ResponseEntity.ok("Removed from wishlist.");
    }

    // Addresses: Get all saved shipping addresses for customer
    @GetMapping("/{id}/addresses")
    public ResponseEntity<?> getCustomerAddresses(@PathVariable Long id) {
        List<Address> addresses = addressRepository.findByUserId(id);
        // Sort: default address first, then by ID descending
        addresses.sort((a, b) -> {
            boolean aDef = Boolean.TRUE.equals(a.getIsDefault());
            boolean bDef = Boolean.TRUE.equals(b.getIsDefault());
            if (aDef != bDef) {
                return aDef ? -1 : 1;
            }
            return Long.compare(b.getId() != null ? b.getId() : 0, a.getId() != null ? a.getId() : 0);
        });
        return ResponseEntity.ok(addresses);
    }

    // Addresses: Add a new address
    @PostMapping("/{id}/addresses")
    @Transactional
    public ResponseEntity<?> addCustomerAddress(@PathVariable Long id, @RequestBody Address address) {
        if (address.getStreetAddress() == null || address.getStreetAddress().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Street address is required.");
        }
        address.setUserId(id);
        List<Address> existing = addressRepository.findByUserId(id);
        
        // If this is the user's first address or marked default, set isDefault = true and unset others
        if (existing.isEmpty() || Boolean.TRUE.equals(address.getIsDefault())) {
            address.setIsDefault(true);
            for (Address a : existing) {
                a.setIsDefault(false);
                addressRepository.save(a);
            }
        } else {
            address.setIsDefault(false);
        }
        Address saved = addressRepository.save(address);
        return ResponseEntity.ok(saved);
    }

    // Addresses: Update an existing address
    @PutMapping("/{id}/addresses/{addressId}")
    @Transactional
    public ResponseEntity<?> updateCustomerAddress(@PathVariable Long id, @PathVariable Long addressId, @RequestBody Address updated) {
        Optional<Address> opt = addressRepository.findById(addressId);
        if (opt.isPresent() && opt.get().getUserId().equals(id)) {
            Address addr = opt.get();
            addr.setFullName(updated.getFullName());
            addr.setPhone(updated.getPhone());
            addr.setStreetAddress(updated.getStreetAddress());
            addr.setCity(updated.getCity());
            addr.setState(updated.getState());
            addr.setPostalCode(updated.getPostalCode());
            addr.setAddressType(updated.getAddressType());

            if (Boolean.TRUE.equals(updated.getIsDefault())) {
                List<Address> all = addressRepository.findByUserId(id);
                for (Address a : all) {
                    if (!a.getId().equals(addressId)) {
                        a.setIsDefault(false);
                        addressRepository.save(a);
                    }
                }
                addr.setIsDefault(true);
            }
            Address saved = addressRepository.save(addr);
            return ResponseEntity.ok(saved);
        }
        return ResponseEntity.notFound().build();
    }

    // Addresses: Set an address as default
    @PutMapping("/{id}/addresses/{addressId}/default")
    @Transactional
    public ResponseEntity<?> setDefaultAddress(@PathVariable Long id, @PathVariable Long addressId) {
        Optional<Address> opt = addressRepository.findById(addressId);
        if (opt.isPresent() && opt.get().getUserId().equals(id)) {
            List<Address> all = addressRepository.findByUserId(id);
            for (Address a : all) {
                a.setIsDefault(a.getId().equals(addressId));
                addressRepository.save(a);
            }
            return ResponseEntity.ok("Address marked as default successfully.");
        }
        return ResponseEntity.notFound().build();
    }

    // Addresses: Delete an address
    @DeleteMapping("/{id}/addresses/{addressId}")
    @Transactional
    public ResponseEntity<?> deleteCustomerAddress(@PathVariable Long id, @PathVariable Long addressId) {
        Optional<Address> opt = addressRepository.findById(addressId);
        if (opt.isPresent() && opt.get().getUserId().equals(id)) {
            boolean wasDefault = Boolean.TRUE.equals(opt.get().getIsDefault());
            addressRepository.deleteById(addressId);

            // If we deleted the default address, promote another address to default if one exists
            if (wasDefault) {
                List<Address> remaining = addressRepository.findByUserIdOrderByIdDesc(id);
                if (!remaining.isEmpty()) {
                    Address newDef = remaining.get(0);
                    newDef.setIsDefault(true);
                    addressRepository.save(newDef);
                }
            }
            return ResponseEntity.ok("Address deleted successfully.");
        }
        return ResponseEntity.notFound().build();
    }

    // Orders: Get order history for customer
    @GetMapping("/{id}/orders")
    public ResponseEntity<?> getCustomerOrders(@PathVariable Long id) {
        List<Order> orders = orderRepository.findByUserIdOrderByIdDesc(id).stream()
                .filter(o -> o.getOrderId() != null && !o.getOrderId().startsWith("ORD-FAIL-") && !"FAILED".equalsIgnoreCase(o.getPaymentStatus()))
                .collect(Collectors.toList());

        // Map order headers along with their order items
        List<Map<String, Object>> response = orders.stream().map(order -> {
            List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", order.getId());
            map.put("orderId", order.getOrderId());
            map.put("date", order.getDate());
            map.put("totalAmount", order.getTotalAmount());
            map.put("status", order.getStatus());
            map.put("paymentStatus", order.getPaymentStatus() != null ? order.getPaymentStatus() : "PENDING");
            map.put("paymentMethod", order.getPaymentMethod() != null ? order.getPaymentMethod() : "RAZORPAY");
            map.put("razorpayOrderId", order.getRazorpayOrderId());
            map.put("razorpayPaymentId", order.getRazorpayPaymentId());
            map.put("recipientName", order.getRecipientName());
            map.put("recipientPhone", order.getRecipientPhone());
            map.put("deliveryAddress", order.getDeliveryAddress());
            map.put("feedbackRating", order.getFeedbackRating());
            map.put("feedbackComment", order.getFeedbackComment());
            map.put("feedbackImage", order.getFeedbackImage());
            map.put("items", items);
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // Orders: Get all orders across the platform (Warehouse/Admin usage)
    @GetMapping("/orders/all")
    public ResponseEntity<?> getAllOrders() {
        List<Order> orders = orderRepository.findAllByOrderByIdDesc().stream()
                .filter(o -> o.getOrderId() != null && !o.getOrderId().startsWith("ORD-FAIL-") && !"FAILED".equalsIgnoreCase(o.getPaymentStatus()))
                .collect(Collectors.toList());

        List<Map<String, Object>> response = orders.stream().map(order -> {
            List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", order.getId());
            map.put("orderId", order.getOrderId());
            map.put("date", order.getDate());
            map.put("totalAmount", order.getTotalAmount());
            map.put("status", order.getStatus());
            map.put("paymentStatus", order.getPaymentStatus() != null ? order.getPaymentStatus() : "PENDING");
            map.put("paymentMethod", order.getPaymentMethod() != null ? order.getPaymentMethod() : "RAZORPAY");
            map.put("razorpayOrderId", order.getRazorpayOrderId());
            map.put("razorpayPaymentId", order.getRazorpayPaymentId());
            map.put("recipientName", order.getRecipientName());
            map.put("recipientPhone", order.getRecipientPhone());
            map.put("deliveryAddress", order.getDeliveryAddress());
            map.put("feedbackRating", order.getFeedbackRating());
            map.put("feedbackComment", order.getFeedbackComment());
            map.put("feedbackImage", order.getFeedbackImage());
            map.put("items", items);
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // Orders: Place order (Checkout)
    @PostMapping("/{id}/orders")
    @Transactional
    public ResponseEntity<?> placeOrder(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        List<Map<String, Object>> itemsList = (List<Map<String, Object>>) payload.get("items");
        if (itemsList == null || itemsList.isEmpty()) {
            return ResponseEntity.badRequest().body("Cart is empty");
        }

        // Validate stock for all items first
        double itemsSubtotal = 0.0;
        for (Map<String, Object> itemData : itemsList) {
            Long productId = Long.parseLong(itemData.get("id").toString());
            int quantity = Integer.parseInt(itemData.get("quantity").toString());
            double price = Double.parseDouble(itemData.get("price").toString());

            Optional<Product> prodOpt = productRepository.findById(productId);
            if (prodOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Product with ID " + productId + " not found.");
            }
            Product product = prodOpt.get();
            if (product.getStock() < quantity) {
                return ResponseEntity.badRequest().body("Insufficient stock for product '" + product.getName() + "'. Only " + product.getStock() + " units available.");
            }
            itemsSubtotal += price * quantity;
        }
        itemsSubtotal = Math.round(itemsSubtotal * 100.0) / 100.0;

        // Delivery fee: under 500 = 99, 500 and above = free (0)
        double deliveryFee = (itemsSubtotal < 500.0 && itemsSubtotal > 0) ? 99.0 : 0.0;

        double couponDiscount = 0.0;
        String couponCode = payload.containsKey("couponCode") && payload.get("couponCode") != null ? payload.get("couponCode").toString() : null;
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            Map<String, Object> validation = couponService.validateAndCalculateDiscount(couponCode, itemsList, id);
            if (Boolean.TRUE.equals(validation.get("valid"))) {
                couponDiscount = Double.parseDouble(validation.get("discountAmount").toString());
            }
        }

        double totalAmount = Math.max(0.0, Math.round((itemsSubtotal + deliveryFee - couponDiscount) * 100.0) / 100.0);

        String orderIdStr = "ORD-" + (int) (100000 + Math.random() * 900000);
        String dateStr = new java.text.SimpleDateFormat("MMM dd, yyyy").format(new java.util.Date());

        // Create and save Order Header. Automatically confirmed since stock verification passed.
        Order order = new Order(orderIdStr, id, dateStr, totalAmount, "CONFIRMED");
        order.setCouponCode(couponCode != null && !couponCode.trim().isEmpty() ? couponCode.trim().toUpperCase() : null);
        order.setCouponDiscount(couponDiscount);
        orderRepository.save(order);

        // Process each cart item
        for (Map<String, Object> itemData : itemsList) {
            Long productId = Long.parseLong(itemData.get("id").toString());
            String productName = itemData.get("name").toString();
            double price = Double.parseDouble(itemData.get("price").toString());
            int quantity = Integer.parseInt(itemData.get("quantity").toString());

            Product product = productRepository.findById(productId).get();
            Long vendorId = product.getVendorId();
            Double originalPrice = product.getPrice();
            Double discountPercentage = product.getDiscountPercentage();

            // If itemData contains explicit originalPrice or discountPercentage, use it
            if (itemData.containsKey("originalPrice") && itemData.get("originalPrice") != null) {
                originalPrice = Double.parseDouble(itemData.get("originalPrice").toString());
            }
            if (itemData.containsKey("discountPercentage") && itemData.get("discountPercentage") != null) {
                discountPercentage = Double.parseDouble(itemData.get("discountPercentage").toString());
            }

            // Create and save Order Line Item with discounted price, original price and discount %
            OrderItem orderItem = new OrderItem(orderIdStr, productId, productName, price, originalPrice, discountPercentage, quantity, vendorId);
            orderItemRepository.save(orderItem);
        }

        if (couponCode != null && !couponCode.trim().isEmpty() && couponDiscount > 0) {
            couponService.recordUsage(couponCode, id, order.getOrderId(), couponDiscount);
        }

        // Publish OrderPlacedEvent asynchronously
        try {
            User user = userRepository.findById(id).orElse(null);
            List<OrderItem> savedItems = orderItemRepository.findByOrderId(order.getOrderId());
            eventPublisher.publishEvent(new OrderPlacedEvent(order, savedItems, user));
        } catch (Exception e) {
            System.err.println("[CustomerController] Error publishing OrderPlacedEvent: " + e.getMessage());
        }

        // Order is CONFIRMED and queued for Administrator warehouse allocation
        return ResponseEntity.ok(order);
    }

    // Customer submits post-fulfillment feedback/survey and syncs to product reviews
    @PostMapping("/orders/{orderId}/feedback")
    @Transactional
    public ResponseEntity<?> submitOrderFeedback(@PathVariable String orderId, @RequestBody Map<String, Object> payload) {
        Optional<Order> orderOpt = orderRepository.findByOrderId(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Order order = orderOpt.get();
        int rating = 5;
        if (payload.containsKey("rating") && payload.get("rating") != null) {
            try {
                rating = Integer.parseInt(payload.get("rating").toString());
                if (rating < 1) rating = 1;
                if (rating > 5) rating = 5;
            } catch (Exception e) {
                rating = 5;
            }
            order.setFeedbackRating(rating);
        }
        String comment = "";
        if (payload.containsKey("comment") && payload.get("comment") != null) {
            comment = payload.get("comment").toString();
            order.setFeedbackComment(comment);
        }

        String image = null;
        if (payload.containsKey("image") && payload.get("image") != null) {
            image = payload.get("image").toString();
        } else if (payload.containsKey("feedbackImage") && payload.get("feedbackImage") != null) {
            image = payload.get("feedbackImage").toString();
        }
        if (image != null && !image.trim().isEmpty()) {
            image = fileStorageService.processAndSaveIfBase64(image.trim());
            order.setFeedbackImage(image);
        } else if (payload.containsKey("removeImage") && Boolean.parseBoolean(payload.get("removeImage").toString())) {
            order.setFeedbackImage(null);
        }

        orderRepository.save(order);

        // Derive reviewer name
        String reviewerName = order.getRecipientName();
        if (reviewerName == null || reviewerName.trim().isEmpty()) {
            if (order.getUserId() != null) {
                Optional<User> uOpt = userRepository.findById(order.getUserId());
                if (uOpt.isPresent() && uOpt.get().getFullName() != null && !uOpt.get().getFullName().trim().isEmpty()) {
                    reviewerName = uOpt.get().getFullName();
                } else {
                    reviewerName = "Verified Customer";
                }
            } else {
                reviewerName = "Verified Customer";
            }
        }

        String formattedDate = new java.text.SimpleDateFormat("MMM dd, yyyy").format(new java.util.Date());

        // Synchronize review to each purchased product in this order
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());
        if (items != null && !items.isEmpty()) {
            for (OrderItem item : items) {
                if (item.getProductId() != null) {
                    List<com.shopstack.backend.model.Review> existing = 
                        reviewRepository.findByUserIdAndProductId(order.getUserId(), item.getProductId());
                    
                    com.shopstack.backend.model.Review rev;
                    if (existing != null && !existing.isEmpty()) {
                        rev = existing.get(0);
                        rev.setRating(rating);
                        rev.setComment(comment);
                        rev.setReviewerName(reviewerName);
                        rev.setDate(formattedDate);
                        if (image != null && !image.trim().isEmpty()) {
                            rev.setImageUrl(image);
                        } else if (payload.containsKey("removeImage") && Boolean.parseBoolean(payload.get("removeImage").toString())) {
                            rev.setImageUrl(null);
                        }
                    } else {
                        rev = new com.shopstack.backend.model.Review(
                            item.getProductId(),
                            order.getUserId(),
                            reviewerName,
                            rating,
                            comment,
                            formattedDate,
                            image
                        );
                    }
                    reviewRepository.save(rev);
                }
            }
        }

        Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("orderId", order.getOrderId());
        resp.put("feedbackRating", order.getFeedbackRating());
        resp.put("feedbackComment", order.getFeedbackComment());
        resp.put("feedbackImage", order.getFeedbackImage());
        resp.put("status", "SUCCESS");
        return ResponseEntity.ok(resp);
    }
}