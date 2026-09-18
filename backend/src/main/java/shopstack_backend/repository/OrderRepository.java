package shopstack_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import shopstack_backend.entity.Order;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserEmailOrderByCreatedAtDesc(String email);

    List<Order> findByUserEmailOrderByCreatedAtAsc(String email);

    Optional<Order> findByIdAndUserEmail(Long id, String email);
}