package shopstack_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import shopstack_backend.entity.Address;

import java.util.List;
import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByUserEmail(String email);

    Optional<Address> findByIdAndUserEmail(Long id, String email);

    Optional<Address> findByUserEmailAndIsDefaultTrue(String email);
}