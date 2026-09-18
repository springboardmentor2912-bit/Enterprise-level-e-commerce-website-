package com.infosys.auth.repository;

import com.infosys.auth.model.ReturnRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {

    List<ReturnRequest> findAllByOrderByCreatedAtDesc();

    List<ReturnRequest> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<ReturnRequest> findByWarehouseIdOrderByCreatedAtDesc(Long warehouseId);

    Optional<ReturnRequest> findByOrderId(Long orderId);

    List<ReturnRequest> findByStatusOrderByCreatedAtDesc(ReturnRequest.ReturnStatus status);
}
