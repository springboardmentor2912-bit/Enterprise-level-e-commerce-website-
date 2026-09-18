package shopstack_backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import shopstack_backend.entity.User;
import shopstack_backend.repository.UserRepository;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Get Logged-in User Profile
    @GetMapping("/profile")
    public User getProfile(Authentication authentication) {

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Update Logged-in User Profile
    @PutMapping("/profile")
    public User updateProfile(
            Authentication authentication,
            @RequestBody User updatedUser) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update Full Name
        if (updatedUser.getFullName() != null &&
                !updatedUser.getFullName().isBlank()) {

            user.setFullName(updatedUser.getFullName());
        }

        // Note: Role is intentionally NOT updatable through this endpoint.
        // Allowing a user to set their own role here would let any
        // authenticated user grant themselves ADMINISTRATOR privileges.
        // Role changes should go through a separate admin-only endpoint.

        // Update Password
        if (updatedUser.getPassword() != null &&
                !updatedUser.getPassword().isBlank()) {

            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        return userRepository.save(user);
    }
}