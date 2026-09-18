package shopstack_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import shopstack_backend.entity.Warehouse;

import java.util.List;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {

    List<Warehouse> findAllByOrderByNameAsc();

    List<Warehouse> findByActiveTrueOrderByNameAsc();

    boolean existsByNameIgnoreCase(String name);
}