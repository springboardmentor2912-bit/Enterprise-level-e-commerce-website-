package com.shopstack.repository;

import com.shopstack.entity.ReturnRequest;
import com.shopstack.enums.ReturnStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
    Optional<ReturnRequest> findByOrderId(Long orderId);
    List<ReturnRequest> findByOrderUserIdOrderByRequestedAtDesc(Long userId);
    Page<ReturnRequest> findByStatus(ReturnStatus status, Pageable pageable);
}
