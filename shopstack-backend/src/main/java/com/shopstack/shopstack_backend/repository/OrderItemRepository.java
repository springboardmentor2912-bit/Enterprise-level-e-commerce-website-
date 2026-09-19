package com.shopstack.shopstack_backend.repository;

import com.shopstack.shopstack_backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderItemRepository
        extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);
    
    @Query("""
    SELECT COALESCE(SUM(oi.price * oi.quantity), 0)
    FROM OrderItem oi
""")
double getTotalSales();
}