package shopstack_backend.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import shopstack_backend.dto.CartResponseDTO;
import shopstack_backend.dto.OrderResponseDTO;
import shopstack_backend.dto.RazorpayOrderResponseDTO;
import shopstack_backend.dto.VerifyBuyNowRequest;
import shopstack_backend.dto.VerifyPaymentRequest;
import shopstack_backend.entity.Product;
import shopstack_backend.repository.PaymentRepository;
import shopstack_backend.repository.ProductRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class RazorpayPaymentService {

    @Autowired
    private RazorpayClient razorpayClient;

    @Autowired
    private CartService cartService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private CouponService couponService;

    @Autowired(required = false)
    private WarehouseService warehouseService;

    @Autowired
    private EmailService emailService;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public RazorpayOrderResponseDTO createRazorpayOrder(String email, String couponCode) throws Exception {

        CartResponseDTO cart = cartService.getCart(email);

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalStateException("Your cart is empty.");
        }

        // Check real purchasable stock BEFORE ever creating a Razorpay
        // payment order — otherwise a customer could pay for something
        // that's already unavailable and only find out at /verify time,
        // after their money has already been charged.
        for (var item : cart.getItems()) {
            if (item.getAvailableStock() < item.getQuantity()) {
                throw new IllegalStateException(
                        "\"" + item.getProductName() + "\" only has "
                                + item.getAvailableStock() + " unit(s) left. Please update your cart.");
            }
        }

        BigDecimal totalAmount = cart.getTotalAmount();

        // If a coupon code was supplied, charge the discounted amount instead
        // of the full subtotal. Re-validated (and actually reserved) again
        // at /payment/verify time, so this is a preview, not a guarantee.
        if (couponCode != null && !couponCode.isBlank()) {
            CouponService.CouponEvaluationResult eval = couponService.validate(couponCode, totalAmount, email);
            totalAmount = totalAmount.subtract(eval.getDiscountAmount()).setScale(2, RoundingMode.HALF_UP);
        }

        long amountInPaise = totalAmount
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();

        JSONObject options = new JSONObject();

        options.put("amount", amountInPaise);
        options.put("currency", "INR");
        options.put(
                "receipt",
                "cart_" + email + "_" + System.currentTimeMillis()
        );

        Order razorpayOrder = razorpayClient.orders.create(options);

        return new RazorpayOrderResponseDTO(
                razorpayOrder.get("id"),
                keyId,
                amountInPaise,
                "INR"
        );
    }

    public RazorpayOrderResponseDTO createRazorpayOrderForProduct(
            String email,
            Long productId,
            Integer quantity,
            String couponCode
    ) throws Exception {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero."
            );
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found")
                );

        int available = warehouseService != null
                ? warehouseService.getTotalAvailableStock(product.getId())
                : (product.getStockQuantity() != null ? product.getStockQuantity() : 0);

        if (available < quantity) {
            throw new IllegalStateException(
                    "\"" + product.getName() + "\" only has "
                            + available + " unit(s) left."
            );
        }

        BigDecimal amount = product
                .getFinalPrice()
                .multiply(BigDecimal.valueOf(quantity))
                .setScale(2, RoundingMode.HALF_UP);

        if (couponCode != null && !couponCode.isBlank()) {
            CouponService.CouponEvaluationResult eval = couponService.validate(couponCode, amount, email);
            amount = amount.subtract(eval.getDiscountAmount()).setScale(2, RoundingMode.HALF_UP);
        }

        long amountInPaise = amount
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();

        JSONObject options = new JSONObject();

        options.put("amount", amountInPaise);
        options.put("currency", "INR");
        options.put(
                "receipt",
                "buynow_" + email + "_" + System.currentTimeMillis()
        );

        Order razorpayOrder = razorpayClient.orders.create(options);

        return new RazorpayOrderResponseDTO(
                razorpayOrder.get("id"),
                keyId,
                amountInPaise,
                "INR"
        );
    }

    public OrderResponseDTO verifyAndCompleteOrder(
            String email,
            VerifyPaymentRequest request
    ) throws Exception {

        if (request.getRazorpayOrderId() == null
                || request.getRazorpayPaymentId() == null
                || request.getRazorpaySignature() == null) {

            throw new SecurityException(
                    "Incomplete payment verification data."
            );
        }

        if (request.getAddressId() == null) {
            throw new IllegalArgumentException(
                    "Please select a shipping address before checking out."
            );
        }

        try {
            verifySignature(
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature()
            );
        } catch (SecurityException signatureError) {
            emailService.sendPaymentFailedEmail(email, signatureError.getMessage());
            throw signatureError;
        }

        // Idempotency guard: this exact payment must never be used to
        // create more than one order — a double-click, retried request, or
        // replayed callback would otherwise create two separate orders
        // (and charge the vendor's stock twice) from one real payment.
        if (paymentRepository.existsByTransactionId(request.getRazorpayPaymentId())) {
            throw new IllegalStateException(
                    "This payment has already been used to complete an order.");
        }

        try {
            return orderService.checkout(
                    email,
                    request.getAddressId(),
                    "RAZORPAY",
                    request.getRazorpayPaymentId(),
                    request.getCouponCode()
            );
        } catch (Exception orderCreationError) {
            // The payment itself was genuinely verified and captured by
            // Razorpay — if the order still can't be created (e.g. stock
            // ran out in the moments between browsing and paying), the
            // customer has been charged for nothing. Refund automatically
            // rather than leaving their money in limbo with no order to
            // show for it.
            refundFailedPayment(request.getRazorpayPaymentId());
            emailService.sendPaymentFailedEmail(email,
                    "Payment was captured but the order could not be completed (" +
                    orderCreationError.getMessage() + "). A full refund has been issued.");
            throw new IllegalStateException(
                    "Your payment was successful, but we couldn't complete this order (" +
                    orderCreationError.getMessage() + "). You have been refunded in full — " +
                    "it will reflect in your account within 5-7 business days.");
        }
    }

    public OrderResponseDTO verifyAndCompleteBuyNowOrder(
            String email,
            VerifyBuyNowRequest request
    ) throws Exception {

        if (request.getRazorpayOrderId() == null
                || request.getRazorpayPaymentId() == null
                || request.getRazorpaySignature() == null) {

            throw new SecurityException(
                    "Incomplete payment verification data."
            );
        }

        if (request.getAddressId() == null) {
            throw new IllegalArgumentException(
                    "Please select a shipping address before checking out."
            );
        }

        try {
            verifySignature(
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature()
            );
        } catch (SecurityException signatureError) {
            emailService.sendPaymentFailedEmail(email, signatureError.getMessage());
            throw signatureError;
        }

        if (paymentRepository.existsByTransactionId(request.getRazorpayPaymentId())) {
            throw new IllegalStateException(
                    "This payment has already been used to complete an order.");
        }

        try {
            return orderService.checkoutSingleItem(
                    email,
                    request.getAddressId(),
                    request.getProductId(),
                    request.getQuantity(),
                    "RAZORPAY",
                    request.getRazorpayPaymentId(),
                    shopstack_backend.entity.PaymentStatus.SUCCESS,
                    request.getCouponCode()
            );
        } catch (Exception orderCreationError) {
            refundFailedPayment(request.getRazorpayPaymentId());
            emailService.sendPaymentFailedEmail(email,
                    "Payment was captured but the order could not be completed (" +
                    orderCreationError.getMessage() + "). A full refund has been issued.");
            throw new IllegalStateException(
                    "Your payment was successful, but we couldn't complete this order (" +
                    orderCreationError.getMessage() + "). You have been refunded in full — " +
                    "it will reflect in your account within 5-7 business days.");
        }
    }

    // Automatically refunds a captured Razorpay payment when order
    // creation fails after the payment itself already succeeded. Omitting
    // "amount" refunds the full captured amount. Best-effort: if the
    // refund call itself fails, that's logged for manual follow-up rather
    // than masking the original order-creation error from the customer.
    private void refundFailedPayment(String razorpayPaymentId) {
        try {
            razorpayClient.payments.refund(razorpayPaymentId, new JSONObject());
        } catch (Exception refundError) {
            System.err.println(
                    "CRITICAL: failed to auto-refund payment " + razorpayPaymentId +
                    " after order creation failure: " + refundError.getMessage());
        }
    }

    private void verifySignature(
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature
    ) throws Exception {

        JSONObject attributes = new JSONObject();

        attributes.put(
                "razorpay_order_id",
                razorpayOrderId
        );

        attributes.put(
                "razorpay_payment_id",
                razorpayPaymentId
        );

        attributes.put(
                "razorpay_signature",
                razorpaySignature
        );

        boolean isValid = Utils.verifyPaymentSignature(
                attributes,
                keySecret
        );

        if (!isValid) {
            throw new SecurityException(
                    "Payment verification failed. "
                            + "This payment could not be confirmed."
            );
        }
    }
}