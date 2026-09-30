package com.shopstack.backend.repository;

import com.shopstack.backend.model.StockTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockTransferRepository extends JpaRepository<StockTransfer, Long> {
    List<StockTransfer> findAllByOrderByIdDesc();
    List<StockTransfer> findBySourceWarehouseIdOrDestinationWarehouseIdOrderByIdDesc(Long sourceWarehouseId, Long destinationWarehouseId);
    Optional<StockTransfer> findByTransferNumber(String transferNumber);
}
