package shopstack_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import shopstack_backend.entity.Commission;

import java.util.List;
import java.util.Optional;

public interface CommissionRepository extends JpaRepository<Commission, Long> {

    List<Commission> findByOrder_Id(Long orderId);

    Optional<Commission> findByOrder_IdAndVendor_Id(Long orderId, Long vendorId);

    List<Commission> findByVendor_IdOrderByCreatedAtDesc(Long vendorId);

    List<Commission> findAllByOrderByCreatedAtDesc();
}