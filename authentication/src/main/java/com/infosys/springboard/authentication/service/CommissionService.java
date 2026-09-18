package com.infosys.springboard.authentication.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.infosys.springboard.authentication.entity.Commission;
import com.infosys.springboard.authentication.repository.CommissionRepository;

@Service
public class CommissionService {

    private static final BigDecimal DEFAULT_COMMISSION_RATE =
            BigDecimal.valueOf(10);

    private final CommissionRepository commissionRepository;

    public CommissionService(
            CommissionRepository commissionRepository) {

        this.commissionRepository = commissionRepository;
    }

    public Commission calculateCommission(
            Long orderId,
            Long productId,
            String vendorEmail,
            BigDecimal orderAmount) {

        if (orderAmount == null
                || orderAmount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Order amount must be greater than zero");
        }

        if (vendorEmail == null
                || vendorEmail.trim().isEmpty()) {

            throw new RuntimeException(
                    "Vendor email is required");
        }

        BigDecimal commissionRate =
                DEFAULT_COMMISSION_RATE;

        BigDecimal commissionAmount =
                orderAmount
                        .multiply(commissionRate)
                        .divide(
                                BigDecimal.valueOf(100),
                                2,
                                RoundingMode.HALF_UP
                        );

        BigDecimal vendorAmount =
                orderAmount.subtract(commissionAmount)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        Commission commission = Commission.builder()
                .orderId(orderId)
                .productId(productId)
                .vendorEmail(vendorEmail)
                .orderAmount(orderAmount)
                .commissionRate(commissionRate)
                .commissionAmount(commissionAmount)
                .vendorAmount(vendorAmount)
                .createdAt(LocalDateTime.now())
                .build();

        return commissionRepository.save(commission);
    }

    public List<Commission> getAllCommissions() {

        return commissionRepository.findAll();
    }

    public List<Commission> getVendorCommissions(
            String vendorEmail) {

        return commissionRepository
                .findByVendorEmail(vendorEmail);
    }

    public List<Commission> getOrderCommissions(
            Long orderId) {

        return commissionRepository
                .findByOrderId(orderId);
    }
}