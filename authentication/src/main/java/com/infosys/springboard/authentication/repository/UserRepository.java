package com.infosys.springboard.authentication.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infosys.springboard.authentication.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

Optional<User> findByEmail(String email);

List<User> findByRole(String role);

long countByRole(String role);


}
