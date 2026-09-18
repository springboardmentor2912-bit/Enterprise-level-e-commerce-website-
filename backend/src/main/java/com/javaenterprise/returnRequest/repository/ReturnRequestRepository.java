package com.javaenterprise.returnRequest.repository;

import com.javaenterprise.returnRequest.entity.ReturnRequest;
import com.javaenterprise.returnRequest.entity.ReturnStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {

    // Get all returns for a specific customer
    List<ReturnRequest> findByUserId(Long userId);

    // Get all returns for Admin dashboard (sorted by newest first)
    List<ReturnRequest> findAllByOrderByCreatedAtDesc();

    // Prevent duplicate returns: Check if an item already has a return request
    Optional<ReturnRequest> findByOrderItemId(Long orderItemId);

    // Optional: Get returns by status (e.g., all pending approvals)
    List<ReturnRequest> findByStatus(ReturnStatus status);
}