package com.infosys.auth.service;

import com.infosys.auth.model.Order;
import com.infosys.auth.model.OrderItem;
import com.infosys.auth.model.VendorCommission;
import com.infosys.auth.model.VendorProfile;
import com.infosys.auth.repository.OrderRepository;
import com.infosys.auth.repository.ProductRepository;
import com.infosys.auth.repository.VendorCommissionRepository;
import com.infosys.auth.repository.VendorProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CommissionServiceTest {

    @Mock
    private VendorCommissionRepository vendorCommissionRepository;

    @Mock
    private VendorProfileRepository vendorProfileRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private CommissionService commissionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("Case 1: Order Amount ₹10,000 with 10% Commission -> Platform Fee ₹1,000 & Vendor Amount ₹9,000")
    void calculateCommission_case1_10000_at_10_percent() {
        BigDecimal orderAmount = new BigDecimal("10000.00");
        BigDecimal commissionRate = new BigDecimal("10.00");

        Map<String, Object> result = commissionService.calculateCommission(orderAmount, commissionRate);

        assertEquals(new BigDecimal("10000.00"), result.get("orderAmount"));
        assertEquals(new BigDecimal("10.00"), result.get("commissionRate"));
        assertEquals(new BigDecimal("1000.00"), result.get("commissionAmount"));
        assertEquals(new BigDecimal("9000.00"), result.get("vendorAmount"));
    }

    @Test
    @DisplayName("Case 2: Order Amount ₹5,000 with 5% Commission -> Platform Fee ₹250 & Vendor Amount ₹4,750")
    void calculateCommission_case2_5000_at_5_percent() {
        BigDecimal orderAmount = new BigDecimal("5000.00");
        BigDecimal commissionRate = new BigDecimal("5.00");

        Map<String, Object> result = commissionService.calculateCommission(orderAmount, commissionRate);

        assertEquals(new BigDecimal("5000.00"), result.get("orderAmount"));
        assertEquals(new BigDecimal("5.00"), result.get("commissionRate"));
        assertEquals(new BigDecimal("250.00"), result.get("commissionAmount"));
        assertEquals(new BigDecimal("4750.00"), result.get("vendorAmount"));
    }

    @Test
    @DisplayName("createCommissionsForOrder identifies vendor, calculates commission, and stores record in repository")
    void createCommissionsForOrder_success() {
        Order order = new Order();
        order.setId(101L);

        OrderItem item1 = new OrderItem(1L, "Luxury Watch", "img.jpg", new BigDecimal("5000.00"), 2, 201L);
        order.setItems(List.of(item1));

        VendorProfile profile = new VendorProfile();
        profile.setUserId(201L);
        profile.setStoreName("Chronos Luxury");
        when(vendorProfileRepository.findByUserId(201L)).thenReturn(Optional.of(profile));
        when(vendorCommissionRepository.existsByOrderIdAndVendorId(101L, 201L)).thenReturn(false);

        VendorCommission savedCommission = new VendorCommission(101L, 201L, "Chronos Luxury",
                new BigDecimal("10000.00"), new BigDecimal("10.0"), new BigDecimal("1000.00"),
                new BigDecimal("9000.00"), "PENDING");
        when(vendorCommissionRepository.save(any(VendorCommission.class))).thenReturn(savedCommission);

        List<VendorCommission> result = commissionService.createCommissionsForOrder(order);

        assertEquals(1, result.size());
        ArgumentCaptor<VendorCommission> captor = ArgumentCaptor.forClass(VendorCommission.class);
        verify(vendorCommissionRepository).save(captor.capture());

        VendorCommission captured = captor.getValue();
        assertEquals(101L, captured.getOrderId());
        assertEquals(201L, captured.getVendorId());
        assertEquals("Chronos Luxury", captured.getVendorName());
        assertEquals(new BigDecimal("10000.00"), captured.getOrderAmount());
        assertEquals(new BigDecimal("1000.00"), captured.getCommissionAmount());
        assertEquals(new BigDecimal("9000.00"), captured.getVendorAmount());
    }

    @Test
    @DisplayName("createCommissionsForOrder handles multiple vendors in a single order")
    void createCommissionsForOrder_multiVendor() {
        Order order = new Order();
        order.setId(102L);

        OrderItem item1 = new OrderItem(1L, "Watch", "img1.jpg", new BigDecimal("4000.00"), 1, 201L);
        OrderItem item2 = new OrderItem(2L, "Audio Headphones", "img2.jpg", new BigDecimal("1000.00"), 1, 202L);
        order.setItems(List.of(item1, item2));

        when(vendorCommissionRepository.existsByOrderIdAndVendorId(anyLong(), anyLong())).thenReturn(false);
        when(vendorCommissionRepository.save(any(VendorCommission.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<VendorCommission> result = commissionService.createCommissionsForOrder(order);

        assertEquals(2, result.size());
        verify(vendorCommissionRepository, times(2)).save(any(VendorCommission.class));
    }
}
