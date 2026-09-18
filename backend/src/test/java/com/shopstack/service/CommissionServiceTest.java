package com.shopstack.service;

import com.shopstack.dto.AdminCommissionSummary;
import com.shopstack.dto.CommissionCalculationRequest;
import com.shopstack.dto.CommissionCalculationResponse;
import com.shopstack.dto.CommissionResponse;
import com.shopstack.model.*;
import com.shopstack.repository.CommissionRepository;
import com.shopstack.repository.OrderRepository;
import com.shopstack.repository.UserRepository;
import com.shopstack.repository.VendorProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
    "razorpay.key_id=rzp_test_mockkey123456",
    "razorpay.key_secret=mocksecretkey1234567890123456789"
})
@Transactional
class CommissionServiceTest {

    @Autowired
    private CommissionService commissionService;

    @Autowired
    private CommissionRepository commissionRepository;

    @Autowired
    private VendorProfileRepository vendorProfileRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    private VendorProfile sampleVendor;
    private Order sampleOrder;

    @BeforeEach
    void setUp() {
        sampleVendor = vendorProfileRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No vendor profile found in test database"));

        sampleOrder = orderRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No order found in test database"));
    }

    @Test
    @DisplayName("Case 1: Order Amount ₹10,000 @ 10% Commission -> Platform ₹1,000, Vendor ₹9,000")
    void testCase1_TenThousandWithTenPercent() {
        double orderAmount = 10000.0;
        double commissionRate = 10.0;

        CommissionCalculationResponse response = commissionService.calculateCommission(orderAmount, commissionRate);

        assertNotNull(response);
        assertEquals(10000.0, response.getOrderAmount(), 0.001);
        assertEquals(10.0, response.getCommissionRate(), 0.001);
        assertEquals(1000.0, response.getCommissionAmount(), 0.001, "Platform commission must be ₹1,000.00");
        assertEquals(9000.0, response.getVendorAmount(), 0.001, "Vendor amount must be ₹9,000.00");
        assertTrue(response.getFormulaExplanation().contains("₹1000.00"));
        assertTrue(response.getFormulaExplanation().contains("₹9000.00"));
    }

    @Test
    @DisplayName("Case 2: Order Amount ₹5,000 @ 5% Commission -> Platform ₹250, Vendor ₹4,750")
    void testCase2_FiveThousandWithFivePercent() {
        double orderAmount = 5000.0;
        double commissionRate = 5.0;

        CommissionCalculationResponse response = commissionService.calculateCommission(orderAmount, commissionRate);

        assertNotNull(response);
        assertEquals(5000.0, response.getOrderAmount(), 0.001);
        assertEquals(5.0, response.getCommissionRate(), 0.001);
        assertEquals(250.0, response.getCommissionAmount(), 0.001, "Platform commission must be ₹250.00");
        assertEquals(4750.0, response.getVendorAmount(), 0.001, "Vendor amount must be ₹4,750.00");
    }

    @Test
    @DisplayName("Case 3: Decimal rate and fractional amounts (₹249.99 @ 8.5% -> ₹21.25 cut, ₹228.74 net)")
    void testDecimalRateAndRounding() {
        double orderAmount = 249.99;
        double commissionRate = 8.5;

        CommissionCalculationResponse response = commissionService.calculateCommission(orderAmount, commissionRate);

        assertNotNull(response);
        assertEquals(249.99, response.getOrderAmount(), 0.001);
        assertEquals(8.5, response.getCommissionRate(), 0.001);
        // 249.99 * 0.085 = 21.24915 -> 21.25
        assertEquals(21.25, response.getCommissionAmount(), 0.01);
        // 249.99 - 21.25 = 228.74
        assertEquals(228.74, response.getVendorAmount(), 0.01);
    }

