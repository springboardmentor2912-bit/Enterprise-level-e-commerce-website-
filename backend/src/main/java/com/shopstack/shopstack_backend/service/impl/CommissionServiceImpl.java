package com.shopstack.shopstack_backend.service.impl;

import com.shopstack.shopstack_backend.dto.response.CommissionResponse;
import com.shopstack.shopstack_backend.entity.Order;
import com.shopstack.shopstack_backend.entity.OrderItem;
import com.shopstack.shopstack_backend.entity.Product;
import com.shopstack.shopstack_backend.entity.Vendor;
import com.shopstack.shopstack_backend.repository.OrderRepository;
import com.shopstack.shopstack_backend.repository.ProductRepository;
import com.shopstack.shopstack_backend.repository.VendorRepository;
import com.shopstack.shopstack_backend.service.CommissionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class CommissionServiceImpl
        implements CommissionService {

    // Marketplace commission percentage
    private static final BigDecimal COMMISSION_RATE =
            new BigDecimal("0.10");

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final VendorRepository vendorRepository;

    public CommissionServiceImpl(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            VendorRepository vendorRepository) {

        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.vendorRepository = vendorRepository;
    }

    // =========================
    // GET COMMISSION REPORT
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<CommissionResponse> getCommissionReport() {

        List<Order> orders =
                orderRepository.findAll();

        Map<Long, BigDecimal> vendorSales =
                new HashMap<>();

        // =========================
        // PROCESS ORDERS
        // =========================

        for (Order order : orders) {

            // Cancelled, returned and refunded
            // orders are not counted as sales.
            if (order.getStatus() == null ||
                    order.getStatus().name().equals("CANCELLED") ||
                    order.getStatus().name().equals("RETURNED") ||
                    order.getStatus().name().equals("REFUNDED")) {

                continue;
            }

            if (order.getItems() == null ||
                    order.getItems().isEmpty()) {

                continue;
            }

            // =====================================================
            // CALCULATE ORIGINAL ORDER ITEM TOTAL
            // =====================================================

            BigDecimal originalOrderTotal =
                    BigDecimal.ZERO;

            for (OrderItem item : order.getItems()) {

                BigDecimal itemSubtotal =
                        BigDecimal.valueOf(
                                item.getSubtotal()
                        );

                originalOrderTotal =
                        originalOrderTotal.add(
                                itemSubtotal
                        );
            }

            if (originalOrderTotal.compareTo(
                    BigDecimal.ZERO) <= 0) {

                continue;
            }

            // =====================================================
            // DISCOUNT RATIO
            //
            // Example:
            // Original = 54000
            // Final    = 48600
            //
            // Ratio = 48600 / 54000 = 0.90
            //
            // Each item receives the same proportional discount.
            // =====================================================

            BigDecimal finalOrderTotal =
                    BigDecimal.valueOf(
                            order.getTotalAmount()
                    );

            BigDecimal discountRatio =
                    finalOrderTotal.divide(
                            originalOrderTotal,
                            10,
                            java.math.RoundingMode.HALF_UP
                    );

            // =========================
            // PROCESS ORDER ITEMS
            // =========================

            for (OrderItem item :
                    order.getItems()) {

                Product product =
                        productRepository
                                .findById(
                                        item.getProductId()
                                )
                                .orElse(null);

                if (product == null ||
                        product.getVendor() == null) {

                    continue;
                }

                Vendor vendor =
                        product.getVendor();

                BigDecimal originalItemSales =
                        BigDecimal.valueOf(
                                item.getSubtotal()
                        );

                // Apply order-level coupon/discount
                // proportionally to the item.
                BigDecimal actualItemSales =
                        originalItemSales.multiply(
                                discountRatio
                        );

                vendorSales.merge(
                        vendor.getId(),
                        actualItemSales,
                        BigDecimal::add
                );
            }
        }

        // =========================
        // BUILD RESPONSE
        // =========================

        List<CommissionResponse> response =
                new ArrayList<>();

        for (Map.Entry<Long, BigDecimal> entry :
                vendorSales.entrySet()) {

            Long vendorId =
                    entry.getKey();

            BigDecimal totalSales =
                    entry.getValue();

            Vendor vendor =
                    vendorRepository
                            .findById(vendorId)
                            .orElse(null);

            if (vendor == null) {
                continue;
            }

            BigDecimal commission =
                    totalSales.multiply(
                            COMMISSION_RATE
                    );

            BigDecimal vendorEarnings =
                    totalSales.subtract(
                            commission
                    );

            response.add(
                    new CommissionResponse(
                            vendor.getId(),
                            vendor.getBusinessName(),
                            totalSales,
                            commission,
                            vendorEarnings
                    )
            );
        }

        return response;
    }
}