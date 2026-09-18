package shopstack_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import shopstack_backend.dto.BecomeVendorRequestDTO;
import shopstack_backend.service.AccountService;

/**
 * Sits under /api/account/**, which SecurityConfig leaves at the default
 * authenticated()-only rule — any logged-in user can call these, regardless
 * of their primary role. That's deliberate: a CUSTOMER has to be able to
 * call become-vendor before they hold VENDOR authority.
 */
@RestController
@RequestMapping("/api/account")
@CrossOrigin(origins = "http://localhost:5173")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @GetMapping("/me")
    public ResponseEntity<?> getMyAccount(Authentication authentication) {
        try {
            return ResponseEntity.ok(accountService.getMyAccount(authentication.getName()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/become-vendor")
    public ResponseEntity<?> becomeVendor(Authentication authentication,
                                           @RequestBody(required = false) BecomeVendorRequestDTO request) {
        try {
            return ResponseEntity.ok(accountService.becomeVendor(authentication.getName(), request));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
