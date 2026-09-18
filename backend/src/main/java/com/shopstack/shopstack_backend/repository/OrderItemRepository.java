package com.shopstack.shopstack_backend.repository;

import com.shopstack.shopstack_backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}