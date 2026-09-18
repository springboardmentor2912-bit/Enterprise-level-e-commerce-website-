package com.shopstack.service;

import com.shopstack.dto.WishlistItemDTO;
import com.shopstack.entity.Customer;
import com.shopstack.entity.Product;
import com.shopstack.entity.WishlistItem;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.CustomerRepository;
import com.shopstack.repository.ProductRepository;
import com.shopstack.repository.WishlistItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistServiceImpl implements WishlistService {

    private final WishlistItemRepository wishlistRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public WishlistServiceImpl(WishlistItemRepository wishlistRepository,
                               CustomerRepository customerRepository,
                               ProductRepository productRepository) {
        this.wishlistRepository = wishlistRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public WishlistItemDTO addToWishlist(String customerEmail, Long productId) {
        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found for email: " + customerEmail));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        if (wishlistRepository.existsByCustomerIdAndProductId(customer.getId(), product.getId())) {
            WishlistItem item = wishlistRepository.findByCustomerIdAndProductId(customer.getId(), product.getId()).get();
            return new WishlistItemDTO(item);
        }

        WishlistItem item = new WishlistItem(customer, product);
        return new WishlistItemDTO(wishlistRepository.save(item));
    }

    @Override
    @Transactional
    public void removeFromWishlist(String customerEmail, Long productId) {
        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found for email: " + customerEmail));

        wishlistRepository.deleteByCustomerIdAndProductId(customer.getId(), productId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistItemDTO> getCustomerWishlist(String customerEmail) {
        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found for email: " + customerEmail));

        return wishlistRepository.findByCustomerId(customer.getId()).stream()
                .map(WishlistItemDTO::new)
                .collect(Collectors.toList());
    }
}
