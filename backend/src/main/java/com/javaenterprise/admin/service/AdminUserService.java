package com.javaenterprise.admin.service;

import com.javaenterprise.admin.dto.AdminUserResponse;
import com.javaenterprise.user.entity.Role;
import com.javaenterprise.user.entity.User;
import com.javaenterprise.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    public List<AdminUserResponse> getAllUsers() {

        return userRepository.findAllByOrderByIdDesc()
                .stream()
                .map(this::map)
                .toList();
    }

    public List<AdminUserResponse> getCustomers() {

        return userRepository.findByRole("CUSTOMER")
                .stream()
                .map(this::map)
                .toList();
    }

    public List<AdminUserResponse> getVendors() {

        return userRepository.findByRole("VENDOR")
                .stream()
                .map(this::map)
                .toList();
    }

    public List<AdminUserResponse> getWarehouseStaff() {

        return userRepository.findByRole("WAREHOUSE_STAFF")
                .stream()
                .map(this::map)
                .toList();
    }

    public AdminUserResponse disableUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow();

        user.setEnabled(false);

        userRepository.save(user);

        return map(user);
    }

    public AdminUserResponse enableUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow();

        user.setEnabled(true);

        userRepository.save(user);

        return map(user);
    }

    private AdminUserResponse map(User user) {

        String role = user.getRoles()
                .stream()
                .findFirst()
                .map(Role::getName)
                .orElse("");

        return AdminUserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(role)
                .enabled(user.isEnabled())
                .build();
    }
}