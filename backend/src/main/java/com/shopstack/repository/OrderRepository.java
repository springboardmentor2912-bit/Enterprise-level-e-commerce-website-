package com.shopstack.repository;

import com.shopstack.model.Order;
import com.shopstack.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Order> findByVendorProfileIdOrderByCreatedAtDesc(Long vendorProfileId);
    boolean existsByIdAndVendorProfileId(Long id, Long vendorProfileId);

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    List<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);

    long countByStatus(OrderStatus status);

    @Query("SELECT o FROM Order o WHERE " +
           "LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(o.customer.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(o.customer.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(o.vendorProfile.storeName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "ORDER BY o.createdAt DESC")
    List<Order> searchOrders(@Param("query") String query);
}
