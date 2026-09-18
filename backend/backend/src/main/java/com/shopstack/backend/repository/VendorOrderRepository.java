package com.shopstack.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.shopstack.backend.entity.User;
import com.shopstack.backend.entity.VendorOrder;

public interface VendorOrderRepository extends JpaRepository<VendorOrder, Long> {
    List<VendorOrder> findByVendorOrderByPlacedAtDesc(User vendor);
    List<VendorOrder> findByVendor_IdOrderByPlacedAtDesc(Long vendorId);
    long countByVendorAndStatus(User vendor, String status);
    List<VendorOrder> findByCustomerEmailOrderByPlacedAtDesc(String customerEmail);
    long countByCustomerEmailAndCustomerNotificationReadFalse(String customerEmail);
    List<VendorOrder> findByCustomerEmailAndCustomerNotificationReadFalse(String customerEmail);
    List<VendorOrder> findByCustomerEmailAndOrderReference(String customerEmail, String orderReference);
    void deleteByCustomerEmailAndOrderReference(String customerEmail, String orderReference);
    List<VendorOrder> findByOrderStatus(String orderStatus);
    List<VendorOrder> findByOrderReference(String orderReference);
    List<VendorOrder> findAllByOrderByPlacedAtDesc();

    @Query("select coalesce(sum((case when o.customerTotalAmount > 0 or o.totalAmount = 0 then o.customerTotalAmount else o.totalAmount end) - o.commissionAmount), 0) from VendorOrder o where o.vendor = :vendor and o.orderStatus = 'DELIVERED'")
    double sumDeliveredRevenue(@Param("vendor") User vendor);

    @Query("select coalesce(sum(o.quantity), 0) from VendorOrder o where o.vendor = :vendor and o.orderStatus = 'DELIVERED'")
    long sumDeliveredItems(@Param("vendor") User vendor);

    long countByOrderStatus(String orderStatus);

    @Query("select coalesce(sum(o.totalAmount), 0) from VendorOrder o where o.orderStatus = :status")
    double sumTotalAmountByOrderStatus(@Param("status") String status);

    @Query("select coalesce(sum(o.commissionAmount), 0) from VendorOrder o where o.orderStatus not in ('REFUNDED', 'CANCELLED')")
    double sumCommissionRevenue();
}
