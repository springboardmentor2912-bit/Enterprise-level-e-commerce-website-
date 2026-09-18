package com.shopstack.backend.repository;

import com.shopstack.backend.model.InboundShipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InboundShipmentRepository extends JpaRepository<InboundShipment, Long> {
    List<InboundShipment> findByVendorIdOrderByIdDesc(Long vendorId);
    List<InboundShipment> findByWarehouseIdOrderByIdDesc(Long warehouseId);
    List<InboundShipment> findAllByOrderByIdDesc();
    Optional<InboundShipment> findByShipmentNumber(String shipmentNumber);
    Optional<InboundShipment> findByGrnNumber(String grnNumber);
}
