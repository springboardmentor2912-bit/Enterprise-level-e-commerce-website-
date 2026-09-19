package com.shopstack.backend.repository;

import com.shopstack.backend.entity.Order;
import com.shopstack.backend.entity.Product;
import com.shopstack.backend.entity.ReturnRequest;
import com.shopstack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {

    List<ReturnRequest> findByCustomerOrderByRequestedAtDesc(User customer);

    List<ReturnRequest> findAllByOrderByRequestedAtDesc();

    List<ReturnRequest> findByOrderOrderByRequestedAtDesc(Order order);

    Optional<ReturnRequest> findByOrderAndProduct(Order order, Product product);

    boolean existsByOrderAndProduct(Order order, Product product);
}
