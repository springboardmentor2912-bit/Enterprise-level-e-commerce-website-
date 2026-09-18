package shopstack_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import shopstack_backend.dto.*;
import shopstack_backend.entity.AllocationStatus;
import shopstack_backend.entity.Role;
import shopstack_backend.entity.User;
import shopstack_backend.entity.Warehouse;
import shopstack_backend.repository.UserRepository;
import shopstack_backend.repository.WarehouseRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WarehouseStaffService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private WarehouseService warehouseService;

    @Autowired
    private ReturnService returnService;

    // ---------------------------------------------------------------
    // Admin: manage warehouse staff accounts
    // ---------------------------------------------------------------

    @Transactional
    public WarehouseStaffResponseDTO createWarehouseStaff(CreateWarehouseStaffRequestDTO request) {
        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new IllegalArgumentException("Full name is required.");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters.");
        }
        if (request.getWarehouseId() == null) {
            throw new IllegalArgumentException("A warehouse must be selected for this staff member.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found."));

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.WAREHOUSE_STAFF);
        user.setAssignedWarehouse(warehouse);

        return toDTO(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<WarehouseStaffResponseDTO> getAllWarehouseStaff() {
        return userRepository.findByRoleOrderByFullNameAsc(Role.WAREHOUSE_STAFF).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public WarehouseStaffResponseDTO reassignWarehouseStaff(Long userId, Long warehouseId) {
        User user = getStaffUserOrThrow(userId);
        if (warehouseId == null) {
            throw new IllegalArgumentException("A warehouse must be selected.");
        }
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found."));
        user.setAssignedWarehouse(warehouse);
        return toDTO(userRepository.save(user));
    }

    @Transactional
    public void deleteWarehouseStaff(Long userId) {
        User user = getStaffUserOrThrow(userId);
        userRepository.delete(user);
    }

    private User getStaffUserOrThrow(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Staff account not found."));
        if (user.getRole() != Role.WAREHOUSE_STAFF) {
            throw new IllegalArgumentException("This account is not a warehouse staff account.");
        }
        return user;
    }

    private WarehouseStaffResponseDTO toDTO(User user) {
        WarehouseStaffResponseDTO dto = new WarehouseStaffResponseDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        if (user.getAssignedWarehouse() != null) {
            dto.setWarehouseId(user.getAssignedWarehouse().getId());
            dto.setWarehouseName(user.getAssignedWarehouse().getName());
        }
        return dto;
    }

    // ---------------------------------------------------------------
    // Warehouse staff: self-service, scoped to their own warehouse only
    // ---------------------------------------------------------------

    private User getSelfOrThrow(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        if (user.getRole() != Role.WAREHOUSE_STAFF) {
            throw new SecurityException("This account is not a warehouse staff account.");
        }
        if (user.getAssignedWarehouse() == null) {
            throw new IllegalStateException(
                    "You haven't been assigned to a warehouse yet. Contact an administrator.");
        }
        return user;
    }

    @Transactional(readOnly = true)
    public WarehouseStaffResponseDTO getMyProfile(String email) {
        return toDTO(getSelfOrThrow(email));
    }

    @Transactional(readOnly = true)
    public List<WarehouseStockResponseDTO> getMyStock(String email) {
        User staff = getSelfOrThrow(email);
        return warehouseService.getWarehouseStock(staff.getAssignedWarehouse().getId());
    }

    @Transactional(readOnly = true)
    public List<StockMovementResponseDTO> getMyMovements(String email) {
        User staff = getSelfOrThrow(email);
        return warehouseService.getWarehouseMovements(staff.getAssignedWarehouse().getId());
    }

    @Transactional
    public List<StockAllocationResponseDTO> getMyQueue(String email, AllocationStatus status) {
        User staff = getSelfOrThrow(email);
        return warehouseService.getWarehouseQueue(staff.getAssignedWarehouse().getId(), status);
    }

    @Transactional
    public StockAllocationResponseDTO pick(String email, Long allocationId) {
        User staff = getSelfOrThrow(email);
        warehouseService.assertWarehouseOwnsAllocation(allocationId, staff.getAssignedWarehouse().getId());
        return warehouseService.pick(allocationId);
    }

    @Transactional
    public StockAllocationResponseDTO pack(String email, Long allocationId) {
        User staff = getSelfOrThrow(email);
        warehouseService.assertWarehouseOwnsAllocation(allocationId, staff.getAssignedWarehouse().getId());
        return warehouseService.pack(allocationId);
    }

    @Transactional
    public StockAllocationResponseDTO markReadyForShipment(String email, Long allocationId) {
        User staff = getSelfOrThrow(email);
        warehouseService.assertWarehouseOwnsAllocation(allocationId, staff.getAssignedWarehouse().getId());
        return warehouseService.markReadyForShipment(allocationId);
    }

    @Transactional(readOnly = true)
    public List<ReturnRequestResponseDTO> getMyReturnsForQC(String email) {
        User staff = getSelfOrThrow(email);
        return returnService.getReturnsForWarehouseQC(staff.getAssignedWarehouse().getId());
    }

    @Transactional
    public ReturnRequestResponseDTO performQualityCheck(String email, Long returnRequestId, String result, String note) {
        User staff = getSelfOrThrow(email);
        returnService.assertWarehouseOwnsReturn(returnRequestId, staff.getAssignedWarehouse().getId());
        return returnService.performQualityCheck(returnRequestId, result, note);
    }
}
