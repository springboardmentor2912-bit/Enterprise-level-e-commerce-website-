package com.shopstack.backend.service;

import com.shopstack.backend.dto.InventoryResponse;
import com.shopstack.backend.dto.InventorySummaryResponse;
import com.shopstack.backend.dto.StockUpdateRequest;
import com.shopstack.backend.entity.Product;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class InventoryService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    // View Vendor Inventory
    public List<InventoryResponse> getInventory(String email) {

        User vendor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        List<Product> products = productRepository.findByVendor(vendor);

        List<InventoryResponse> responseList = new ArrayList<>();

        for (Product product : products) {

            InventoryResponse response = new InventoryResponse();

            response.setId(product.getId());
            response.setName(product.getName());
            response.setStock(product.getStock());

            if (product.getStock() == 0) {
                response.setStatus("OUT OF STOCK");
            } else if (product.getStock() <= 10) {
                response.setStatus("LOW STOCK");
            } else {
                response.setStatus("IN STOCK");
            }

            responseList.add(response);
        }

        return responseList;
    }

    // Add Stock
    public String addStock(Long productId, String email, StockUpdateRequest request) {

        User vendor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        Product product = productRepository.findByIdAndVendor(productId, vendor)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setStock(product.getStock() + request.getQuantity());

        productRepository.save(product);

        return "Stock Added Successfully";
    }

    // Update Stock
    public String updateStock(Long productId, String email, StockUpdateRequest request) {

        User vendor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        Product product = productRepository.findByIdAndVendor(productId, vendor)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setStock(request.getQuantity());

        productRepository.save(product);

        return "Stock Updated Successfully";
    }

    // Inventory Summary
    public InventorySummaryResponse getSummary(String email) {

        User vendor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        List<Product> products = productRepository.findByVendor(vendor);

        InventorySummaryResponse summary = new InventorySummaryResponse();

        int total = products.size();
        int inStock = 0;
        int lowStock = 0;
        int outOfStock = 0;

        for (Product product : products) {

            if (product.getStock() == 0) {
                outOfStock++;
            } else if (product.getStock() <= 10) {
                lowStock++;
            } else {
                inStock++;
            }
        }

        summary.setTotalProducts(total);
        summary.setInStock(inStock);
        summary.setLowStock(lowStock);
        summary.setOutOfStock(outOfStock);

        return summary;
    }
}