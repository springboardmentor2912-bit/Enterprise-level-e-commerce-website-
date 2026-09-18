package com.javaenterprise.admin;

import com.javaenterprise.returnRequest.entity.ReturnStatus;
import com.javaenterprise.returnRequest.service.ReturnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/returns")
@RequiredArgsConstructor
public class AdminReturnController {
    private final ReturnService returnService;

    @GetMapping
    public ResponseEntity<?> getAllReturns() {
        return ResponseEntity.ok(returnService.getAllReturns());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestParam ReturnStatus status,
                                          @RequestParam(defaultValue = "false") boolean restock) {
        return ResponseEntity.ok(returnService.updateStatus(id, status, restock));
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<?> processRefund(@PathVariable Long id) {
        returnService.processRefund(id);
        return ResponseEntity.ok("Refund processed successfully");
    }
}
