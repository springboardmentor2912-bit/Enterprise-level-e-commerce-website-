package com.javaenterprise.order.repository;

import com.javaenterprise.order.entity.Order;
import com.javaenterprise.order.entity.OrderItem;
import com.javaenterprise.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByProductVendor(User vendor);

    List<OrderItem> findByOrder(Order order);

    // ✅ FIX: Changed 'createdAt' to 'id' to guarantee it compiles perfectly
    @Query("""
    SELECT oi FROM OrderItem oi
    WHERE oi.product.vendor.email = :email
    ORDER BY oi.order.id DESC
    """)
    List<OrderItem> findVendorOrderItems(@Param("email") String email);

}