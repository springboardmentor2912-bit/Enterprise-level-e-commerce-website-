package com.shopstack.repository;

import com.shopstack.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByVendorIdOrderByOrderCreatedAtDesc(Long vendorId);

    @Query("SELECT SUM(oi.priceAtPurchase * oi.quantity) FROM OrderItem oi WHERE oi.order.status != 'CANCELLED'")
    BigDecimal sumTotalGrossVolume();

    @Query("SELECT SUM(COALESCE(oi.commissionAmount, (oi.priceAtPurchase * oi.quantity * COALESCE(oi.commissionRate, oi.vendor.commissionRate, 10.00) / 100.0))) FROM OrderItem oi WHERE oi.order.status != 'CANCELLED'")
    BigDecimal sumTotalPlatformCommission();

    @Query("SELECT SUM(COALESCE(oi.vendorEarning, (oi.priceAtPurchase * oi.quantity - COALESCE(oi.commissionAmount, (oi.priceAtPurchase * oi.quantity * COALESCE(oi.commissionRate, oi.vendor.commissionRate, 10.00) / 100.0))))) FROM OrderItem oi WHERE oi.order.status != 'CANCELLED'")
    BigDecimal sumTotalVendorEarnings();

    @Query("SELECT SUM(oi.priceAtPurchase * oi.quantity) FROM OrderItem oi WHERE oi.vendor.id = :vendorId AND oi.order.status != 'CANCELLED'")
    BigDecimal sumGrossSalesByVendorId(@Param("vendorId") Long vendorId);

    @Query("SELECT SUM(COALESCE(oi.commissionAmount, (oi.priceAtPurchase * oi.quantity * COALESCE(oi.commissionRate, oi.vendor.commissionRate, 10.00) / 100.0))) FROM OrderItem oi WHERE oi.vendor.id = :vendorId AND oi.order.status != 'CANCELLED'")
    BigDecimal sumCommissionByVendorId(@Param("vendorId") Long vendorId);

    @Query("SELECT SUM(COALESCE(oi.vendorEarning, (oi.priceAtPurchase * oi.quantity - COALESCE(oi.commissionAmount, (oi.priceAtPurchase * oi.quantity * COALESCE(oi.commissionRate, oi.vendor.commissionRate, 10.00) / 100.0))))) FROM OrderItem oi WHERE oi.vendor.id = :vendorId AND oi.order.status != 'CANCELLED'")
    BigDecimal sumVendorEarningsByVendorId(@Param("vendorId") Long vendorId);

    @Query("SELECT COUNT(DISTINCT oi.order.id) FROM OrderItem oi WHERE oi.vendor.id = :vendorId AND oi.order.status != 'CANCELLED'")
    long countOrdersByVendorId(@Param("vendorId") Long vendorId);

    @Query("SELECT oi.product.id, oi.product.name, oi.product.category.name, oi.product.vendor.businessName, SUM(oi.quantity), SUM(oi.priceAtPurchase * oi.quantity) " +
           "FROM OrderItem oi WHERE oi.order.status != 'CANCELLED' " +
           "GROUP BY oi.product.id, oi.product.name, oi.product.category.name, oi.product.vendor.businessName " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingProducts();

    @Query("SELECT oi.product.category.name, SUM(oi.priceAtPurchase * oi.quantity) " +
           "FROM OrderItem oi WHERE oi.order.status != 'CANCELLED' " +
           "GROUP BY oi.product.category.name")
    List<Object[]> findSalesRevenueByCategory();
}
