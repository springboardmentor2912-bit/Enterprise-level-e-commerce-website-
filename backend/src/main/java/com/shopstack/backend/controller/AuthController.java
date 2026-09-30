package com.shopstack.backend.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.backend.model.User;
import com.shopstack.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(originPatterns = "*", allowCredentials = "true") // Allow React Frontend & Mobile devices
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.shopstack.backend.repository.WarehouseRepository warehouseRepository;

    @Autowired
    private com.shopstack.backend.service.CloudSyncService cloudSyncService;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (user.getEmail() == null || user.getRole() == null) {
            return ResponseEntity.badRequest().body("Error: Email and Role are required!");
        }

        String email = user.getEmail().trim().toLowerCase();
        String role = user.getRole().toUpperCase();

        if (role.equals("ADMINISTRATOR") && !email.endsWith("@admin")) {
            return ResponseEntity.badRequest().body("Error: Administrator email must end with @admin (e.g. name@admin)");
        }
        if (role.equals("WAREHOUSE_STAFF") && !email.endsWith("@staff")) {
            return ResponseEntity.badRequest().body("Error: Warehouse Staff email must end with @staff (e.g. name@staff)");
        }
        if (role.equals("CUSTOMER") && (email.endsWith("@admin") || email.endsWith("@seller") || email.endsWith("@staff"))) {
            return ResponseEntity.badRequest().body("Error: Customer email cannot end with restricted domains (@admin, @seller, @staff)");
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.badRequest().body("Error: Email is already registered!");
        }

        user.setEmail(email);

        if (user.getFullName() == null || user.getFullName().trim().isEmpty()) {
            String prefix = email.split("@")[0].replaceAll("[._-]", " ");
            user.setFullName(Character.toUpperCase(prefix.charAt(0)) + (prefix.length() > 1 ? prefix.substring(1) : ""));
        }

        String generatedCode = null;
        if (role.equals("VENDOR")) {
            generatedCode = (user.getVendorCode() != null && user.getVendorCode().trim().length() == 6)
                    ? user.getVendorCode().trim()
                    : String.valueOf((int)(100000 + Math.random() * 900000));
            user.setVendorCode(generatedCode);
            if (user.getCommissionRate() == null) {
                user.setCommissionRate(10.0);
            }
        }

        if (role.equals("WAREHOUSE_STAFF")) {
            if (user.getWarehouseId() != null) {
                warehouseRepository.findById(user.getWarehouseId()).ifPresent(wh -> {
                    user.setWarehouseName(wh.getName() + " (" + wh.getCode() + ")");
                });
            } else {
                warehouseRepository.findAll().stream().findFirst().ifPresent(wh -> {
                    user.setWarehouseId(wh.getId());
                    user.setWarehouseName(wh.getName() + " (" + wh.getCode() + ")");
                });
            }
        }

        User savedUser = userRepository.saveAndFlush(user);
        System.out.println(">>> User registered and saved in PostgreSQL database: " + savedUser.getEmail() + " [ID: " + savedUser.getId() + ", Role: " + savedUser.getRole() + "]");
        cloudSyncService.pushUserToCloud(savedUser);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("message", "User registered successfully!");
        response.put("user", savedUser);
        if (generatedCode != null) {
            response.put("vendorCode", generatedCode);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    @Transactional
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String vendorCode = request.get("vendorCode");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body("Error: Email and password are required.");
        }

        email = email.trim().toLowerCase();

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        
        // If user does not exist yet, auto-provision and save to PostgreSQL database
        if (userOpt.isEmpty()) {
            if (vendorCode != null && !vendorCode.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Vendor ID not detected.");
            }

            User newUser = new User();
            newUser.setEmail(email);
            newUser.setPassword(password);

            String prefix = email.split("@")[0].replaceAll("[._-]", " ");
            String defaultName = Character.toUpperCase(prefix.charAt(0)) + (prefix.length() > 1 ? prefix.substring(1) : "");
            newUser.setFullName(defaultName);

            if (email.endsWith("@admin")) {
                newUser.setRole("ADMINISTRATOR");
            } else if (email.endsWith("@staff")) {
                newUser.setRole("WAREHOUSE_STAFF");
                warehouseRepository.findAll().stream().findFirst().ifPresent(wh -> {
                    newUser.setWarehouseId(wh.getId());
                    newUser.setWarehouseName(wh.getName() + " (" + wh.getCode() + ")");
                });
            } else {
                newUser.setRole("CUSTOMER");
            }

            User persistedUser = userRepository.saveAndFlush(newUser);
            System.out.println(">>> User auto-provisioned and saved on login in PostgreSQL database: " + persistedUser.getEmail() + " [ID: " + persistedUser.getId() + ", Role: " + persistedUser.getRole() + "]");
            cloudSyncService.pushUserToCloud(persistedUser);
            return ResponseEntity.ok(persistedUser);
        }

        // If user already exists in PostgreSQL database
        User user = userOpt.get();
        if (!user.getPassword().equals(password)) {
            return ResponseEntity.status(401).body("Invalid email or password!");
        }

        user.setEmail(email);

        // If user fills in a vendor ID, strictly verify if user is an assigned vendor with that ID
        if (vendorCode != null && !vendorCode.trim().isEmpty()) {
            // Staff and Admins cannot log in as vendors with a vendor ID
            if (email.endsWith("@admin") || "ADMINISTRATOR".equalsIgnoreCase(user.getRole()) || "ADMIN".equalsIgnoreCase(user.getRole())) {
                return ResponseEntity.badRequest().body("Vendor ID not detected.");
            }
            if (email.endsWith("@staff") || "WAREHOUSE_STAFF".equalsIgnoreCase(user.getRole())) {
                return ResponseEntity.badRequest().body("Vendor ID not detected.");
            }

            String storedCode = user.getVendorCode();
            if (storedCode == null || storedCode.trim().isEmpty() || !vendorCode.trim().equals(storedCode)) {
                return ResponseEntity.badRequest().body("Vendor ID not detected.");
            }
            user.setRole("VENDOR");
        } 
        else if (email.endsWith("@admin") || "ADMINISTRATOR".equalsIgnoreCase(user.getRole()) || "ADMIN".equalsIgnoreCase(user.getRole())) {
            // Admins log in as Administrator
            user.setRole("ADMINISTRATOR");
        } 
        else if (email.endsWith("@staff") || "WAREHOUSE_STAFF".equalsIgnoreCase(user.getRole())) {
            // Warehouse staff log in as Warehouse Staff
            user.setRole("WAREHOUSE_STAFF");
            if (user.getWarehouseId() == null) {
                warehouseRepository.findAll().stream().findFirst().ifPresent(wh -> {
                    user.setWarehouseId(wh.getId());
                    user.setWarehouseName(wh.getName() + " (" + wh.getCode() + ")");
                });
            }
        } 
        else {
            // Customers and Vendors without vendor ID log in as standard Customer
            user.setRole("CUSTOMER");
        }

        User updatedUser = userRepository.saveAndFlush(user);
        System.out.println(">>> User login verified and synced to PostgreSQL database: " + updatedUser.getEmail() + " [ID: " + updatedUser.getId() + ", Role: " + updatedUser.getRole() + "]");
        cloudSyncService.pushUserToCloud(updatedUser);
        return ResponseEntity.ok(updatedUser);
    }

    // Endpoint to allow user role switching based on strict rules matrix & 6-digit Vendor ID
    @PutMapping("/customer/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        User user = userOptional.get();
        String currentRole = user.getRole().toUpperCase();
        String newRole = request.get("role");
        if (newRole == null) {
            return ResponseEntity.badRequest().body("Error: Role is required");
        }
        newRole = newRole.toUpperCase();
        String email = user.getEmail().toLowerCase();

        // Role switching rules:
        if (currentRole.equals("CUSTOMER")) {
            if (newRole.equals("VENDOR")) {
                String existingCode = user.getVendorCode();
                if (existingCode == null || existingCode.trim().isEmpty()) {
                    // First time upgrade: Generate a new 6-digit unique code
                    String code = String.valueOf((int)(100000 + Math.random() * 900000));
                    user.setVendorCode(code);
                    user.setRole("VENDOR");
                } else {
                    // Subsequent switch: Validate the provided vendor code
                    String providedCode = request.get("vendorCode");
                    if (providedCode == null || !providedCode.trim().equals(existingCode)) {
                        return ResponseEntity.badRequest().body("Error: Invalid 6-digit Vendor ID. Switch denied.");
                    }
                    user.setRole("VENDOR");
                }
            } else {
                return ResponseEntity.badRequest().body("Error: Customer accounts can only switch to Vendor mode.");
            }
        } 
        else if (currentRole.equals("VENDOR")) {
            if (newRole.equals("CUSTOMER")) {
                user.setRole("CUSTOMER");
            } else {
                return ResponseEntity.badRequest().body("Error: Vendor accounts can only switch to Customer mode.");
            }
        } 
        else if (currentRole.equals("ADMINISTRATOR") || currentRole.equals("ADMIN")) {
            return ResponseEntity.badRequest().body("Error: Administrator accounts cannot switch user profiles.");
        } 
        else if (currentRole.equals("WAREHOUSE_STAFF")) {
            return ResponseEntity.badRequest().body("Error: Warehouse staff accounts cannot switch user profiles.");
        } else {
            return ResponseEntity.badRequest().body("Error: Unknown user role.");
        }

        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Email is required.");
        }
        email = email.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Error: No account found with this email address.");
        }
        return ResponseEntity.ok(Map.of("message", "Email verified. You can now reset your password."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        if (email == null || newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Email and new password are required.");
        }
        email = email.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Error: No account found with this email address.");
        }
        User user = userOpt.get();
        user.setPassword(newPassword);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully! You can now log in with your new password."));
    }
}