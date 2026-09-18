package com.javaenterprise.config;

import com.javaenterprise.user.entity.Role;
import com.javaenterprise.user.entity.User;
import com.javaenterprise.user.repository.RoleRepository;
import com.javaenterprise.user.repository.UserRepository;
import com.javaenterprise.warehouse.entity.Warehouse;
import com.javaenterprise.warehouse.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final WarehouseRepository warehouseRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${SEED_ADMIN_EMAIL:admin@gmail.com}")
    private String adminEmail;

    @Value("${SEED_ADMIN_PASSWORD:Admin@123}")
    private String adminPassword;

    @Value("${SEED_STAFF_EMAIL:warehouse@gmail.com}")
    private String staffEmail;

    @Value("${SEED_STAFF_PASSWORD:Warehouse@123}")
    private String staffPassword;

    @Override
    public void run(String... args) {
        Role adminRole = getOrCreateRole("ADMIN", "System Administrator");
        Role staffRole = getOrCreateRole("WAREHOUSE_STAFF", "Warehouse Staff");
        Warehouse defaultWarehouse = getOrCreateDefaultWarehouse();

        ensureUser(adminEmail, "System Admin", adminPassword, adminRole, null);
        ensureUser(staffEmail, "Warehouse Staff", staffPassword, staffRole, defaultWarehouse);
    }

    private Role getOrCreateRole(String roleName, String description) {
        return roleRepository.findByName(roleName).orElseGet(() -> {
            Role newRole = new Role();
            newRole.setName(roleName);
            newRole.setDescription(description);
            return roleRepository.save(newRole);
        });
    }

    private Warehouse getOrCreateDefaultWarehouse() {
        return warehouseRepository.findAll().stream().findFirst().orElseGet(() -> {
            Warehouse w = new Warehouse();
            w.setName("Main Warehouse");
            w.setCity("Default City");
            w.setState("Default State");  // ✅ THIS WAS MISSING!
            // 'active' is already true by default via @Builder.Default
            return warehouseRepository.save(w);
        });
    }

    // 🆕 SMART SEEDER: Creates OR Updates existing users
    private void ensureUser(String email, String name, String rawPassword, Role role, Warehouse warehouse) {
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    // Create new if missing
                    User newUser = User.builder()
                            .name(name)
                            .email(email)
                            .password(passwordEncoder.encode(rawPassword))
                            .build();
                    return userRepository.save(newUser);
                });

        boolean updated = false;

        // 1. Ensure Role is attached
        boolean hasRole = user.getRoles().stream().anyMatch(r -> r.getName().equals(role.getName()));
        if (!hasRole) {
            user.getRoles().add(role);
            updated = true;
        }

        // 2. Ensure Warehouse is attached (Crucial for warehouse staff)
        if (warehouse != null && user.getWarehouse() == null) {
            user.setWarehouse(warehouse);
            updated = true;
        }

        if (updated) {
            userRepository.save(user);
            System.out.println("🔧 Updated existing user: " + email + " (Linked Warehouse & Role)");
        } else {
            System.out.println("✅ User fully configured: " + email);
        }
    }
}