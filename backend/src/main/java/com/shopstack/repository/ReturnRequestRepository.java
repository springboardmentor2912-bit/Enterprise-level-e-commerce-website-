package com.shopstack.repository;

import com.shopstack.model.ReturnRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
    List<ReturnRequest> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<ReturnRequest> findByWarehouseIdOrderByCreatedAtDesc(Long warehouseId);
    List<ReturnRequest> findByStatusOrderByCreatedAtDesc(String status);
    List<ReturnRequest> findAllByOrderByCreatedAtDesc();
    List<ReturnRequest> findByOrderId(Long orderId);
}
