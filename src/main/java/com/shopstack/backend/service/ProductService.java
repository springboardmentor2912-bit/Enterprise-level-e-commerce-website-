package com.shopstack.backend.service;

import com.shopstack.backend.dto.ProductRequest;
import com.shopstack.backend.dto.ProductResponse;
import com.shopstack.backend.entity.Product;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;


    // =========================================================
    // ADD PRODUCT
    // =========================================================

    public String addProduct(String email, ProductRequest request) {

        User vendor = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Vendor not found"));

        Product product = new Product();

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());

        Double discount = request.getDiscount();

        if (discount == null) {
            discount = 0.0;
        }

        if (discount < 0 || discount > 100) {
            throw new RuntimeException(
                    "Discount must be between 0 and 100");
        }

        product.setDiscount(discount);

        Double finalPrice =
                request.getPrice()
                        - (request.getPrice() * discount / 100);

        product.setFinalPrice(finalPrice);
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        product.setImageUrl(request.getImageUrl());

        // Assign vendor
        product.setVendor(vendor);

        productRepository.save(product);

        return "Product Added Successfully";
    }


    // =========================================================
    // GET ALL PRODUCTS
    // =========================================================

    public List<ProductResponse> getAllProducts() {

        List<Product> products = productRepository.findAll();

        List<ProductResponse> responseList = new ArrayList<>();

        for (Product product : products) {

            ProductResponse response = new ProductResponse();
            System.out.println("PRODUCT ID = " + product.getId());
            System.out.println("PRODUCT NAME = " + product.getName());
            System.out.println("VENDOR OBJECT = " + product.getVendor());
            if (product.getVendor() != null) {
                System.out.println("VENDOR ID = " + product.getVendor().getId());
                System.out.println("VENDOR NAME = " + product.getVendor().getName());
            }
            response.setId(product.getId());
            response.setName(product.getName());
            response.setDescription(product.getDescription());
            response.setPrice(product.getPrice());

            Double discount = product.getDiscount();

            if (discount == null) {
                discount = 0.0;
            }

            Double finalPrice = product.getFinalPrice();

            if (finalPrice == null) {
                finalPrice = product.getPrice();
            }

            response.setDiscount(discount);
            response.setFinalPrice(finalPrice);
            response.setStock(product.getStock());
            response.setCategory(product.getCategory());
            response.setImageUrl(product.getImageUrl());

            // VENDOR
            if (product.getVendor() != null) {
                response.setVendorId(product.getVendor().getId());
                response.setVendorName(product.getVendor().getName());
            }

            responseList.add(response);
        }

        return responseList;
    }


    // =========================================================
    // GET MY PRODUCTS
    // =========================================================

    public List<ProductResponse> getMyProducts(
            String email) {

        User vendor =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor not found"));

        List<Product> products =
                productRepository.findByVendor(vendor);

        List<ProductResponse> responseList =
                new ArrayList<>();

        for (Product product : products) {

            ProductResponse response =
                    new ProductResponse();

            response.setId(product.getId());
            response.setName(product.getName());
            response.setDescription(product.getDescription());
            response.setPrice(product.getPrice());
            response.setDiscount(product.getDiscount());
            response.setFinalPrice(product.getFinalPrice());
            response.setStock(product.getStock());
            response.setCategory(product.getCategory());
            response.setImageUrl(product.getImageUrl());

            if (product.getVendor() != null) {

                response.setVendorId(
                        product.getVendor().getId()
                );

                response.setVendorName(
                        product.getVendor().getName()
                );
            }

            responseList.add(response);
        }

        return responseList;
    }


    // =========================================================
    // UPDATE PRODUCT
    // =========================================================

    public String updateProduct(
            Long id,
            String email,
            ProductRequest request) {

        User vendor =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor not found"));

        Product product =
                productRepository
                        .findByIdAndVendor(id, vendor)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found or access denied"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());

        Double discount =
                request.getDiscount();

        if (discount == null) {
            discount = 0.0;
        }

        if (discount < 0 || discount > 100) {
            throw new RuntimeException(
                    "Discount must be between 0 and 100");
        }

        product.setDiscount(discount);

        Double finalPrice =
                request.getPrice()
                        - (request.getPrice() * discount / 100);

        product.setFinalPrice(finalPrice);
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        product.setImageUrl(request.getImageUrl());

        productRepository.save(product);

        return "Product Updated Successfully";
    }


    // =========================================================
    // DELETE PRODUCT
    // =========================================================

    public String deleteProduct(
            Long id,
            String email) {

        User vendor =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor not found"));

        Product product =
                productRepository
                        .findByIdAndVendor(id, vendor)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found or access denied"));

        productRepository.delete(product);

        return "Product Deleted Successfully";
    }


    // =========================================================
    // GET PRODUCT BY ID
    // =========================================================

    public ProductResponse getProductById(
            Long id) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"));

        ProductResponse response =
                new ProductResponse();

        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setDiscount(product.getDiscount());
        response.setFinalPrice(product.getFinalPrice());
        response.setStock(product.getStock());
        response.setCategory(product.getCategory());
        response.setImageUrl(product.getImageUrl());

        if (product.getVendor() != null) {

            response.setVendorId(
                    product.getVendor().getId()
            );

            response.setVendorName(
                    product.getVendor().getName()
            );
        }

        return response;
    }
}