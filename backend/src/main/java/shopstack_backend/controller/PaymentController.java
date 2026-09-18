package shopstack_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import shopstack_backend.dto.BuyNowRequest;
import shopstack_backend.dto.OrderResponseDTO;
import shopstack_backend.dto.RazorpayOrderResponseDTO;
import shopstack_backend.dto.VerifyBuyNowRequest;
import shopstack_backend.dto.VerifyPaymentRequest;
import shopstack_backend.service.RazorpayPaymentService;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    @Autowired
    private RazorpayPaymentService razorpayPaymentService;

    // Step 1: create a Razorpay order for the customer's current cart total.
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(Authentication authentication,
                                          @RequestParam(required = false) String couponCode) {
        try {
            RazorpayOrderResponseDTO response =
                    razorpayPaymentService.createRazorpayOrder(authentication.getName(), couponCode);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to initiate payment: " + e.getMessage());
        }
    }

    // Step 2: verify signature, then complete the cart-based order.
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(Authentication authentication,
                                            @RequestBody VerifyPaymentRequest request) {
        try {
            OrderResponseDTO order =
                    razorpayPaymentService.verifyAndCompleteOrder(authentication.getName(), request);
            return ResponseEntity.ok(order);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to verify payment: " + e.getMessage());
        }
    }

    // ---- Buy Now: same two-step flow, but for one product, completely
    // independent of the cart.

    @PostMapping("/create-order/buy-now")
    public ResponseEntity<?> createOrderForBuyNow(Authentication authentication,
                                                   @RequestBody BuyNowRequest request) {
        try {
            RazorpayOrderResponseDTO response = razorpayPaymentService.createRazorpayOrderForProduct(
                    authentication.getName(), request.getProductId(), request.getQuantity(), request.getCouponCode());
            return ResponseEntity.ok(response);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to initiate payment: " + e.getMessage());
        }
    }

    @PostMapping("/verify/buy-now")
    public ResponseEntity<?> verifyBuyNowPayment(Authentication authentication,
                                                  @RequestBody VerifyBuyNowRequest request) {
        try {
            OrderResponseDTO order =
                    razorpayPaymentService.verifyAndCompleteBuyNowOrder(authentication.getName(), request);
            return ResponseEntity.ok(order);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to verify payment: " + e.getMessage());
        }
    }
}