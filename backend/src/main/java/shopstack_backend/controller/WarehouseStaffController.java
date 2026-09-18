package shopstack_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import shopstack_backend.dto.QualityCheckRequestDTO;
import shopstack_backend.dto.ReturnRequestResponseDTO;
import shopstack_backend.dto.StockAllocationResponseDTO;
import shopstack_backend.dto.StockMovementResponseDTO;
import shopstack_backend.dto.WarehouseStaffResponseDTO;
import shopstack_backend.dto.WarehouseStockResponseDTO;
import shopstack_backend.entity.AllocationStatus;
import shopstack_backend.service.WarehouseStaffService;

import java.util.List;

/**
 * Self-service portal for a WAREHOUSE_STAFF user. Every endpoint here is
 * scoped server-side to the calling user's own assigned warehouse — there
 * is deliberately no warehouseId path/query parameter, so a staff member
 * can never view or act on another warehouse's orders or stock.
 *
 * Covers: receiving allocated orders, pick -> pack -> ready for shipment,
 * stock/movement visibility, and performing return QC (accept & restock,
 * or damaged & quarantine) for returns routed to their warehouse.
 */
@RestController
@RequestMapping("/api/warehouse-staff")
@CrossOrigin(origins = "http://localhost:5173")
public class WarehouseStaffController {

    @Autowired
    private WarehouseStaffService warehouseStaffService;

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        try {
            return ResponseEntity.ok(warehouseStaffService.getMyProfile(authentication.getName()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ---- Stock visibility for my warehouse ----

    @GetMapping("/stock")
    public ResponseEntity<?> getMyStock(Authentication authentication) {
        try {
            return ResponseEntity.ok(warehouseStaffService.getMyStock(authentication.getName()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/movements")
    public ResponseEntity<?> getMyMovements(Authentication authentication) {
        try {
            return ResponseEntity.ok(warehouseStaffService.getMyMovements(authentication.getName()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ---- Fulfillment queue: orders allocated to my warehouse ----

    @GetMapping("/queue/{status}")
    public ResponseEntity<?> getMyQueue(@PathVariable String status, Authentication authentication) {
        try {
            AllocationStatus allocationStatus = AllocationStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(warehouseStaffService.getMyQueue(authentication.getName(), allocationStatus));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    "\"" + status + "\" is not a valid stage. Use ALLOCATED, PICKED, PACKED, or READY_FOR_SHIPMENT.");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ---- Pick -> Pack -> Ready for shipment ----

    @PatchMapping("/allocations/{allocationId}/pick")
    public ResponseEntity<?> pick(@PathVariable Long allocationId, Authentication authentication) {
        try {
            return ResponseEntity.ok(warehouseStaffService.pick(authentication.getName(), allocationId));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/allocations/{allocationId}/pack")
    public ResponseEntity<?> pack(@PathVariable Long allocationId, Authentication authentication) {
        try {
            return ResponseEntity.ok(warehouseStaffService.pack(authentication.getName(), allocationId));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/allocations/{allocationId}/ready")
    public ResponseEntity<?> markReady(@PathVariable Long allocationId, Authentication authentication) {
        try {
            return ResponseEntity.ok(warehouseStaffService.markReadyForShipment(authentication.getName(), allocationId));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ---- Return QC inbox for my warehouse ----

    @GetMapping("/returns")
    public ResponseEntity<?> getMyReturnsForQC(Authentication authentication) {
        try {
            return ResponseEntity.ok(warehouseStaffService.getMyReturnsForQC(authentication.getName()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ACCEPTED restocks the item as sellable, DAMAGED quarantines it.
    // Either way the customer is refunded — QC only decides what happens
    // to the physical inventory.
    @PutMapping("/returns/{id}/qc")
    public ResponseEntity<?> performQualityCheck(@PathVariable Long id,
                                                  @RequestBody QualityCheckRequestDTO request,
                                                  Authentication authentication) {
        try {
            return ResponseEntity.ok(warehouseStaffService.performQualityCheck(
                    authentication.getName(), id, request.getResult(), request.getNote()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
