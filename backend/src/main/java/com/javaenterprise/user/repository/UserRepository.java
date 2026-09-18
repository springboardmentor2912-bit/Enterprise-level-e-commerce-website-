package com.javaenterprise.user.repository;
import com.javaenterprise.user.entity.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import com.javaenterprise.user.entity.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
    List<User> findAllByOrderByIdDesc();

    @Query("""
SELECT u FROM User u
JOIN u.roles r
WHERE r.name = :role
""")
    List<User> findByRole(@Param("role") String role);
    @Query("""
SELECT COUNT(DISTINCT u)
FROM User u
JOIN u.roles r
WHERE r.name = :role
""")
    long countByRole(@Param("role") String role);
}