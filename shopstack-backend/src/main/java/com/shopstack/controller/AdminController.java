package com.shopstack.controller;

import com.shopstack.dto.common.ApiResponse;
import com.shopstack.dto.product.ProductResponse;
import com.shopstack.dto.vendor.VendorResponse;
import com.shopstack.entity.Vendor;
import com.shopstack.enums.OrderStatus;
import com.shopstack.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final VendorService vendorService;
    private final ProductService productService;
    private final OrderService orderService;
    private final ReturnService returnService;
    private final AnalyticsService analyticsService;
    private final ReportService reportService;

    // --- Vendor approval workflow ---

    @GetMapping("/vendors/pending")
    public ApiResponse<?> pendingVendors(@RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(vendorService.getPendingVendors(PageRequest.of(page, size))
                .map(vendorService::toResponse));
    }

    @PostMapping("/vendors/{vendorId}/approve")
    public ApiResponse<VendorResponse> approveVendor(@PathVariable Long vendorId) {
        Vendor vendor = vendorService.approveVendor(vendorId);
        return ApiResponse.ok("Vendor approved", vendorService.toResponse(vendor));
    }

    @PostMapping("/vendors/{vendorId}/reject")
    public ApiResponse<VendorResponse> rejectVendor(@PathVariable Long vendorId) {
        Vendor vendor = vendorService.rejectVendor(vendorId);
        return ApiResponse.ok("Vendor rejected", vendorService.toResponse(vendor));
    }

    @PatchMapping("/vendors/{vendorId}/commission")
    public ApiResponse<VendorResponse> updateCommission(@PathVariable Long vendorId, @RequestParam BigDecimal rate) {
        Vendor vendor = vendorService.updateCommissionRate(vendorId, rate);
        return ApiResponse.ok("Commission rate updated", vendorService.toResponse(vendor));
    }

    // --- Product approval workflow ---

    @GetMapping("/products/pending")
    public ApiResponse<?> pendingProducts(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(productService.getPendingProducts(PageRequest.of(page, size)).map(productService::toResponse));
    }

    @PostMapping("/products/{productId}/approve")
    public ApiResponse<ProductResponse> approveProduct(@PathVariable Long productId) {
        return ApiResponse.ok("Product approved", productService.toResponse(productService.approveProduct(productId)));
    }

    @PostMapping("/products/{productId}/reject")
    public ApiResponse<ProductResponse> rejectProduct(@PathVariable Long productId) {
        return ApiResponse.ok("Product rejected", productService.toResponse(productService.rejectProduct(productId)));
    }

    // --- Order monitoring ---

    @PatchMapping("/orders/{orderId}/status")
    public ApiResponse<?> updateOrderStatus(@PathVariable Long orderId, @RequestParam OrderStatus status) {
        return ApiResponse.ok("Order status updated", orderService.updateOrderStatus(orderId, status));
    }

    // --- Return / refund workflow (Milestone 3) ---

    @GetMapping("/returns/pending")
    public ApiResponse<?> pendingReturns(@RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(returnService.getPending(PageRequest.of(page, size)).map(returnService::toResponse));
    }

    @PostMapping("/returns/{returnId}/approve")
    public ApiResponse<?> approveReturn(@PathVariable Long returnId, @RequestParam(required = false) String notes) {
        return ApiResponse.ok("Return approved and refund issued", returnService.toResponse(returnService.approve(returnId, notes)));
    }

    @PostMapping("/returns/{returnId}/reject")
    public ApiResponse<?> rejectReturn(@PathVariable Long returnId, @RequestParam(required = false) String notes) {
        return ApiResponse.ok("Return rejected", returnService.toResponse(returnService.reject(returnId, notes)));
    }

    // --- Marketplace analytics (Milestone 4) ---

    @GetMapping("/analytics")
    public ApiResponse<?> marketplaceAnalytics() {
        return ApiResponse.ok(analyticsService.getMarketplaceAnalytics());
    }

    // --- Reports & export (Milestone 4) ---

    @GetMapping("/reports/sales.csv")
    public ResponseEntity<String> salesReport() {
        return csvResponse(reportService.generateSalesReportCsv(), "sales-report.csv");
    }

    @GetMapping("/reports/orders.csv")
    public ResponseEntity<String> orderReport() {
        return csvResponse(reportService.generateOrderReportCsv(), "order-report.csv");
    }

    @GetMapping("/reports/inventory.csv")
    public ResponseEntity<String> inventoryReport() {
        return csvResponse(reportService.generateInventoryReportCsv(), "inventory-report.csv");
    }

    @GetMapping("/reports/vendors.csv")
    public ResponseEntity<String> vendorReport() {
        return csvResponse(reportService.generateVendorReportCsv(), "vendor-report.csv");
    }

    @GetMapping("/reports/financial.csv")
    public ResponseEntity<String> financialReport() {
        return csvResponse(reportService.generateFinancialReportCsv(), "financial-report.csv");
    }

    private ResponseEntity<String> csvResponse(String csv, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv")
                .body(csv);
    }
}
