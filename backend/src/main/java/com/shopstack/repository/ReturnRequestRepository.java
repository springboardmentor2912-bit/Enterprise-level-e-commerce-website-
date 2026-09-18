package com.shopstack.repository;

import com.shopstack.entity.ReturnRequest;
import com.shopstack.entity.ReturnStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {

    List<ReturnRequest> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<ReturnRequest> findByOrderIdOrderByCreatedAtDesc(Long orderId);

    List<ReturnRequest> findAllByOrderByCreatedAtDesc();

    Optional<ReturnRequest> findByOrderItemId(Long orderItemId);

    /**
     * Returns true if an active (non-rejected) return already exists for this order item.
     * Used to prevent duplicate return requests.
     */
    boolean existsByOrderItemIdAndReturnStatusNot(Long orderItemId, ReturnStatus status);

    /**
     * Returns true if any return in the given statuses exists for this order item.
     */
    boolean existsByOrderItemIdAndReturnStatusIn(Long orderItemId, List<ReturnStatus> statuses);
}
