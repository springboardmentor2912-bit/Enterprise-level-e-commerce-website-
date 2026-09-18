package shopstack_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import shopstack_backend.dto.ResolveReturnRequestDTO;
import shopstack_backend.dto.ReturnRequestResponseDTO;
import shopstack_backend.service.ReturnService;

import java.util.List;

/**
 * Admin-only return handling: review, approve, or reject a customer's
 * return request. Once approved, the return is routed to a warehouse for
 * physical QC — that inspection step belongs to that warehouse's own
 * staff (see WarehouseStaffController), not admin. Kept separate from the
 * customer/vendor-facing ReturnController, and locked down the same way
 * AdminController is — via a class-level @PreAuthorize rather than
 * relying on a URL prefix.
 */
@RestController
@RequestMapping("/api/admin/returns")
@PreAuthorize("hasRole('ADMINISTRATOR')")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminReturnController {

    @Autowired
    private ReturnService returnService;

    @GetMapping
    public ResponseEntity<List<ReturnRequestResponseDTO>> getAllReturnRequests() {
        return ResponseEntity.ok(returnService.getAllReturnRequests());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveReturn(@PathVariable Long id,
                                            @RequestBody(required = false) ResolveReturnRequestDTO request) {
        try {
            String note = request != null ? request.getResolutionNote() : null;
            return ResponseEntity.ok(returnService.approveReturn(id, note));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectReturn(@PathVariable Long id,
                                           @RequestBody(required = false) ResolveReturnRequestDTO request) {
        try {
            String note = request != null ? request.getResolutionNote() : null;
            return ResponseEntity.ok(returnService.rejectReturn(id, note));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Note: performing the physical QC (accept & restock vs. damaged &
    // quarantine) is deliberately NOT exposed here. Per the fulfillment
    // workflow, once admin approves a return, only the warehouse it's
    // routed to can inspect it (WarehouseStaffController, /api/warehouse-staff/**).
    // Admin's job on returns stops at approve/reject.
}