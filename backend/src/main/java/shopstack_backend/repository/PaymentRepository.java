package shopstack_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import shopstack_backend.entity.Payment;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderId(Long orderId);

    // Guards against a double-submitted/replayed verification request
    // creating two separate orders from one actual Razorpay payment.
    boolean existsByTransactionId(String transactionId);
}