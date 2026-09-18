package com.shopstack.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.shopstack.backend.entity.User;
import com.shopstack.backend.repository.UserRepository;

@Configuration
public class StaffSeeder {
    private static final String STAFF_EMAIL = "staff@shopstack.com";
    private static final String STAFF_PASSWORD = "Staff123!";

    @Bean
    CommandLineRunner seedWarehouseStaff(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByEmail(STAFF_EMAIL)) {
                userRepository.save(new User("Warehouse Staff", STAFF_EMAIL,
                        passwordEncoder.encode(STAFF_PASSWORD), "STAFF"));
            }
        };
    }
}
