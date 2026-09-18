package com.javaenterprise.vendor.controller;

import com.javaenterprise.product.dto.ProductResponse;
import com.javaenterprise.product.service.ProductService;
import com.javaenterprise.vendor.dto.VendorProductRequest;
import com.javaenterprise.vendor.dto.VendorProductResponse;
import com.javaenterprise.vendor.service.VendorProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/vendor/products")
@RequiredArgsConstructor
public class VendorProductController {

    private final VendorProductService vendorProductService;
    private final ProductService service;

    @GetMapping
    public List<VendorProductResponse> getMyProducts(Authentication authentication) {
        return vendorProductService.getMyProducts(authentication);
    }

    @GetMapping("/{id}")
    public VendorProductResponse getProduct(@PathVariable Long id, Authentication authentication) {
        return vendorProductService.getProduct(id, authentication);
    }

    @PostMapping
    public VendorProductResponse addProduct(@Valid @RequestBody VendorProductRequest request, Authentication authentication) {
        return vendorProductService.addProduct(request, authentication);
    }

    @PutMapping("/{id}")
    public VendorProductResponse updateProduct(@PathVariable Long id,
                                               @Valid @RequestBody VendorProductRequest request,
                                               Authentication authentication) {
        return vendorProductService.updateProduct(id, request, authentication);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id, Authentication authentication) {
        vendorProductService.deleteProduct(id, authentication);
    }

    @PatchMapping("/{id}/stock")
    public VendorProductResponse updateStock(@PathVariable Long id,
                                             @RequestParam Integer stock,
                                             Authentication authentication) {
        return vendorProductService.updateStock(id, stock, authentication);
    }

    @PatchMapping("/{id}/price")
    public VendorProductResponse updatePrice(@PathVariable Long id,
                                             @RequestParam BigDecimal price,
                                             Authentication authentication) {
        return vendorProductService.updatePrice(id, price, authentication);
    }

    @PatchMapping("/{id}/discount")
    public ProductResponse updateDiscount(@PathVariable Long id,
                                          @RequestParam Integer discount,
                                          Authentication authentication) {
        return service.updateDiscount(id, discount, authentication);
    }
}