package com.shopstack.shopstack_backend.repository;

import com.shopstack.shopstack_backend.entity.User;
import com.shopstack.shopstack_backend.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VendorRepository extends JpaRepository<Vendor, Long> {

    Optional<Vendor> findByUser(User user);

    boolean existsByBusinessEmail(String businessEmail);

    boolean existsByGstNumber(String gstNumber);
}