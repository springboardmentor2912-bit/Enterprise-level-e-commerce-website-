package com.infosys.auth.repository;

import com.infosys.auth.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByWarehouseIdOrderByCreatedAtDesc(Long warehouseId);

    List<Order> findByWarehouseIdAndStatusOrderByCreatedAtDesc(Long warehouseId, Order.OrderStatus status);

    List<Order> findByStatusOrderByCreatedAtDesc(Order.OrderStatus status);
}
