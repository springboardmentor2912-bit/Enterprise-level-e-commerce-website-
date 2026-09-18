package shopstack_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import shopstack_backend.entity.Refund;
import shopstack_backend.service.RefundService;

import java.util.List;

/**
 * Sits under /api/admin/**, which SecurityConfig already restricts to
 * hasRole('ADMINISTRATOR') — same pattern as WarehouseController.
 */
@RestController
@RequestMapping("/api/admin/refunds")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminRefundController {

    @Autowired
    private RefundService refundService;

    @GetMapping("/failed")
    public ResponseEntity<List<Refund>> getFailedRefunds() {
        return ResponseEntity.ok(refundService.getFailedRefunds());
    }

    @PostMapping("/{id}/retry")
    public ResponseEntity<?> retryRefund(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(refundService.retryRefund(id));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
