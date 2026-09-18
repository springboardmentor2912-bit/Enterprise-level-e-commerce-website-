package com.shopstack.service;

import com.shopstack.entity.Order;
import com.shopstack.entity.OrderItem;
import com.shopstack.enums.OrderStatus;
import com.shopstack.repository.InventoryRepository;
import com.shopstack.repository.OrderRepository;
import com.shopstack.repository.ProductRepository;
import com.shopstack.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Generates simple CSV exports for the admin dashboard (Sales, Inventory,
 * Vendor, Order reports). CSV rather than a formatted PDF/XLSX — it opens
 * cleanly in Excel/Sheets and needs no extra document-generation library,
 * while still satisfying "Reports & Export" for Milestone 4.
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final VendorRepository vendorRepository;

    public String generateSalesReportCsv() {
        StringBuilder csv = new StringBuilder("Order Number,Date,Customer Email,Status,Subtotal,Discount,Total\n");
        for (Order o : orderRepository.findAll()) {
            csv.append(csvEscape(o.getOrderNumber())).append(",")
               .append(o.getCreatedAt()).append(",")
               .append(csvEscape(o.getUser().getEmail())).append(",")
               .append(o.getStatus()).append(",")
               .append(o.getSubtotal()).append(",")
               .append(o.getDiscountAmount()).append(",")
               .append(o.getTotalAmount()).append("\n");
        }
        return csv.toString();
    }

    public String generateOrderReportCsv() {
        StringBuilder csv = new StringBuilder("Order Number,Product,Vendor,Quantity,Price,Line Total\n");
        for (Order o : orderRepository.findAll()) {
            for (OrderItem item : o.getItems()) {
                BigDecimal lineTotal = item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity()));
                csv.append(csvEscape(o.getOrderNumber())).append(",")
                   .append(csvEscape(item.getProductNameSnapshot())).append(",")
                   .append(csvEscape(item.getVendor().getBusinessName())).append(",")
                   .append(item.getQuantity()).append(",")
                   .append(item.getPriceAtPurchase()).append(",")
                   .append(lineTotal).append("\n");
            }
        }
        return csv.toString();
    }

    public String generateInventoryReportCsv() {
        StringBuilder csv = new StringBuilder("Product,Vendor,Stock Quantity,Reserved,Available,Low Stock Threshold,Low Stock?\n");
        for (var inv : inventoryRepository.findAll()) {
            csv.append(csvEscape(inv.getProduct().getName())).append(",")
               .append(csvEscape(inv.getProduct().getVendor().getBusinessName())).append(",")
               .append(inv.getStockQuantity()).append(",")
               .append(inv.getReservedQuantity()).append(",")
               .append(inv.getAvailableQuantity()).append(",")
               .append(inv.getLowStockThreshold()).append(",")
               .append(inv.isLowStock() ? "YES" : "NO").append("\n");
        }
        return csv.toString();
    }

    public String generateVendorReportCsv() {
        StringBuilder csv = new StringBuilder("Business Name,Owner Email,Approval Status,Commission Rate %,Product Count\n");
        for (var vendor : vendorRepository.findAll()) {
            long productCount = productRepository.findByVendorId(vendor.getId(),
                    org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
            csv.append(csvEscape(vendor.getBusinessName())).append(",")
               .append(csvEscape(vendor.getUser().getEmail())).append(",")
               .append(vendor.getApprovalStatus()).append(",")
               .append(vendor.getCommissionRate()).append(",")
               .append(productCount).append("\n");
        }
        return csv.toString();
    }

    public String generateFinancialReportCsv() {
        StringBuilder csv = new StringBuilder("Vendor,Gross Revenue,Commission Rate %,Commission Earned,Vendor Net Earnings\n");
        for (var vendor : vendorRepository.findAll()) {
            List<OrderItem> items = orderRepository.findAll().stream()
                    .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                    .flatMap(o -> o.getItems().stream())
                    .filter(i -> i.getVendor().getId().equals(vendor.getId()))
                    .toList();
            BigDecimal gross = items.stream()
                    .map(i -> i.getPriceAtPurchase().multiply(BigDecimal.valueOf(i.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal commission = gross.multiply(vendor.getCommissionRate()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            csv.append(csvEscape(vendor.getBusinessName())).append(",")
               .append(gross).append(",")
               .append(vendor.getCommissionRate()).append(",")
               .append(commission).append(",")
               .append(gross.subtract(commission)).append("\n");
        }
        return csv.toString();
    }

    private String csvEscape(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
