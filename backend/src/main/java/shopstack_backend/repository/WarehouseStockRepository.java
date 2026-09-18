package shopstack_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import shopstack_backend.entity.WarehouseStock;

import java.util.List;
import java.util.Optional;

public interface WarehouseStockRepository extends JpaRepository<WarehouseStock, Long> {
    Optional<WarehouseStock> findByWarehouse_IdAndProduct_Id(Long warehouseId, Long productId);
    List<WarehouseStock> findByWarehouse_IdOrderByProduct_NameAsc(Long warehouseId);
    List<WarehouseStock> findByProduct_Id(Long productId);
    // Warehouses that currently have free stock of this product, most-stocked
    // first — this is the allocation algorithm's picking order.
    List<WarehouseStock> findByProduct_IdAndAvailableQuantityGreaterThanOrderByAvailableQuantityDesc(
            Long productId, int minQuantity);

    // Cleared along with a product being permanently deleted — a deleted
    // product has no meaningful warehouse stock to track anymore.
    void deleteByProduct_Id(Long productId);
}