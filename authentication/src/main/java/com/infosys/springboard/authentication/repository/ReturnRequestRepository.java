package com.infosys.springboard.authentication.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infosys.springboard.authentication.entity.ReturnRequest;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {

    List<ReturnRequest> findByCustomerEmail(String customerEmail);

    List<ReturnRequest> findByStatus(String status);

    Optional<ReturnRequest> findByOrderIdAndProductIdAndCustomerEmail(
            Long orderId,
            Long productId,
            String customerEmail
    );

    List<ReturnRequest> findByOrderId(Long orderId);
}