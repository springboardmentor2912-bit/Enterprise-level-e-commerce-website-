package shopstack_backend.repository;

import shopstack_backend.entity.Role;
import shopstack_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Case-insensitive variants — used wherever a human is typing an email
    // (login, registration's duplicate check, forgot-password) so
    // "Test@Gmail.com" and "test@gmail.com" are treated as the same
    // account regardless of how it was originally stored.
    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    // All warehouse staff accounts, for the admin's staff management screen.
    List<User> findByRoleOrderByFullNameAsc(Role role);

    // Every staff member currently assigned to a given warehouse.
    List<User> findByRoleAndAssignedWarehouse_Id(Role role, Long warehouseId);
}