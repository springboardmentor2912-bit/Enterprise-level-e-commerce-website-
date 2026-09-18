package com.shopstack.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.service.ProductService;

@Configuration
public class ProductDataSeeder {

    @Bean
    CommandLineRunner seedProducts(UserRepository users, ProductService productService, JdbcTemplate jdbcTemplate) {
        return args -> {
            jdbcTemplate.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0");
            var vendorUsers = users.findAll().stream()
                    .filter(user -> "VENDOR".equalsIgnoreCase(user.getRole()))
                    .toList();
            vendorUsers.forEach(user -> user.setCommissionPercentage(User.VENDOR_COMMISSION_PERCENTAGE));
            users.saveAll(vendorUsers);
            vendorUsers.stream()
                    .filter(user -> "sudhanshu".equalsIgnoreCase(user.getDisplayName()))
                    .forEach(productService::seedSecondVendorProducts);
        };
    }
}
