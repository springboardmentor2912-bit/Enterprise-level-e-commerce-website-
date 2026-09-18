package shopstack_backend.service;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import shopstack_backend.dto.AuthResponse;
import shopstack_backend.dto.LoginRequest;
import shopstack_backend.dto.RegisterRequest;
import shopstack_backend.entity.PasswordResetToken;
import shopstack_backend.entity.Role;
import shopstack_backend.entity.User;
import shopstack_backend.entity.Vendor;
import shopstack_backend.repository.PasswordResetTokenRepository;
import shopstack_backend.repository.UserRepository;
import shopstack_backend.repository.VendorRepository;
import shopstack_backend.security.JwtService;
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired(required = false)
    private VendorRepository vendorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private EmailService emailService;

    // Register
    public AuthResponse register(RegisterRequest request) {

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return new AuthResponse(null, null, "Email is required.");
        }
        // Normalize so "Test@Gmail.com" and "test@gmail.com" are treated as
        // the same account — case differences alone shouldn't let someone
        // register twice with what's really the same email address.
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            return new AuthResponse(null, null, "An account with this email already exists. Please log in instead.");
        }

        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        userRepository.save(user);
        if (request.getRole() == Role.VENDOR && vendorRepository != null) {
            Vendor vendor = new Vendor();
            vendor.setName(user.getFullName());
            vendor.setEmail(user.getEmail());
            // Requires admin approval before this vendor can list products —
            // see AdminController's /vendors/{id}/approve|reject.
            vendor.setStatus("PENDING");
            vendor.setUser(user);
            vendorRepository.save(vendor);
        }

        // Log the new account straight in, same as a successful login would —
        // this is what lets the navbar/UI update immediately after registering
        // instead of silently doing nothing until a separate manual login.
        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, user.getRole().name(), "Registration Successful");
    }
    // Login
    public AuthResponse login(LoginRequest request) {

        String normalizedEmail = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null;
        Optional<User> optionalUser = userRepository.findByEmailIgnoreCase(normalizedEmail);

        if (optionalUser.isEmpty()) {
            return new AuthResponse(null, null, "User not found");
        }

        User user = optionalUser.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new AuthResponse(null, null, "Invalid Password");
        }

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(token, user.getRole().name(), "Login Successful");
    }
    public String forgotPassword(String email) {

        String normalizedEmail = email != null ? email.trim().toLowerCase() : null;
        Optional<User> optionalUser = userRepository.findByEmailIgnoreCase(normalizedEmail);

        if (optionalUser.isPresent()) {

            User user = optionalUser.get();
            passwordResetTokenRepository.deleteByUser(user);

            String token = UUID.randomUUID().toString();

            PasswordResetToken resetToken = new PasswordResetToken(
                    token,
                    user,
                    LocalDateTime.now().plusMinutes(30)
            );

            passwordResetTokenRepository.save(resetToken);
            System.out.println("PASSWORD RESET LINK for " + user.getEmail() +
                    ": http://localhost:5173/reset-password?token=" + token);

            try {
                emailService.sendPasswordResetEmail(user.getEmail(), token);
            } catch (Exception e) {
                System.err.println("Failed to send reset email to " + user.getEmail() + ": " + e.getMessage());
            }
        }

        return "If an account exists for that email, a reset link has been sent.";
    }

    // Reset Password
    public String resetPassword(String token, String newPassword) {

        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset link"));

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new RuntimeException("This reset link has expired. Please request a new one.");
        }

        if (newPassword == null || newPassword.isBlank()) {
            throw new RuntimeException("Password cannot be empty");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Token is single-use — remove it once it's been used.
        passwordResetTokenRepository.delete(resetToken);

        return "Password has been reset successfully";
    }
}