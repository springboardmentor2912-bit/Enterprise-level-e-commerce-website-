package com.shopstack.service;

import com.shopstack.dto.AddToCartRequest;
import com.shopstack.dto.CartItemDTO;
import com.shopstack.entity.ApprovalStatus;
import com.shopstack.entity.CartItem;
import com.shopstack.entity.Customer;
import com.shopstack.entity.Product;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.CartItemRepository;
import com.shopstack.repository.CustomerRepository;
import com.shopstack.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public CartServiceImpl(CartItemRepository cartItemRepository,
                           CustomerRepository customerRepository,
                           ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public CartItemDTO addToCart(String customerEmail, AddToCartRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0.");
        }

        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found for email: " + customerEmail));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + request.getProductId()));

        if (!ApprovalStatus.APPROVED.equals(product.getApprovalStatus())) {
            throw new IllegalStateException("Product '" + product.getName() + "' is not approved for purchase.");
        }

        Optional<CartItem> existingItem = cartItemRepository.findByCustomerIdAndProductId(customer.getId(), product.getId());

        int targetQuantity = request.getQuantity();
        if (existingItem.isPresent()) {
            targetQuantity += existingItem.get().getQuantity();
        }

        if (product.getStockQuantity() < targetQuantity) {
            throw new IllegalArgumentException("Cannot add requested quantity to cart. Available stock for '" +
                    product.getName() + "' is " + product.getStockQuantity() + ", requested total in cart: " + targetQuantity + ".");
        }

        CartItem item;
        if (existingItem.isPresent()) {
            item = existingItem.get();
            item.setQuantity(targetQuantity);
        } else {
            item = new CartItem(customer, product, request.getQuantity());
        }

        return new CartItemDTO(cartItemRepository.save(item));
    }

    @Override
    @Transactional
    public CartItemDTO updateQuantity(Long itemId, String customerEmail, Integer quantity) {
        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found for email: " + customerEmail));

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with ID: " + itemId));

        if (!item.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Unauthorized cart access");
        }

        if (quantity == null || quantity <= 0) {
            cartItemRepository.delete(item);
            return null;
        }

        Product product = item.getProduct();
        if (product.getStockQuantity() < quantity) {
            throw new IllegalArgumentException("Cannot update cart quantity. Available stock for '" +
                    product.getName() + "' is " + product.getStockQuantity() + ", requested: " + quantity + ".");
        }

        item.setQuantity(quantity);
        return new CartItemDTO(cartItemRepository.save(item));
    }

    @Override
    @Transactional
    public void removeFromCart(Long itemId, String customerEmail) {
        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found for email: " + customerEmail));

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with ID: " + itemId));

        if (!item.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Unauthorized cart access");
        }

        cartItemRepository.delete(item);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CartItemDTO> getCustomerCart(String customerEmail) {
        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found for email: " + customerEmail));

        return cartItemRepository.findByCustomerId(customer.getId()).stream()
                .map(CartItemDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void clearCart(String customerEmail) {
        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found for email: " + customerEmail));

        cartItemRepository.deleteByCustomerId(customer.getId());
    }
}
