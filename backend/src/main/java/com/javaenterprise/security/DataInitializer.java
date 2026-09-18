package com.javaenterprise.security;

import com.javaenterprise.user.entity.Role;
import com.javaenterprise.user.entity.RoleName;
import com.javaenterprise.user.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        for (RoleName roleName : RoleName.values()) {
            roleRepository.findByName(roleName.name())
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setName(roleName.name());
                        role.setDescription("Default role: " + roleName.name());
                        return roleRepository.save(role);
                    });
        }
    }
}