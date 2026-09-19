package com.shopstack.backend.repository;

import com.shopstack.backend.entity.User;
import com.shopstack.backend.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    long countByRole(Role role);

    List<User> findByRole(Role role);

    List<User> findByWarehouse(com.shopstack.backend.entity.Warehouse warehouse);
}