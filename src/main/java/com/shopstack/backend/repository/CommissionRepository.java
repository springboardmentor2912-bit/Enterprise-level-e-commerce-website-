package com.shopstack.backend.repository;

import com.shopstack.backend.entity.Commission;
import com.shopstack.backend.entity.Order;
import com.shopstack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommissionRepository
        extends JpaRepository<Commission, Long> {

    List<Commission> findByVendorOrderByCreatedAtDesc(User vendor);

    List<Commission> findByOrderId(Long orderId);

    List<Commission> findAllByOrderByCreatedAtDesc();

    Optional<Commission> findByOrderAndVendor(
            Order order,
            User vendor
    );

}