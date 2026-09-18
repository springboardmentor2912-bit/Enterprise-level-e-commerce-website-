package shopstack_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import shopstack_backend.entity.StockMovement;

import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findByOrderItem_IdOrderByMovedAtAsc(Long orderItemId);

    List<StockMovement> findByWarehouse_IdOrderByMovedAtDesc(Long warehouseId);

    List<StockMovement> findAllByOrderByMovedAtDesc();

    // Cleared along with a product being permanently deleted — this is an
    // operational log scoped to that product, not a customer-facing or
    // financial record like an order.
    void deleteByProduct_Id(Long productId);
}