    @Test
    @DisplayName("Edge Case: 0% and 100% Commission rates")
    void testBoundaryCommissionRates() {
        // 0% Commission
        CommissionCalculationResponse zeroRate = commissionService.calculateCommission(1000.0, 0.0);
        assertEquals(0.0, zeroRate.getCommissionAmount(), 0.001);
        assertEquals(1000.0, zeroRate.getVendorAmount(), 0.001);

        // 100% Commission
        CommissionCalculationResponse fullRate = commissionService.calculateCommission(1000.0, 100.0);
        assertEquals(1000.0, fullRate.getCommissionAmount(), 0.001);
        assertEquals(0.0, fullRate.getVendorAmount(), 0.001);
    }

    @Test
    @DisplayName("Simulation API: Resolves Vendor Profile Commission Rate automatically")
    void testSimulateCommissionWithVendorLookup() {
        CommissionCalculationRequest request = new CommissionCalculationRequest();
        request.setOrderAmount(10000.0);
        request.setVendorId(sampleVendor.getId());

        CommissionCalculationResponse response = commissionService.simulateCommission(request);

        assertNotNull(response);
        assertEquals(sampleVendor.getCommissionRate(), response.getCommissionRate(), 0.001);
        assertEquals(sampleVendor.getStoreName(), response.getVendorStoreName());
        double expectedCommission = Math.round(10000.0 * (sampleVendor.getCommissionRate() / 100.0) * 100.0) / 100.0;
        assertEquals(expectedCommission, response.getCommissionAmount(), 0.01);
    }

    @Test
    @DisplayName("Persistence: Create and query Commission record for an Order")
    void testCreateOrUpdateCommissionForOrder() {
        Commission commission = commissionService.createOrUpdateCommissionForOrder(sampleOrder);

        assertNotNull(commission);
        assertNotNull(commission.getId());
        assertEquals(sampleOrder.getId(), commission.getOrder().getId());
        assertEquals(sampleOrder.getVendorProfile().getId(), commission.getVendorProfile().getId());
        assertEquals(sampleOrder.getTotalAmount(), commission.getOrderAmount(), 0.01);
        assertTrue(commission.getCommissionAmount() > 0);
        assertEquals(Math.round((sampleOrder.getTotalAmount() - commission.getCommissionAmount()) * 100.0) / 100.0,
                commission.getVendorAmount(), 0.01);

        // Verify repository lookup
        var fetchedOpt = commissionRepository.findByOrderId(sampleOrder.getId());
        assertTrue(fetchedOpt.isPresent());
        assertEquals(commission.getId(), fetchedOpt.get().getId());
    }

    @Test
    @DisplayName("Marketplace Summary: Aggregates gross sales, commission earnings, and vendor payouts")
    void testGetCommissionSummary() {
        AdminCommissionSummary summary = commissionService.getCommissionSummary();

        assertNotNull(summary);
        assertTrue(summary.getTotalGrossSales() > 0);
        assertTrue(summary.getTotalCommissionEarned() > 0);
        assertTrue(summary.getTotalVendorPayouts() > 0);
        assertEquals(Math.round((summary.getTotalGrossSales() - summary.getTotalCommissionEarned()) * 100.0) / 100.0,
                summary.getTotalVendorPayouts(), 0.05);
        assertFalse(summary.getVendorCommissions().isEmpty());
    }

    @Test
    @DisplayName("Status Lifecycle: Update Commission status to SETTLED and PAID")
    void testUpdateCommissionStatus() {
        Commission commission = commissionService.createOrUpdateCommissionForOrder(sampleOrder);

        CommissionResponse settled = commissionService.updateCommissionStatus(commission.getId(), CommissionStatus.SETTLED);
        assertEquals(CommissionStatus.SETTLED, settled.getStatus());
        assertNotNull(settled.getSettledAt());

        CommissionResponse paid = commissionService.updateCommissionStatus(commission.getId(), CommissionStatus.PAID);
        assertEquals(CommissionStatus.PAID, paid.getStatus());
    }
}
