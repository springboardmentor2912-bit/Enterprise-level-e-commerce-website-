package com.javaenterprise.product.controller;

import com.javaenterprise.product.dto.ProductRequest;
import com.javaenterprise.product.dto.ProductResponse;
import com.javaenterprise.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService service;


    @PostMapping
    public ProductResponse add(
            @RequestBody ProductRequest request,
            Authentication authentication) {

        System.out.println("CategoryId = " + request.getCategoryId());
        System.out.println("Name = " + request.getName());
        System.out.println("Price = " + request.getPrice());
        System.out.println("Image URL: " + request.getImageUrl());
        System.out.println("Image URL Length: " + request.getImageUrl().length());

        return service.add(request, authentication);
    }

    @GetMapping
    public List<ProductResponse> getAll(){

        return service.getAll();
    }

    @GetMapping("/{id}")
    public ProductResponse getById(@PathVariable Long id){

        return service.getById(id);
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id,
                                  @Valid @RequestBody ProductRequest request){

        return service.update(id,request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){

        service.delete(id);
    }
    @GetMapping("/search")
    public List<ProductResponse> search(@RequestParam String keyword) {

        return service.search(keyword);
    }

    @GetMapping("/category")
    public List<ProductResponse> category(@RequestParam String name) {

        return service.category(name);
    }

    @GetMapping("/price")
    public List<ProductResponse> price(
            @RequestParam BigDecimal min,
            @RequestParam BigDecimal max) {

        return service.price(min, max);
    }
    @GetMapping("/vendor")
    public List<ProductResponse> vendorProducts(
            Authentication authentication) {

        return service.getVendorProducts(authentication);
    }
    @PatchMapping("/{id}/discount")
    public ProductResponse updateDiscount(@PathVariable Long id,
                                          @RequestParam Integer discount,
                                          Authentication authentication) {
        return service.updateDiscount(id, discount, authentication);
    }
    @PatchMapping("/{id}/stock")
    public ProductResponse updateStock(@PathVariable Long id,
                                       @RequestParam Integer stock,
                                       Authentication authentication) {
        return service.updateStock(id, stock, authentication);
    }

    @PatchMapping("/{id}/price")
    public ProductResponse updatePrice(@PathVariable Long id,
                                       @RequestParam BigDecimal price,
                                       Authentication authentication) {
        return service.updatePrice(id, price, authentication);
    }

}