package shopstack_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import shopstack_backend.dto.WishlistItemResponseDTO;
import shopstack_backend.entity.Product;
import shopstack_backend.entity.User;
import shopstack_backend.entity.WishlistItem;
import shopstack_backend.repository.ProductRepository;
import shopstack_backend.repository.UserRepository;
import shopstack_backend.repository.WishlistRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired(required = false)
    private WarehouseService warehouseService;

    // Get all wishlist items for a user
    @Transactional(readOnly = true)
    public List<WishlistItemResponseDTO> getWishlist(String email) {

        return wishlistRepository
                .findByUserEmailOrderByAddedAtDesc(email)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Add product to wishlist
    @Transactional
    public List<WishlistItemResponseDTO> addItem(String email, Long productId) {

        // If product already exists, simply return the current wishlist
        if (wishlistRepository.existsByUserEmailAndProductId(email, productId)) {
            return getWishlist(email);
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        WishlistItem item = new WishlistItem();

        item.setUser(user);
        item.setProduct(product);

        wishlistRepository.save(item);

        return getWishlist(email);
    }

    // Remove product from wishlist
    @Transactional
    public List<WishlistItemResponseDTO> removeItem(
            String email,
            Long productId) {

        WishlistItem item = wishlistRepository
                .findByUserEmailAndProductId(email, productId)
                .orElseThrow(() ->
                        new SecurityException(
                                "This item isn't in your wishlist."
                        ));

        wishlistRepository.delete(item);

        return getWishlist(email);
    }

    // Convert WishlistItem entity to DTO
    private WishlistItemResponseDTO mapToDTO(WishlistItem item) {

        WishlistItemResponseDTO dto =
                new WishlistItemResponseDTO();

        Product product = item.getProduct();

        dto.setId(item.getId());

        dto.setProductId(product.getId());

        dto.setProductName(product.getName());

        dto.setImageUrl(product.getImageUrl());

        // BigDecimal price
        dto.setPrice(
                product.getPrice() != null
                        ? product.getPrice()
                        : BigDecimal.ZERO
        );

        // Discount percentage
        dto.setDiscountPercentage(
                product.getDiscountPercentage()
        );

        // Final price after discount
        dto.setFinalPrice(
                product.getFinalPrice()
        );

        // Stock status — reflects real purchasable (warehouse) stock, not
        // the vendor's undistributed pool, so this matches what checkout
        // actually gates against.
        int stock = warehouseService != null
                ? warehouseService.getTotalAvailableStock(product.getId())
                : (product.getStockQuantity() != null ? product.getStockQuantity() : 0);

        dto.setInStock(stock > 0);

        // Wishlist added date
        dto.setAddedAt(item.getAddedAt());

        return dto;
    }
}