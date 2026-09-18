package com.shopstack.backend.controller;


import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.backend.entity.Product;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.repository.VendorOrderRepository;
import com.shopstack.backend.service.ProductService;

import lombok.RequiredArgsConstructor;



@RestController
@RequiredArgsConstructor
public class ProductController {



    private final ProductService productService;

    private final UserRepository userRepository;
    private final VendorOrderRepository orderRepository;

    public record PurchaseItem(Long productId, Integer quantity) {}

    @PostMapping("/api/products/reserve")
    public ResponseEntity<?> reserveProducts(@RequestBody List<PurchaseItem> items) {
        try {
            Map<Long, Integer> quantities = items.stream()
                    .collect(java.util.stream.Collectors.toMap(PurchaseItem::productId, PurchaseItem::quantity));
            productService.reserveProducts(quantities);
            return ResponseEntity.ok(Map.of("message", "Stock updated successfully"));
        } catch (IllegalStateException | IllegalArgumentException exception) {
            return ResponseEntity.status(409).body(Map.of("message", exception.getMessage()));
        }
    }

    @PostMapping("/api/products/release")
    public ResponseEntity<?> releaseProducts(@RequestBody List<PurchaseItem> items) {
        try {
            Map<Long, Integer> quantities = items.stream()
                    .collect(java.util.stream.Collectors.toMap(PurchaseItem::productId, PurchaseItem::quantity));
            productService.releaseProducts(quantities);
            return ResponseEntity.ok(Map.of("message", "Stock restored successfully"));
        } catch (IllegalStateException | IllegalArgumentException exception) {
            return ResponseEntity.status(409).body(Map.of("message", exception.getMessage()));
        }
    }

    @PostMapping("/api/products/complete")
    public ResponseEntity<?> completeProducts(@RequestBody List<PurchaseItem> items) {
        try {
            Map<Long, Integer> quantities = items.stream()
                    .collect(java.util.stream.Collectors.toMap(PurchaseItem::productId, PurchaseItem::quantity));
            productService.completeProducts(quantities);
            return ResponseEntity.ok(Map.of("message", "Order completed successfully"));
        } catch (IllegalStateException | IllegalArgumentException exception) {
            return ResponseEntity.status(409).body(Map.of("message", exception.getMessage()));
        }
    }

    public record CancelOrderRequest(String orderReference, List<PurchaseItem> items) {}

    @PostMapping("/api/products/cancel")
    public ResponseEntity<?> cancelProducts(@RequestBody CancelOrderRequest request, Authentication authentication) {
        try {
            if (request == null || request.items() == null || request.items().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Order items are required"));
            }

            Map<Long, Integer> quantities = request.items().stream()
                    .collect(java.util.stream.Collectors.toMap(PurchaseItem::productId, PurchaseItem::quantity));
            productService.cancelProducts(quantities);

            if (authentication != null && request.orderReference() != null && !request.orderReference().isBlank()) {
                User customer = userRepository.findByEmail(authentication.getName())
                        .orElse(null);
                if (customer != null) {
                    orderRepository.deleteByCustomerEmailAndOrderReference(customer.getEmail(), request.orderReference());
                }
            }

            return ResponseEntity.ok(Map.of("message", "Order cancelled and stock restored"));
        } catch (IllegalStateException | IllegalArgumentException exception) {
            return ResponseEntity.status(409).body(Map.of("message", exception.getMessage()));
        }
    }





    // ==============================
    // CUSTOMER - VIEW ALL PRODUCTS
    // ==============================

    @GetMapping("/api/products")
    public ResponseEntity<List<Product>> getAllProducts(){


        return ResponseEntity.ok(

            productService.getAllProducts()

        );


    }








    // ==============================
    // VENDOR PRODUCT APIs
    // ==============================


    @PostMapping("/api/vendor/products")
    public ResponseEntity<?> addProduct(
            @RequestBody Product product,
            Authentication authentication
    ) {



        User vendor =
                userRepository.findByEmail(
                        authentication.getName()
                )
                .orElseThrow(
                        () -> new RuntimeException(
                                "Vendor not found"
                        )
                );



        return ResponseEntity.ok(productService.addProduct(product, vendor));


    }







    @GetMapping("/api/vendor/products")
    public ResponseEntity<List<Product>> getVendorProducts(
            Authentication authentication
    ) {



        User vendor =
                userRepository.findByEmail(
                        authentication.getName()
                )
                .orElseThrow(
                        () -> new RuntimeException(
                                "Vendor not found"
                        )
                );



        return ResponseEntity.ok(

                productService.getVendorProducts(
                        vendor
                )

        );


    }









    @PutMapping("/api/vendor/products/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestBody Product product,
            Authentication authentication
    ){

        User vendor = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Vendor not found"));



        return ResponseEntity.ok(

                productService.updateProduct(
                        id,
                        product,
                        vendor
                )

        );


    }









    @DeleteMapping("/api/vendor/products/{id}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable Long id
    ){


        productService.deleteProduct(id);



        return ResponseEntity.ok(
                "Product deleted successfully"
        );


    }



}
