package com.shopstack.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.razorpay.RazorpayException;
import com.shopstack.backend.config.RazorpayConfig;
import com.shopstack.backend.model.Order;
import com.shopstack.backend.model.Refund;
import com.shopstack.backend.repository.RefundRepository;
import com.shopstack.backend.service.PaymentService;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private RazorpayConfig razorpayConfig;

    @Autowired
    private RefundRepository refundRepository;

    /**
     * Public endpoint to get Razorpay public key configuration
     */
    @GetMapping("/config")
    public ResponseEntity<?> getPaymentConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("keyId", razorpayConfig.getKeyId());
        config.put("currency", "INR");
        return ResponseEntity.ok(config);
    }

    /**
     * Create Razorpay Order before opening Checkout
     */
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> payload) {
        try {
            if (!payload.containsKey("amount")) {
                return ResponseEntity.badRequest().body("Amount is required.");
            }

            double amount = Double.parseDouble(payload.get("amount").toString());
            String receipt = payload.containsKey("receipt") ? payload.get("receipt").toString() : null;

            Map<String, Object> razorpayOrder = paymentService.createRazorpayOrder(amount, receipt);
            return ResponseEntity.ok(razorpayOrder);
        } catch (RazorpayException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Razorpay order creation failed: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    /**
     * Verify payment signature and place confirmed order
     */
    @PostMapping("/verify-and-order")
    public ResponseEntity<?> verifyAndOrder(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.parseLong(payload.get("userId").toString());
            List<Map<String, Object>> itemsList = (List<Map<String, Object>>) payload.get("items");
            String paymentMethod = payload.containsKey("paymentMethod") && payload.get("paymentMethod") != null 
                    ? payload.get("paymentMethod").toString() : "RAZORPAY";
            
            Map<String, Object> deliveryInfo = (Map<String, Object>) payload.get("deliveryInfo");

            String razorpayOrderId = payload.containsKey("razorpayOrderId") && payload.get("razorpayOrderId") != null 
                    ? payload.get("razorpayOrderId").toString() : null;
            String razorpayPaymentId = payload.containsKey("razorpayPaymentId") && payload.get("razorpayPaymentId") != null 
                    ? payload.get("razorpayPaymentId").toString() : null;
            String razorpaySignature = payload.containsKey("razorpaySignature") && payload.get("razorpaySignature") != null 
                    ? payload.get("razorpaySignature").toString() : null;

            // If paying through Razorpay, verify cryptographic signature
            if ("RAZORPAY".equalsIgnoreCase(paymentMethod)) {
                if (razorpayOrderId == null || razorpayPaymentId == null || razorpaySignature == null) {
                    return ResponseEntity.badRequest().body("Missing Razorpay transaction details for signature verification.");
                }

                boolean isValidSignature = paymentService.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
                if (!isValidSignature) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Payment signature verification failed. Untrusted transaction.");
                }
            }

            String couponCode = payload.containsKey("couponCode") && payload.get("couponCode") != null 
                    ? payload.get("couponCode").toString() : null;

            // Place verified order in the database
            Order order = paymentService.placeVerifiedOrder(
                    userId, 
                    itemsList, 
                    paymentMethod, 
                    razorpayOrderId, 
                    razorpayPaymentId, 
                    deliveryInfo,
                    couponCode
            );

            return ResponseEntity.ok(order);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Order placement failed: " + e.getMessage());
        }
    }

    /**
     * Customer initiates a return & refund request.
     * Status is set to PENDING (awaiting return delivery and quality check).
     */
    @PostMapping("/refund/request")
    public ResponseEntity<?> requestRefund(@RequestBody Map<String, Object> payload) {
        try {
            if (!payload.containsKey("orderId")) {
                return ResponseEntity.badRequest().body("Order ID is required.");
            }

            String orderId = payload.get("orderId").toString();
            Double amount = payload.containsKey("amount") && payload.get("amount") != null 
                    ? Double.parseDouble(payload.get("amount").toString()) : null;
            String returnReasonCategory = payload.containsKey("returnReasonCategory") && payload.get("returnReasonCategory") != null 
                    ? payload.get("returnReasonCategory").toString() : "CHANGED_MIND";
            String resolutionType = payload.containsKey("resolutionType") && payload.get("resolutionType") != null 
                    ? payload.get("resolutionType").toString() : "REFUND";
            String reason = payload.containsKey("reason") && payload.get("reason") != null 
                    ? payload.get("reason").toString() : "Customer Requested Return";
            String customerNotes = payload.containsKey("customerNotes") && payload.get("customerNotes") != null 
                    ? payload.get("customerNotes").toString() : "";
            String customerProofImage = payload.containsKey("customerProofImage") && payload.get("customerProofImage") != null 
                    ? payload.get("customerProofImage").toString() : null;

            Refund refund = paymentService.requestReturn(orderId, amount, returnReasonCategory, resolutionType, reason, customerNotes, customerProofImage);
            return ResponseEntity.ok(refund);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to submit return request: " + e.getMessage());
        }
    }

    /**
     * Direct refund processing (Admin immediate override or existing flow)
     */
    @PostMapping("/refund")
    public ResponseEntity<?> processRefund(@RequestBody Map<String, Object> payload) {
        try {
            if (!payload.containsKey("orderId")) {
                return ResponseEntity.badRequest().body("Order ID is required.");
            }

            String orderId = payload.get("orderId").toString();
            Double amount = null;
            if (payload.containsKey("amount") && payload.get("amount") != null) {
                amount = Double.parseDouble(payload.get("amount").toString());
            }
            String reason = payload.containsKey("reason") && payload.get("reason") != null 
                    ? payload.get("reason").toString() : "Admin Authorized Refund";

            Refund refund = paymentService.processRefund(orderId, amount, reason);
            return ResponseEntity.ok(refund);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Refund processing failed: " + e.getMessage());
        }
    }

    /**
     * Get refund history/records for a specific order
     */
    @GetMapping("/refund/{orderId}")
    public ResponseEntity<?> getOrderRefunds(@PathVariable String orderId) {
        try {
            List<Refund> refunds = refundRepository.findByOrderIdOrderByIdDesc(orderId);
            return ResponseEntity.ok(refunds);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch refund history: " + e.getMessage());
        }
    }

    // Vendor review return request
    @PutMapping("/refunds/{refundId}/vendor-review")
    public ResponseEntity<?> vendorReviewReturn(@PathVariable Long refundId, @RequestBody Map<String, String> payload) {
        try {
            String action = payload.get("action");
            String notes = payload.get("notes");
            Refund refund = paymentService.reviewReturnRequest(refundId, action, notes);
            return ResponseEntity.ok(refund);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Vendor review failed: " + e.getMessage());
        }
    }

    // Warehouse marks return package as received
    @PutMapping("/refunds/{refundId}/receive")
    public ResponseEntity<?> receiveReturnPackage(@PathVariable Long refundId) {
        try {
            Refund refund = paymentService.markRefundPackageReceived(refundId);
            return ResponseEntity.ok(refund);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to mark package as received: " + e.getMessage());
        }
    }

    // Warehouse return QC inspection
    @PutMapping("/refunds/{refundId}/qc-inspection")
    public ResponseEntity<?> warehouseQcInspection(@PathVariable Long refundId, @RequestBody Map<String, Object> payload) {
        try {
            boolean passed = (Boolean) payload.get("passed");
            String restockOption = payload.containsKey("restockOption") ? payload.get("restockOption").toString() : "DAMAGED";
            Long warehouseId = payload.containsKey("warehouseId") && payload.get("warehouseId") != null 
                    ? Long.parseLong(payload.get("warehouseId").toString()) : null;
            String notes = payload.containsKey("notes") ? payload.get("notes").toString() : "";
            String warehouseInspectionImage = payload.containsKey("warehouseInspectionImage") && payload.get("warehouseInspectionImage") != null 
                    ? payload.get("warehouseInspectionImage").toString() : null;
            
            Refund refund = paymentService.processReturnQcInspection(refundId, passed, restockOption, warehouseId, notes, warehouseInspectionImage);
            return ResponseEntity.ok(refund);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("QC inspection failed: " + e.getMessage());
        }
    }

    // Admin Resolve Return (disburse refund, dispatch replacement, or exchange)
    @PostMapping("/refunds/{refundId}/resolve")
    public ResponseEntity<?> resolveReturn(@PathVariable Long refundId, @RequestBody Map<String, String> payload) {
        try {
            String resolution = payload.get("resolution");
            String method = payload.containsKey("method") ? payload.get("method") : "ORIGINAL_PAYMENT";
            String adminNotes = payload.containsKey("adminNotes") ? payload.get("adminNotes") : "Resolved by Admin.";
            
            Refund refund = paymentService.resolveReturnRequest(refundId, resolution, method, adminNotes);
            return ResponseEntity.ok(refund);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Fulfillment resolution failed: " + e.getMessage());
        }
    }

    /**
     * Transaction history with optional filters (userId, vendorId, status, paymentStatus)
     */
    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long vendorId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus) {
        try {
            List<Map<String, Object>> txs = paymentService.getTransactions(userId, vendorId, status, paymentStatus);
            return ResponseEntity.ok(txs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve transactions: " + e.getMessage());
        }
    }

    /**
     * Get live payment & fulfillment status for an order
     */
    @GetMapping("/status/{orderId}")
    public ResponseEntity<?> getPaymentStatus(@PathVariable String orderId) {
        try {
            Map<String, Object> details = paymentService.getPaymentStatusDetails(orderId);
            if (details == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch payment status: " + e.getMessage());
        }
    }

    /**
     * Record a failed or dismissed checkout attempt for payment status monitoring
     */
    @PostMapping("/record-failed")
    public ResponseEntity<?> recordFailedPayment(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = payload.containsKey("userId") && payload.get("userId") != null 
                    ? Long.parseLong(payload.get("userId").toString()) : null;
            String razorpayOrderId = payload.containsKey("razorpayOrderId") && payload.get("razorpayOrderId") != null 
                    ? payload.get("razorpayOrderId").toString() : null;
            String errorMessage = payload.containsKey("errorMessage") && payload.get("errorMessage") != null 
                    ? payload.get("errorMessage").toString() : "Checkout Dismissed / Failed";
            Double amount = payload.containsKey("amount") && payload.get("amount") != null 
                    ? Double.parseDouble(payload.get("amount").toString()) : 0.0;
            List<Map<String, Object>> items = payload.containsKey("items") 
                    ? (List<Map<String, Object>>) payload.get("items") : null;
            Map<String, Object> deliveryInfo = payload.containsKey("deliveryInfo") 
                    ? (Map<String, Object>) payload.get("deliveryInfo") : null;

            paymentService.recordFailedPayment(userId, razorpayOrderId, errorMessage, amount, items, deliveryInfo);
            Map<String, Object> resp = new HashMap<>();
            resp.put("status", "recorded");
            resp.put("message", "Payment failure logged");
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> resp = new HashMap<>();
            resp.put("status", "error");
            resp.put("message", e.getMessage());
            return ResponseEntity.ok(resp);
        }
    }
}
