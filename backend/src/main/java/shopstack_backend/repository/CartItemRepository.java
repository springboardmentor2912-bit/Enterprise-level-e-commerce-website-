package shopstack_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import shopstack_backend.entity.CartItem;

import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByIdAndCartUserEmail(Long id, String email);

    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

    // Harmless to cascade away — just other users' cart entries referencing
    // a product that's being deleted from the catalog entirely.
    void deleteByProduct_Id(Long productId);
}