package com.shopstack.shopstack_backend.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.shopstack.shopstack_backend.entity.User;
import com.shopstack.shopstack_backend.entity.Role;

import java.util.List;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    long countByRole(Role role);

    List<User> findByRole(Role role);

    

}