package com.shopstack.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.shopstack.backend.entity.User;
import com.shopstack.backend.repository.UserRepository;

@Configuration
public class AdminSeeder {

    private static final String ADMIN_EMAIL = "admin@shopstack.com";
    private static final String ADMIN_USERNAME = "Admin";
    private static final String ADMIN_ROLE = "ADMIN";
    private static final String ADMIN_PASSWORD = "Admin123!";

    @Bean
    CommandLineRunner seedAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            if (!userRepository.existsByEmail(ADMIN_EMAIL)) {

                User admin = new User();

                admin.setUsername(ADMIN_USERNAME);
                admin.setEmail(ADMIN_EMAIL);
                admin.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
                admin.setRole(ADMIN_ROLE);

                userRepository.save(admin);

                System.out.println("======================================");
                System.out.println("DEFAULT ADMIN USER CREATED");
                System.out.println("Email: " + ADMIN_EMAIL);
                System.out.println("Password: " + ADMIN_PASSWORD);
                System.out.println("Role: " + ADMIN_ROLE);
                System.out.println("======================================");

            } else {

                System.out.println(
                        "Admin user already exists: " + ADMIN_EMAIL
                );
            }
        };
    }
}