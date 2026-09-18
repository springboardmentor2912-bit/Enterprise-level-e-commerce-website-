package com.shopstack.shopstack_backend.config;

import com.shopstack.shopstack_backend.constant.RoleName;
import com.shopstack.shopstack_backend.entity.Role;
import com.shopstack.shopstack_backend.entity.User;
import com.shopstack.shopstack_backend.repository.RoleRepository;
import com.shopstack.shopstack_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        // =========================
        // CREATE ROLES
        // =========================

        for (RoleName roleName : RoleName.values()) {

            if (roleRepository.findByRoleName(roleName).isEmpty()) {

                Role role = new Role();

                role.setRoleName(roleName);
                role.setDescription(roleName.name());

                roleRepository.save(role);
            }
        }

        // =========================
        // CREATE ADMIN USER
        // =========================

        String adminEmail = "admin@shopstack.com";

        if (userRepository.findByEmail(adminEmail).isEmpty()) {

            Role adminRole = roleRepository
                    .findByRoleName(RoleName.ROLE_ADMIN)
                    .orElseThrow(() ->
                            new RuntimeException("Admin role not found"));

            User admin = new User();

            admin.setFirstName("ShopStack");
            admin.setLastName("Admin");
            admin.setEmail(adminEmail);
            admin.setPhoneNumber("9999999999");

            admin.setPassword(
                    passwordEncoder.encode("Admin@123")
            );

            admin.setEnabled(true);
            admin.setRole(adminRole);

            userRepository.save(admin);

            System.out.println("====================================");
            System.out.println("ADMIN USER CREATED");
            System.out.println("Email    : admin@shopstack.com");
            System.out.println("Password : Admin@123");
            System.out.println("====================================");
        }
    }
}