package shopstack_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import shopstack_backend.entity.StockHistory;

import java.util.List;

public interface StockHistoryRepository extends JpaRepository<StockHistory, Long> {

    // Full history for one product, newest first — vendor-scoped via the
    // controller check (only the owning vendor should ever call this).
    List<StockHistory> findByProductIdOrderByChangedAtDesc(Long productId);

    // Every stock change across all of a vendor's products, newest first —
    // used for a combined activity feed if needed.
    List<StockHistory> findByProduct_Vendor_User_EmailOrderByChangedAtDesc(String email);

    // Cleared along with a product being permanently deleted.
    void deleteByProductId(Long productId);
}