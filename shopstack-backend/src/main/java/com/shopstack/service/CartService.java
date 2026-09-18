package com.shopstack.service;

import com.shopstack.dto.cart.*;
import com.shopstack.entity.Cart;
import com.shopstack.entity.CartItem;
import com.shopstack.entity.Inventory;
import com.shopstack.entity.Product;
import com.shopstack.entity.User;
import com.shopstack.exception.BadRequestException;
import com.shopstack.exception.InsufficientStockException;
import com.shopstack.repository.CartItemRepository;
import com.shopstack.repository.CartRepository;
import com.shopstack.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductService productService;
    private final UserService userService;

    @Transactional
    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userService.getById(userId);
            return cartRepository.save(Cart.builder().user(user).build());
        });
    }

    @Transactional
    public Cart addItem(Long userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);
        Product product = productService.getById(request.getProductId());

        Inventory inventory = inventoryRepository.findByProductId(product.getId())
                .orElseThrow(() -> new BadRequestException("This product is currently unavailable"));

        var existing = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());
        int desiredQuantity = request.getQuantity() + existing.map(CartItem::getQuantity).orElse(0);

        if (inventory.getAvailableQuantity() < desiredQuantity) {
            throw new InsufficientStockException("Only " + inventory.getAvailableQuantity() + " units of " + product.getName() + " are in stock");
        }

        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(desiredQuantity);
            cartItemRepository.save(item);
        } else {
            CartItem item = CartItem.builder().cart(cart).product(product).quantity(request.getQuantity()).build();
            cart.getItems().add(item);
            cartItemRepository.save(item);
        }

        return cartRepository.findByUserId(userId).orElseThrow();
    }

    @Transactional
    public Cart updateItemQuantity(Long userId, Long productId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new BadRequestException("Item not found in cart"));

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new BadRequestException("This product is currently unavailable"));

        if (inventory.getAvailableQuantity() < request.getQuantity()) {
            throw new InsufficientStockException("Only " + inventory.getAvailableQuantity() + " units available");
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);
        return cartRepository.findByUserId(userId).orElseThrow();
    }

    @Transactional
    public Cart removeItem(Long userId, Long productId) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new BadRequestException("Item not found in cart"));
        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        return cartRepository.findByUserId(userId).orElseThrow();
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    public CartResponse toResponse(Cart cart) {
        BigDecimal subtotal = BigDecimal.ZERO;
        int totalItems = 0;
        var itemResponses = new java.util.ArrayList<CartItemResponse>();

        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            BigDecimal unitPrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(lineTotal);
            totalItems += item.getQuantity();

            Integer availableStock = inventoryRepository.findByProductId(product.getId())
                    .map(Inventory::getAvailableQuantity).orElse(0);

            itemResponses.add(CartItemResponse.builder()
                    .id(item.getId())
                    .productId(product.getId())
                    .productName(product.getName())
                    .productImage(product.getImages() != null && !product.getImages().isEmpty() ? product.getImages().get(0) : null)
                    .unitPrice(unitPrice)
                    .quantity(item.getQuantity())
                    .lineTotal(lineTotal)
                    .availableStock(availableStock)
                    .build());
        }

        return CartResponse.builder()
                .cartId(cart.getId())
                .items(itemResponses)
                .subtotal(subtotal)
                .totalItems(totalItems)
                .build();
    }
}
