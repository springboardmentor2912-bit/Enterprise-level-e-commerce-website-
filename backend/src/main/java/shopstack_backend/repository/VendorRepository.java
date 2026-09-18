package shopstack_backend.repository;

import shopstack_backend.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {

    // Useful helper query methods (optional)
    Optional<Vendor> findByEmail(String email);

    boolean existsByEmail(String email);

    // One Vendor profile per User (@OneToOne) — this is what lets an
    // account whose primary role isn't VENDOR (e.g. a CUSTOMER) still
    // "also be a vendor": having a row here, independent of User.role.
    Optional<Vendor> findByUser(shopstack_backend.entity.User user);

    boolean existsByUser(shopstack_backend.entity.User user);
}