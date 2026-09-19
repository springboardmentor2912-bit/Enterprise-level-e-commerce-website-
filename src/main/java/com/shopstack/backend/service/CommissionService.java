package com.shopstack.backend.service;

import com.shopstack.backend.dto.CommissionResponse;
import com.shopstack.backend.entity.Commission;
import com.shopstack.backend.entity.Order;
import com.shopstack.backend.entity.OrderItem;
import com.shopstack.backend.entity.Product;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.entity.CommissionStatus;

import com.shopstack.backend.entity.OrderStatus;
import com.shopstack.backend.repository.CommissionRepository;
import com.shopstack.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CommissionService {

    private final CommissionRepository commissionRepository;
    private final OrderRepository orderRepository;

    @Value("${shopstack.commission.rate:10}")
    private Double commissionRate;


    public CommissionService(
            CommissionRepository commissionRepository,
            OrderRepository orderRepository
    ) {
        this.commissionRepository = commissionRepository;
        this.orderRepository = orderRepository;
    }


    /*
     * Calculate commission for an order
     */
    public List<CommissionResponse> calculateCommission(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));


        /*
         * Commission should be calculated only after
         * the order is confirmed.
         */
        if (order.getStatus() != OrderStatus.CONFIRMED) {

            throw new RuntimeException(
                    "Commission can be calculated only for confirmed orders"
            );
        }


        /*
         * Group order items by vendor.
         *
         * Example:
         *
         * Vendor A → Product 1 ₹4000
         *            Product 2 ₹2000
         *
         * Vendor B → Product 3 ₹4000
         */
        Map<User, List<OrderItem>> itemsByVendor =
                order.getItems()
                        .stream()
                        .filter(item ->
                                item.getProduct() != null &&
                                        item.getProduct().getVendor() != null
                        )
                        .collect(
                                Collectors.groupingBy(
                                        item -> item
                                                .getProduct()
                                                .getVendor()
                                )
                        );


        List<CommissionResponse> responses =
                new ArrayList<>();


        /*
         * Calculate commission separately for every vendor.
         */
        for (Map.Entry<User, List<OrderItem>> entry
                : itemsByVendor.entrySet()) {

            User vendor = entry.getKey();

            List<OrderItem> vendorItems =
                    entry.getValue();


            /*
             * Calculate total sales for this vendor.
             *
             * quantity × price
             */
            double saleAmount =
                    vendorItems
                            .stream()
                            .mapToDouble(item ->
                                    item.getPrice()
                                            * item.getQuantity()
                            )
                            .sum();


            /*
             * Platform commission
             *
             * saleAmount × commissionRate / 100
             */
            double commissionAmount =
                    saleAmount
                            * commissionRate
                            / 100.0;


            /*
             * Amount remaining for vendor
             */
            double vendorAmount =
                    saleAmount - commissionAmount;


            /*
             * Check whether a commission record
             * already exists.
             */
            Commission commission =
                    commissionRepository
                            .findByOrderAndVendor(
                                    order,
                                    vendor
                            )
                            .orElseGet(
                                    Commission::new
                            );


            /*
             * Store commission information.
             */
            commission.setOrder(order);
            commission.setVendor(vendor);
            commission.setSaleAmount(saleAmount);
            commission.setCommissionRate(commissionRate);
            commission.setCommissionAmount(
                    commissionAmount
            );
            commission.setVendorAmount(
                    vendorAmount
            );
            commission.setStatus(
                    CommissionStatus.CALCULATED
            );
            LocalDateTime now = LocalDateTime.now();

            commission.setCreatedAt(now);
            commission.setCommissionDate(now);

            Commission saved =
                    commissionRepository.save(
                            commission
                    );


            /*
             * Convert entity to response DTO.
             */
            responses.add(
                    convertToResponse(saved)
            );
        }


        return responses;
    }


    /*
     * Get all commission records.
     */
    public List<CommissionResponse> getAllCommissions() {

        return commissionRepository
                .findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    /*
     * Get commission records for a specific vendor.
     */
    public List<CommissionResponse> getVendorCommissions(
            Long vendorId
    ) {

        List<Commission> commissions =
                commissionRepository
                        .findAll()
                        .stream()
                        .filter(commission ->
                                commission
                                        .getVendor()
                                        .getId()
                                        .equals(vendorId)
                        )
                        .toList();


        return commissions
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    /*
     * Mark a commission as paid to the vendor.
     */
    public CommissionResponse markAsPaid(Long commissionId) {

        Commission commission =
                commissionRepository.findById(commissionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Commission not found"
                                )
                        );


        if (commission.getStatus()
                == CommissionStatus.PAID) {

            throw new RuntimeException(
                    "Commission is already marked as paid"
            );
        }


        if (commission.getStatus()
                == CommissionStatus.CANCELLED) {

            throw new RuntimeException(
                    "Cancelled commission cannot be marked as paid"
            );
        }


        commission.setStatus(
                CommissionStatus.PAID
        );


        Commission saved =
                commissionRepository.save(
                        commission
                );


        return convertToResponse(saved);
    }


    /*
     * Convert Commission entity to DTO.
     */
    private CommissionResponse convertToResponse(
            Commission commission
    ) {

        return new CommissionResponse(
                commission.getId(),
                commission.getOrder().getId(),
                commission.getVendor().getId(),
                commission.getVendor().getName(),
                commission.getSaleAmount(),
                commission.getCommissionRate(),
                commission.getCommissionAmount(),
                commission.getVendorAmount(),
                commission.getStatus().name(),
                commission.getCreatedAt()
        );
    }
}