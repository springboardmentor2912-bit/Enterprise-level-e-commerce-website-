package com.shopstack.shopstack_backend.repository;

import com.shopstack.shopstack_backend.constant.RoleName;
import com.shopstack.shopstack_backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByRoleName(RoleName roleName);

}