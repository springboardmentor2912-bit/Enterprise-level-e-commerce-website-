package com.shopstack.repository;

import com.shopstack.entity.Customer;
import com.shopstack.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Customer> findByRole(Role role);
    List<Customer> findByRoleAndWarehouseId(Role role, Long warehouseId);
}
