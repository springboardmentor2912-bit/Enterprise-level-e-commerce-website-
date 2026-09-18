package shopstack_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import shopstack_backend.entity.Refund;

import java.util.Optional;

public interface RefundRepository extends JpaRepository<Refund, Long> {

    Optional<Refund> findByOrderItemId(Long orderItemId);

    // Admin's "needs attention" list — refunds where the customer's return
    // was processed but the actual money movement failed and never retried.
    java.util.List<Refund> findByStatusOrderByProcessedAtDesc(shopstack_backend.entity.RefundStatus status);
}