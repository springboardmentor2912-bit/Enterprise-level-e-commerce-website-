package shopstack_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import shopstack_backend.entity.AllocationStatus;
import shopstack_backend.entity.StockAllocation;

import java.util.List;

public interface StockAllocationRepository extends JpaRepository<StockAllocation, Long> {

    List<StockAllocation> findByOrderItem_Id(Long orderItemId);

    List<StockAllocation> findByOrderItem_Order_IdOrderByIdAsc(Long orderId);

    List<StockAllocation> findByWarehouse_IdAndStatusOrderByAllocatedAtAsc(Long warehouseId, AllocationStatus status);

    List<StockAllocation> findByStatusOrderByAllocatedAtAsc(AllocationStatus status);

    long countByWarehouse_IdAndStatus(Long warehouseId, AllocationStatus status);
}