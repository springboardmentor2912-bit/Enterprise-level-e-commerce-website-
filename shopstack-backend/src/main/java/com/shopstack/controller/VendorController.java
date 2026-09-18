package com.shopstack.controller;

import com.shopstack.dto.common.ApiResponse;
import com.shopstack.dto.product.ProductRequest;
import com.shopstack.dto.product.ProductResponse;
import com.shopstack.dto.vendor.*;
import com.shopstack.entity.Product;
import com.shopstack.entity.Vendor;
import com.shopstack.security.UserPrincipal;
import com.shopstack.service.InventoryService;
import com.shopstack.service.ProductService;
import com.shopstack.service.VendorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendor")
@RequiredArgsConstructor
@PreAuthorize("hasRole('VENDOR')")
public class VendorController {

    private final VendorService vendorService;
    private final ProductService productService;
    private final InventoryService inventoryService;
    private final com.shopstack.service.OrderService orderService;

    @GetMapping("/profile")
    public ApiResponse<VendorResponse> myProfile(@AuthenticationPrincipal UserPrincipal principal) {
        Vendor vendor = vendorService.getByUserId(principal.getId());
        return ApiResponse.ok(vendorService.toResponse(vendor));
    }

    @GetMapping("/analytics")
    public ApiResponse<VendorAnalyticsResponse> analytics(@AuthenticationPrincipal UserPrincipal principal) {
        Vendor vendor = vendorService.getByUserId(principal.getId());
        return ApiResponse.ok(vendorService.getAnalytics(vendor.getId()));
    }

    @GetMapping("/commission-summary")
    public ApiResponse<?> commissionSummary(@AuthenticationPrincipal UserPrincipal principal) {
        Vendor vendor = vendorService.getByUserId(principal.getId());
        return ApiResponse.ok(vendorService.getCommissionSummary(vendor.getId()));
    }

    @PostMapping("/products")
    public ApiResponse<ProductResponse> createProduct(@AuthenticationPrincipal UserPrincipal principal,
                                                        @Valid @RequestBody ProductRequest request) {
        Vendor vendor = vendorService.getByUserId(principal.getId());
        Product product = productService.createProduct(vendor, request);
        return ApiResponse.ok("Product submitted for approval", productService.toResponse(product));
    }

    @GetMapping("/products")
    public ApiResponse<Page<ProductResponse>> myProducts(@AuthenticationPrincipal UserPrincipal principal,
                                                           @RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "20") int size) {
        Vendor vendor = vendorService.getByUserId(principal.getId());
        Page<Product> products = productService.getVendorProducts(vendor.getId(), PageRequest.of(page, size));
        return ApiResponse.ok(products.map(productService::toResponse));
    }

    @PutMapping("/products/{productId}")
    public ApiResponse<ProductResponse> updateProduct(@AuthenticationPrincipal UserPrincipal principal,
                                                        @PathVariable Long productId,
                                                        @Valid @RequestBody ProductRequest request) {
        Vendor vendor = vendorService.getByUserId(principal.getId());
        Product product = productService.updateProduct(vendor.getId(), productId, request);
        return ApiResponse.ok("Product updated and resubmitted for approval", productService.toResponse(product));
    }

    @PatchMapping("/products/{productId}/price")
    public ApiResponse<ProductResponse> updatePrice(@AuthenticationPrincipal UserPrincipal principal,
                                                      @PathVariable Long productId,
                                                      @Valid @RequestBody PriceUpdateRequest request) {
        Vendor vendor = vendorService.getByUserId(principal.getId());
        Product product = productService.updatePrice(vendor.getId(), productId, request);
        return ApiResponse.ok("Price updated", productService.toResponse(product));
    }

    @DeleteMapping("/products/{productId}")
    public ApiResponse<Void> deactivateProduct(@AuthenticationPrincipal UserPrincipal principal,
                                                @PathVariable Long productId) {
        Vendor vendor = vendorService.getByUserId(principal.getId());
        productService.deactivateProduct(vendor.getId(), productId);
        return ApiResponse.ok("Product deactivated", null);
    }

    @PatchMapping("/products/{productId}/inventory")
    public ApiResponse<?> adjustInventory(@AuthenticationPrincipal UserPrincipal principal,
                                           @PathVariable Long productId,
                                           @Valid @RequestBody InventoryUpdateRequest request) {
        Vendor vendor = vendorService.getByUserId(principal.getId());
        productService.getOwnedProduct(vendor.getId(), productId); // ownership check
        return ApiResponse.ok("Inventory updated", inventoryService.adjustStock(productId, request, principal.getUsername()));
    }

    @GetMapping("/products/{productId}/inventory/history")
    public ApiResponse<?> inventoryHistory(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long productId) {
        Vendor vendor = vendorService.getByUserId(principal.getId());
        productService.getOwnedProduct(vendor.getId(), productId); // ownership check
        return ApiResponse.ok(inventoryService.getHistory(productId));
    }

    @GetMapping("/inventory/low-stock")
    public ApiResponse<?> lowStock(@AuthenticationPrincipal UserPrincipal principal) {
        Vendor vendor = vendorService.getByUserId(principal.getId());
        return ApiResponse.ok(inventoryService.getLowStockForVendor(vendor.getId()));
    }

    @GetMapping("/orders")
    public ApiResponse<?> vendorOrders(@AuthenticationPrincipal UserPrincipal principal,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size) {
        Vendor vendor = vendorService.getByUserId(principal.getId());
        return ApiResponse.ok(orderService.getVendorOrders(vendor.getId(), PageRequest.of(page, size)));
    }
}
