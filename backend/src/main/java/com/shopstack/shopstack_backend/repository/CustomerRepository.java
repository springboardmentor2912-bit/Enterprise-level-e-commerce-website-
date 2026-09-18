package com.shopstack.shopstack_backend.repository;

import com.shopstack.shopstack_backend.entity.Customer;
import com.shopstack.shopstack_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByUser(User user);

}