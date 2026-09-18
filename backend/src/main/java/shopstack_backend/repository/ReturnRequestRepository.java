package shopstack_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import shopstack_backend.entity.ReturnRequest;
import shopstack_backend.entity.ReturnStatus;

import java.util.List;
import java.util.Optional;

public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {

    // Warehouse staff's QC inbox — returns routed to their warehouse and
    // still awaiting physical inspection, oldest first.
    List<ReturnRequest> findByAssignedWarehouse_IdAndStatusOrderByRequestedAtAsc(
            Long warehouseId, ReturnStatus status);

    // Customer's own return requests, newest first.
    List<ReturnRequest> findByOrderItem_Order_User_EmailOrderByRequestedAtDesc(String email);

    // Ownership check for a customer creating/viewing their own request.
    Optional<ReturnRequest> findByIdAndOrderItem_Order_User_Email(Long id, String email);

    // Vendor's incoming return requests — only for items on products they
    // own, never another vendor's, newest first.
    List<ReturnRequest> findByOrderItem_Product_Vendor_User_EmailOrderByRequestedAtDesc(String email);

    // Ownership check for a vendor approving/rejecting a request.
    Optional<ReturnRequest> findByIdAndOrderItem_Product_Vendor_User_Email(Long id, String email);

    // Block a new return request only while a prior one is still active or
    // already succeeded — NOT forever after a single rejection. Using a
    // plain existsByOrderItemId here would permanently lock a customer out
    // of ever requesting a return on this item again after just one
    // REJECTED attempt, with no way to appeal or resubmit with more
    // evidence.
    boolean existsByOrderItem_IdAndStatusIn(Long orderItemId, List<ReturnStatus> statuses);

    // Admin's global view — every return request, regardless of vendor.
    List<ReturnRequest> findAllByOrderByRequestedAtDesc();
}