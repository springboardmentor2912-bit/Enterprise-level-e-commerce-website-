package com.shopstack.repository;

import com.shopstack.entity.Order;
import com.shopstack.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Order> findByWarehouseIdOrderByCreatedAtDesc(Long warehouseId);

    long countByStatus(OrderStatus status);

    List<Order> findAllByOrderByCreatedAtDesc();

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status != 'CANCELLED'")
    BigDecimal sumTotalSalesRevenue();

    @Query("SELECT SUM(o.discountAmount) FROM Order o WHERE o.status != 'CANCELLED'")
    BigDecimal sumTotalDiscounts();
}
