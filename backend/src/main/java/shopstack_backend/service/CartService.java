package shopstack_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import shopstack_backend.dto.CartItemResponseDTO;
import shopstack_backend.dto.CartResponseDTO;
import shopstack_backend.entity.Cart;
import shopstack_backend.entity.CartItem;
import shopstack_backend.entity.Product;
import shopstack_backend.entity.User;
import shopstack_backend.repository.CartItemRepository;
import shopstack_backend.repository.CartRepository;
import shopstack_backend.repository.ProductRepository;
import shopstack_backend.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired(required = false)
    private WarehouseService warehouseService;

    // Real purchasable stock for a product — the same number checkout
    // gates against (sum of active-warehouse availableQuantity, minus
    // orders already placed but not yet allocated). Product.stockQuantity
    // is the vendor's UNDISTRIBUTED pool, not what a customer can actually
    // buy, so the cart must never validate or display against that number —
    // doing so would let a fully-distributed (stockQuantity=0) product get
    // rejected here while checkout would happily accept it, or the reverse.
    private int getRealAvailableStock(Product product) {
        if (product == null || product.getId() == null) {
            return 0;
        }
        if (warehouseService != null) {
            return warehouseService.getTotalAvailableStock(product.getId());
        }
        return product.getStockQuantity() != null ? product.getStockQuantity() : 0;
    }

    @Transactional
    public Cart getOrCreateCart(String email) {

        return cartRepository.findByUserEmail(email)
                .orElseGet(() -> {

                    User user = userRepository.findByEmail(email)
                            .orElseThrow(() ->
                                    new RuntimeException("User not found"));

                    Cart cart = new Cart();
                    cart.setUser(user);

                    return cartRepository.save(cart);
                });
    }
    @Transactional(readOnly = true)
    public CartResponseDTO getCart(String email) {
        Cart cart = cartRepository.findByUserEmail(email)
                .orElse(null);
        if (cart == null) {
            return emptyCartResponse();
        }
        return mapToDTO(cart);
    }

    @Transactional
    public CartResponseDTO addItem(
            String email,
            Long productId,
            Integer quantity) {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero.");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        int available = getRealAvailableStock(product);

        if (available <= 0) {
            throw new IllegalStateException(
                    "This product is out of stock.");
        }

        Cart cart = getOrCreateCart(email);

        CartItem item = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), productId)
                .orElse(null);

        int requestedTotal =
                quantity + (item != null ? item.getQuantity() : 0);

        if (requestedTotal > available) {
            throw new IllegalStateException(
                    "Only " + available +
                    " unit(s) of \"" +
                    product.getName() +
                    "\" available."
            );
        }

        if (item != null) {

            item.setQuantity(requestedTotal);

        } else {

            item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setQuantity(quantity);

            cart.getItems().add(item);
        }

        cartItemRepository.save(item);

        return mapToDTO(
                cartRepository.findByUserEmail(email)
                        .orElseThrow()
        );
    }

    @Transactional
    public CartResponseDTO updateItemQuantity(
            String email,
            Long itemId,
            Integer quantity) {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero.");
        }

        CartItem item = cartItemRepository
                .findByIdAndCartUserEmail(itemId, email)
                .orElseThrow(() ->
                        new SecurityException(
                                "Cart item not found for this account."
                        ));

        Product product = item.getProduct();

        int available = getRealAvailableStock(product);

        if (quantity > available) {
            throw new IllegalStateException(
                    "Only " + available +
                    " unit(s) of \"" +
                    product.getName() +
                    "\" available."
            );
        }

        item.setQuantity(quantity);

        cartItemRepository.save(item);

        return mapToDTO(
                cartRepository.findByUserEmail(email)
                        .orElseThrow()
        );
    }

    @Transactional
    public CartResponseDTO removeItem(
            String email,
            Long itemId) {

        CartItem item = cartItemRepository
                .findByIdAndCartUserEmail(itemId, email)
                .orElseThrow(() ->
                        new SecurityException(
                                "Cart item not found for this account."
                        ));

        Cart cart = item.getCart();

        // Keep the in-memory collection synchronized.
        cart.getItems().remove(item);

        cartItemRepository.delete(item);
        cartItemRepository.flush();

        return mapToDTO(cart);
    }

    @Transactional
    public CartResponseDTO clearCart(String email) {

        Cart cart = cartRepository
                .findByUserEmail(email)
                .orElse(null);

        if (cart != null) {
            cart.getItems().clear();
            cartRepository.save(cart);
        }

        return emptyCartResponse();
    }

    private CartResponseDTO mapToDTO(Cart cart) {

        CartResponseDTO dto = new CartResponseDTO();

        dto.setCartId(cart.getId());

        List<CartItemResponseDTO> itemDTOs =
                new ArrayList<>();

        // Use BigDecimal for all money calculations.
        BigDecimal total = BigDecimal.ZERO;

        for (CartItem item : cart.getItems()) {

            Product product = item.getProduct();

            if (product == null) {
                continue;
            }

            CartItemResponseDTO itemDto =
                    new CartItemResponseDTO();

            itemDto.setId(item.getId());

            itemDto.setProductId(product.getId());

            itemDto.setProductName(product.getName());

            itemDto.setImageUrl(product.getImageUrl());

            // Original product price
            itemDto.setPrice(
                    product.getPrice() != null
                            ? product.getPrice()
                            : BigDecimal.ZERO
            );

            // Discount percentage
            itemDto.setDiscountPercentage(
                    product.getDiscountPercentage()
            );

            // Final price after discount
            BigDecimal finalPrice =
                    product.getFinalPrice();

            if (finalPrice == null) {
                finalPrice = BigDecimal.ZERO;
            }

            finalPrice = finalPrice.setScale(
                    2,
                    RoundingMode.HALF_UP
            );

            itemDto.setFinalPrice(finalPrice);

            // Quantity
            itemDto.setQuantity(item.getQuantity());

            int availableStock = getRealAvailableStock(product);

            itemDto.setAvailableStock(availableStock);
            BigDecimal lineTotal =
                    finalPrice.multiply(
                            BigDecimal.valueOf(item.getQuantity())
                    ).setScale(
                            2,
                            RoundingMode.HALF_UP
                    );

            itemDto.setLineTotal(lineTotal);

            // Add to cart total
            total = total.add(lineTotal);

            itemDTOs.add(itemDto);
        }

        dto.setItems(itemDTOs);

        dto.setTotalAmount(
                total.setScale( 2, RoundingMode.HALF_UP ));

        dto.setTotalItems(
                itemDTOs.stream()
                        .mapToInt(
                                CartItemResponseDTO::getQuantity
                        )
                        .sum()
        );

        return dto;
    }
    private CartResponseDTO emptyCartResponse() {

        CartResponseDTO dto =
                new CartResponseDTO();

        dto.setCartId(null);

        dto.setItems(new ArrayList<>());

        dto.setTotalAmount(BigDecimal.ZERO);

        dto.setTotalItems(0);

        return dto;
    }
}