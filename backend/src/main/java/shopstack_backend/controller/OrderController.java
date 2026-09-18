package shopstack_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import shopstack_backend.dto.BuyNowRequest;
import shopstack_backend.dto.OrderResponseDTO;
import shopstack_backend.dto.PlaceCodOrderRequest;
import shopstack_backend.dto.UpdateOrderItemStatusRequest;
import shopstack_backend.dto.VendorOrderItemResponseDTO;
import shopstack_backend.service.OrderService;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Converts the logged-in customer's current cart into a real order.
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(Authentication authentication) {
        try {
            OrderResponseDTO order = orderService.checkout(authentication.getName());
            return ResponseEntity.ok(order);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // Cash on Delivery — creates a real order immediately (no Razorpay
    // involved at all), with the Payment recorded as PENDING instead of
    // SUCCESS since cash hasn't actually been collected yet.
    @PostMapping("/checkout/cod")
    public ResponseEntity<?> checkoutCod(Authentication authentication,
                                          @RequestBody PlaceCodOrderRequest request) {
        try {
            OrderResponseDTO order = orderService.placeCodOrder(
                    authentication.getName(), request.getAddressId(), request.getCouponCode());
            return ResponseEntity.ok(order);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // Buy Now + COD — single-item order, cart untouched.
    @PostMapping("/checkout/cod/buy-now")
    public ResponseEntity<?> checkoutCodBuyNow(Authentication authentication,
                                                @RequestBody BuyNowRequest request) {
        try {
            OrderResponseDTO order = orderService.placeCodBuyNowOrder(
                    authentication.getName(), request.getAddressId(), request.getProductId(), request.getQuantity(),
                    request.getCouponCode());
            return ResponseEntity.ok(order);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponseDTO>> getOrderHistory(Authentication authentication) {
        return ResponseEntity.ok(orderService.getOrderHistory(authentication.getName()));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id, Authentication authentication) {
        try {
            OrderResponseDTO order = orderService.getOrderById(id, authentication.getName());
            return ResponseEntity.ok(order);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // ---- Vendor order fulfillment ----

    // Only the logged-in vendor's own line items, across every order —
    // never another vendor's items, even from a shared order.
    @GetMapping("/orders/vendor/items")
    public ResponseEntity<List<VendorOrderItemResponseDTO>> getVendorOrderItems(Authentication authentication) {
        return ResponseEntity.ok(orderService.getVendorOrderItems(authentication.getName()));
    }

    @PutMapping("/orders/items/{itemId}/status")
    public ResponseEntity<?> updateItemStatus(@PathVariable Long itemId,
                                               Authentication authentication,
                                               @RequestBody UpdateOrderItemStatusRequest request) {
        try {
            VendorOrderItemResponseDTO updated =
                    orderService.updateItemStatus(authentication.getName(), itemId, request.getStatus());
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ---- Customer-initiated cancellation ----

    // Cancel a single line item — only while it's still PENDING/CONFIRMED,
    // i.e. before the vendor has started processing it.
    @PutMapping("/orders/items/{itemId}/cancel")
    public ResponseEntity<?> cancelOrderItem(@PathVariable Long itemId, Authentication authentication) {
        try {
            OrderResponseDTO order = orderService.cancelOrderItem(authentication.getName(), itemId);
            return ResponseEntity.ok(order);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Cancel every still-cancellable item on an order in one action.
    @PutMapping("/orders/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId, Authentication authentication) {
        try {
            OrderResponseDTO order = orderService.cancelOrder(authentication.getName(), orderId);
            return ResponseEntity.ok(order);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}