package shopstack_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import shopstack_backend.entity.OrderItem;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // Every item across every order that belongs to this vendor's products —
    // this is the vendor-isolation boundary: a vendor only ever sees their
    // own line items, never another vendor's items even within the same order.
    List<OrderItem> findByProduct_Vendor_User_EmailOrderByOrder_CreatedAtDesc(String email);
    List<OrderItem> findByOrder_Id(Long orderId);
    // Ownership check for a status update: this item must both exist AND
    // belong to a product owned by this vendor.
    Optional<OrderItem> findByIdAndProduct_Vendor_User_Email(Long id, String email);

    // Ownership check for customer-initiated cancellation: this item must
    // belong to an order actually placed by this customer.
    Optional<OrderItem> findByIdAndOrder_User_Email(Long id, String email);
    @Query("""
    SELECT COALESCE(SUM(oi.lineTotal), 0)
    FROM OrderItem oi
    WHERE oi.product.vendor.id = :vendorId
""")
BigDecimal calculateVendorSales(@Param("vendorId") Long vendorId);

    // Used to block hard-deleting a product that has real order history —
    // that must be blocked, never silently cascaded away.
    boolean existsByProduct_Id(Long productId);

    // Units already sold (order placed) for this product but not yet
    // manually allocated to a warehouse. Under manual-only allocation, a
    // CONFIRMED item has, by definition, no StockAllocation yet — this is
    // exactly the quantity that's spoken for but not yet physically
    // reserved at the warehouse level. Without subtracting this, two
    // different customers could both "successfully" order the same last
    // unit before admin ever allocates either of them.
    @Query("""
        SELECT COALESCE(SUM(oi.quantity), 0)
        FROM OrderItem oi
        WHERE oi.product.id = :productId
        AND oi.status = shopstack_backend.entity.OrderStatus.CONFIRMED
    """)
    int sumPendingUnallocatedQuantity(@Param("productId") Long productId);
}