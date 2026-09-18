package shopstack_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import shopstack_backend.dto.CreateWarehouseStaffRequestDTO;
import shopstack_backend.dto.ReassignWarehouseStaffRequestDTO;
import shopstack_backend.dto.WarehouseStaffResponseDTO;
import shopstack_backend.service.WarehouseStaffService;

import java.util.List;

/**
 * Admin-only warehouse staff management. Sits under /api/admin/**, which
 * SecurityConfig already restricts to hasRole('ADMINISTRATOR'), so no
 * per-method @PreAuthorize is needed here — same pattern as WarehouseController.
 */
@RestController
@RequestMapping("/api/admin/warehouse-staff")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminWarehouseStaffController {

    @Autowired
    private WarehouseStaffService warehouseStaffService;

    @PostMapping
    public ResponseEntity<?> createStaff(@RequestBody CreateWarehouseStaffRequestDTO request) {
        try {
            return ResponseEntity.ok(warehouseStaffService.createWarehouseStaff(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<WarehouseStaffResponseDTO>> getAllStaff() {
        return ResponseEntity.ok(warehouseStaffService.getAllWarehouseStaff());
    }

    @PatchMapping("/{id}/reassign")
    public ResponseEntity<?> reassignStaff(@PathVariable Long id,
                                            @RequestBody ReassignWarehouseStaffRequestDTO request) {
        try {
            return ResponseEntity.ok(
                    warehouseStaffService.reassignWarehouseStaff(id, request.getWarehouseId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable Long id) {
        try {
            warehouseStaffService.deleteWarehouseStaff(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
