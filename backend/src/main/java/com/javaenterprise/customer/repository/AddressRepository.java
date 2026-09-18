package com.javaenterprise.customer.repository;

import com.javaenterprise.customer.entity.Address;
import com.javaenterprise.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByUser(User user);

    Optional<Address> findByIdAndUser(Long id, User user);
    List<Address> findByUserAndDefaultAddressTrue(User user);
}