package shopstack_backend.service;

import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import shopstack_backend.entity.*;
import shopstack_backend.repository.PaymentRepository;
import shopstack_backend.repository.RefundRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RefundService {

    @Autowired
    private RefundRepository refundRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private RazorpayClient razorpayClient;

    @Autowired
    private EmailService emailService;


    public Refund processRefund(OrderItem item) {

        Payment payment = paymentRepository
                .findByOrderId(item.getOrder().getId())
                .orElse(null);

        Refund refund = new Refund();

        refund.setOrderItem(item);

        // Refund amount stays as BigDecimal
        BigDecimal refundAmount = item.getLineTotal() != null
                ? item.getLineTotal()
                : BigDecimal.ZERO;

        refund.setAmount(refundAmount);

        if (payment != null
                && "RAZORPAY".equalsIgnoreCase(payment.getMethod())) {

            refund.setMethod("RAZORPAY");
            attemptRazorpayRefund(refund, payment.getTransactionId(), refundAmount);

        } else {

            refund.setMethod(
                    payment != null
                            ? payment.getMethod()
                            : "MANUAL"
            );

            refund.setStatus(
                    RefundStatus.PROCESSED
            );

            refund.setProcessedAt(
                    LocalDateTime.now()
            );
        }

        Refund saved = refundRepository.save(refund);
        if (saved.getStatus() == RefundStatus.PROCESSED) {
            emailService.sendRefundCompletedEmail(saved);
        }
        return saved;
    }

    // ---------------------------------------------------------------
    // Admin: visibility into, and recovery from, a refund whose actual
    // gateway call failed even though the customer's return/cancellation
    // was already processed on our side. Without this, a FAILED refund
    // just sits invisibly in the database forever — the order shows
    // REFUNDED to the customer while no money has actually moved.
    // ---------------------------------------------------------------

    public List<Refund> getFailedRefunds() {
        return refundRepository.findByStatusOrderByProcessedAtDesc(RefundStatus.FAILED);
    }

    public Refund retryRefund(Long refundId) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new IllegalArgumentException("Refund not found."));

        if (refund.getStatus() == RefundStatus.PROCESSED) {
            throw new IllegalStateException("This refund has already been processed.");
        }

        if (!"RAZORPAY".equalsIgnoreCase(refund.getMethod())) {
            // Non-gateway refunds (COD/MANUAL) don't have anything to
            // retry against an API — just mark it handled.
            refund.setStatus(RefundStatus.PROCESSED);
            refund.setProcessedAt(LocalDateTime.now());
            refund.setFailureReason(null);
            Refund saved = refundRepository.save(refund);
            emailService.sendRefundCompletedEmail(saved);
            return saved;
        }

        Payment payment = paymentRepository
                .findByOrderId(refund.getOrderItem().getOrder().getId())
                .orElseThrow(() -> new IllegalStateException("No payment record found for this order."));

        attemptRazorpayRefund(refund, payment.getTransactionId(), refund.getAmount());
        Refund saved = refundRepository.save(refund);
        if (saved.getStatus() == RefundStatus.PROCESSED) {
            emailService.sendRefundCompletedEmail(saved);
        }
        return saved;
    }

    private void attemptRazorpayRefund(Refund refund, String razorpayPaymentId, BigDecimal refundAmount) {
        try {

            long amountInPaise = refundAmount
                    .setScale(2)
                    .movePointRight(2)
                    .longValueExact();

            JSONObject options = new JSONObject();

            options.put("amount", amountInPaise);

            com.razorpay.Refund razorpayRefund =
                    razorpayClient.payments.refund(
                            razorpayPaymentId,
                            options
                    );

            // Razorpay refund ID
            refund.setGatewayRefundId(
                    razorpayRefund.get("id")
            );

            refund.setStatus(
                    RefundStatus.PROCESSED
            );

            refund.setProcessedAt(
                    LocalDateTime.now()
            );
            refund.setFailureReason(null);

        } catch (Exception e) {

            e.printStackTrace();

            refund.setStatus(RefundStatus.FAILED);

            refund.setFailureReason(
                    e.getMessage() != null
                            ? e.getMessage()
                            : e.getClass().getName()
            );
        }
    }
}