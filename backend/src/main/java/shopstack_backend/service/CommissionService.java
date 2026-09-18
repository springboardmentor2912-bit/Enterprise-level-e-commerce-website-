package shopstack_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import shopstack_backend.dto.CommissionDTO;
import shopstack_backend.dto.CommissionResponseDTO;
import shopstack_backend.entity.*;
import shopstack_backend.repository.CommissionRepository;
import shopstack_backend.repository.OrderRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CommissionService {
    private static final double COMMISSION_RATE = 10.0;

    @Autowired
    private CommissionRepository commissionRepository;

    @Autowired
    private OrderRepository orderRepository;

    public double getDefaultCommissionRate() {
        return COMMISSION_RATE;
    }

    public double resolveRateForVendor(Vendor vendor) {
        return COMMISSION_RATE;
    }

    /**
     * Automatically backfills commissions for historical orders that were placed 
     * before the commission system was implemented.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void backfillCommissionsForPastOrders() {
        List<Order> allOrders = orderRepository.findAll();
        for (Order order : allOrders) {
            // Check if this order already has commission records
            List<Commission> existing = commissionRepository.findByOrder_Id(order.getId());
            if (existing == null || existing.isEmpty()) {
                syncCommissionsForOrder(order);
            }
        }
    }

    @Transactional
    public void syncCommissionsForOrder(Order order) {
        if (order == null || order.getId() == null || order.getItems() == null) {
            return;
        }
        Map<Long, Vendor> vendorsById = new LinkedHashMap<>();
        Map<Long, BigDecimal> salesByVendorId = new LinkedHashMap<>();
        for (OrderItem item : order.getItems()) {
            // Cancelled, returned, and refunded items no longer represent
            // real revenue — excluding only CANCELLED here would leave a
            // vendor's commission (and the platform's cut) permanently
            // overstated for every item a customer successfully returns.
            if (item.getStatus() == OrderStatus.CANCELLED
                    || item.getStatus() == OrderStatus.RETURNED
                    || item.getStatus() == OrderStatus.REFUNDED) {
                continue;
            }
            Product product = item.getProduct();
            if (product == null || product.getVendor() == null) {
                continue; // orphaned/deleted product — nothing to attribute commission to
            }
            Vendor vendor = product.getVendor();
            BigDecimal lineTotal = item.getLineTotal() != null ? item.getLineTotal() : BigDecimal.ZERO;
            vendorsById.put(vendor.getId(), vendor);
            salesByVendorId.merge(vendor.getId(), lineTotal, BigDecimal::add);
        }
        List<Commission> existing = commissionRepository.findByOrder_Id(order.getId());
        Map<Long, Commission> existingByVendorId = existing.stream()
                .collect(Collectors.toMap(c -> c.getVendor().getId(), c -> c));

        // Upsert a commission record for every vendor still represented in the order
        for (Map.Entry<Long, BigDecimal> entry : salesByVendorId.entrySet()) {
            Long vendorId = entry.getKey();
            Vendor vendor = vendorsById.get(vendorId);
            BigDecimal saleAmount = entry.getValue().setScale(2, RoundingMode.HALF_UP);
            Commission commission = existingByVendorId.remove(vendorId);
            double rate = COMMISSION_RATE;
            BigDecimal commissionAmount = saleAmount
                    .multiply(BigDecimal.valueOf(rate))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal vendorAmount = saleAmount.subtract(commissionAmount);
            if (commission == null) {
                commission = new Commission();
                commission.setOrder(order);
                commission.setVendor(vendor);
            }
            commission.setSaleAmount(saleAmount);
            commission.setCommissionRate(rate);
            commission.setCommissionAmount(commissionAmount);
            commission.setVendorAmount(vendorAmount);
            if (commission.getStatus() == null || commission.getStatus() == CommissionStatus.CANCELLED) {
                commission.setStatus(CommissionStatus.CONFIRMED);
            }
            commissionRepository.save(commission);
        }

        // Anything left in existingByVendorId belonged to a vendor whose
        // items were all cancelled, returned, or refunded since the last
        // sync — void it out.
        BigDecimal zero = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        for (Commission leftover : existingByVendorId.values()) {
            leftover.setSaleAmount(zero);
            leftover.setCommissionAmount(zero);
            leftover.setVendorAmount(zero);
            leftover.setStatus(CommissionStatus.CANCELLED);
            commissionRepository.save(leftover);
        }
    }

    @Transactional(readOnly = true)
    public List<CommissionResponseDTO> getAllCommissionRecords() {
        return commissionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CommissionResponseDTO> getCommissionRecordsForVendor(Long vendorId) {
        return commissionRepository.findByVendor_IdOrderByCreatedAtDesc(vendorId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CommissionDTO> getVendorCommissionSummary() {
        List<Commission> active = commissionRepository.findAll().stream()
                .filter(c -> c.getStatus() != CommissionStatus.CANCELLED)
                .collect(Collectors.toList());

        Map<Long, List<Commission>> byVendor = active.stream()
                .collect(Collectors.groupingBy(c -> c.getVendor().getId()));

        List<CommissionDTO> result = new ArrayList<>();
        for (List<Commission> vendorCommissions : byVendor.values()) {
            Vendor vendor = vendorCommissions.get(0).getVendor();

            BigDecimal totalSales = vendorCommissions.stream()
                    .map(Commission::getSaleAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalCommission = vendorCommissions.stream()
                    .map(Commission::getCommissionAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            result.add(new CommissionDTO(
                    vendor.getId(),
                    vendor.getName(),
                    totalSales,
                    resolveRateForVendor(vendor),
                    totalCommission
            ));
        }
        return result;
    }

    @Transactional
    public CommissionResponseDTO updateCommissionStatus(Long commissionId, CommissionStatus newStatus) {
        Commission commission = commissionRepository.findById(commissionId)
                .orElseThrow(() -> new IllegalArgumentException("Commission record not found: " + commissionId));
        commission.setStatus(newStatus);
        return toDto(commissionRepository.save(commission));
    }

    private CommissionResponseDTO toDto(Commission c) {
        CommissionResponseDTO dto = new CommissionResponseDTO();
        dto.setId(c.getId());
        dto.setOrderId(c.getOrder().getId());
        dto.setVendorId(c.getVendor().getId());
        dto.setVendorName(c.getVendor().getName());
        dto.setSaleAmount(c.getSaleAmount());
        dto.setCommissionRate(c.getCommissionRate());
        dto.setCommissionAmount(c.getCommissionAmount());
        dto.setVendorAmount(c.getVendorAmount());
        dto.setStatus(c.getStatus().name());
        dto.setCreatedAt(c.getCreatedAt());
        return dto;
    }
}