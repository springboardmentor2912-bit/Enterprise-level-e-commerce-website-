package shopstack_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import shopstack_backend.entity.WishlistItem;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findByUserEmailOrderByAddedAtDesc(String email);

    Optional<WishlistItem> findByUserEmailAndProductId(String email, Long productId);

    boolean existsByUserEmailAndProductId(String email, Long productId);

    // Harmless to cascade away — just other users' wishlist entries
    // referencing a product that's being deleted from the catalog entirely.
    void deleteByProduct_Id(Long productId);
}