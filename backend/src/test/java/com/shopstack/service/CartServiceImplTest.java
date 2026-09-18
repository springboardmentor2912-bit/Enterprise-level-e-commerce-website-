package com.shopstack.service;

import com.shopstack.dto.AddToCartRequest;
import com.shopstack.dto.CartItemDTO;
import com.shopstack.entity.ApprovalStatus;
import com.shopstack.entity.CartItem;
import com.shopstack.entity.Customer;
import com.shopstack.entity.Product;
import com.shopstack.repository.CartItemRepository;
import com.shopstack.repository.CustomerRepository;
import com.shopstack.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceImplTest {

    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private CartServiceImpl cartService;

    private Customer customer;
    private Product product;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setId(1L);
        customer.setEmail("customer@test.com");

        product = new Product();
        product.setId(10L);
        product.setName("Wireless Mouse");
        product.setPrice(new BigDecimal("500.00"));
        product.setStockQuantity(10);
        product.setApprovalStatus(ApprovalStatus.APPROVED);
    }

    @Test
    @DisplayName("addToCart SUCCESS - Valid stock and approved product")
    void testAddToCartSuccess() {
        when(customerRepository.findByEmail("customer@test.com")).thenReturn(Optional.of(customer));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(cartItemRepository.findByCustomerIdAndProductId(1L, 10L)).thenReturn(Optional.empty());
        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(inv -> {
            CartItem item = inv.getArgument(0);
            item.setId(100L);
            return item;
        });

        AddToCartRequest req = new AddToCartRequest();
        req.setProductId(10L);
        req.setQuantity(2);

        CartItemDTO dto = cartService.addToCart("customer@test.com", req);

        assertNotNull(dto);
        assertEquals(2, dto.getQuantity());
        assertNotNull(dto.getProduct());
        assertEquals("Wireless Mouse", dto.getProduct().getName());
    }

    @Test
    @DisplayName("addToCart FAIL - Requested quantity exceeds stock")
    void testAddToCartExceedsStock() {
        when(customerRepository.findByEmail("customer@test.com")).thenReturn(Optional.of(customer));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        AddToCartRequest req = new AddToCartRequest();
        req.setProductId(10L);
        req.setQuantity(15);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> cartService.addToCart("customer@test.com", req));

        assertTrue(ex.getMessage().contains("Available stock for 'Wireless Mouse' is 10"));
    }

    @Test
    @DisplayName("addToCart FAIL - Unapproved product rejected")
    void testAddToCartUnapprovedProduct() {
        product.setApprovalStatus(ApprovalStatus.PENDING);
        when(customerRepository.findByEmail("customer@test.com")).thenReturn(Optional.of(customer));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        AddToCartRequest req = new AddToCartRequest();
        req.setProductId(10L);
        req.setQuantity(1);

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> cartService.addToCart("customer@test.com", req));

        assertTrue(ex.getMessage().contains("is not approved for purchase"));
    }

    @Test
    @DisplayName("updateQuantity FAIL - Exceeds stock bounds")
    void testUpdateQuantityExceedsStock() {
        CartItem item = new CartItem(customer, product, 2);
        item.setId(50L);

        when(customerRepository.findByEmail("customer@test.com")).thenReturn(Optional.of(customer));
        when(cartItemRepository.findById(50L)).thenReturn(Optional.of(item));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> cartService.updateQuantity(50L, "customer@test.com", 20));

        assertTrue(ex.getMessage().contains("Available stock for 'Wireless Mouse' is 10"));
    }
}
