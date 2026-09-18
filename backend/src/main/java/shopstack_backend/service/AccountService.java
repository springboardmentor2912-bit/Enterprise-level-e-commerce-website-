package shopstack_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import shopstack_backend.dto.AccountInfoResponseDTO;
import shopstack_backend.dto.BecomeVendorRequestDTO;
import shopstack_backend.entity.Role;
import shopstack_backend.entity.User;
import shopstack_backend.entity.Vendor;
import shopstack_backend.repository.UserRepository;
import shopstack_backend.repository.VendorRepository;

import java.util.Optional;

@Service
public class AccountService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Transactional(readOnly = true)
    public AccountInfoResponseDTO getMyAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        return toDTO(user);
    }

    // Lets an existing account (typically a CUSTOMER) gain a Vendor
    // profile WITHOUT creating a second account — the same login then
    // works for both customer browsing and vendor product management,
    // once admin approves the application.
    @Transactional
    public AccountInfoResponseDTO becomeVendor(String email, BecomeVendorRequestDTO request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (user.getRole() == Role.VENDOR) {
            throw new IllegalStateException("This account is already registered as a vendor.");
        }

        String businessName = (request != null && request.getBusinessName() != null && !request.getBusinessName().isBlank())
                ? request.getBusinessName().trim()
                : user.getFullName();

        Optional<Vendor> existing = vendorRepository.findByUser(user);
        if (existing.isPresent()) {
            String status = existing.get().getStatus();
            if ("APPROVED".equalsIgnoreCase(status)) {
                throw new IllegalStateException("This account already has a vendor profile.");
            }
            if ("PENDING".equalsIgnoreCase(status)) {
                throw new IllegalStateException("Your vendor application is still awaiting admin approval.");
            }
            // REJECTED — allow a fresh attempt instead of a permanent
            // lockout after a single rejection (same principle as return
            // requests: a rejection shouldn't bar every future attempt).
            Vendor vendor = existing.get();
            vendor.setName(businessName);
            vendor.setPhone(request != null ? request.getPhone() : null);
            vendor.setDescription(request != null ? request.getDescription() : null);
            vendor.setStatus("PENDING");
            vendorRepository.save(vendor);
            return toDTO(user);
        }

        Vendor vendor = new Vendor();
        vendor.setName(businessName);
        vendor.setEmail(user.getEmail());
        vendor.setPhone(request != null ? request.getPhone() : null);
        vendor.setDescription(request != null ? request.getDescription() : null);
        // Requires admin approval before this vendor can list products or
        // access any /api/vendor/** endpoint — see UserDetailsServiceImpl
        // (authority granting) and AdminController's /vendors/{id}/approve|reject.
        vendor.setStatus("PENDING");
        vendor.setUser(user);
        vendorRepository.save(vendor);

        return toDTO(user);
    }

    private AccountInfoResponseDTO toDTO(User user) {
        AccountInfoResponseDTO dto = new AccountInfoResponseDTO();
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPrimaryRole(user.getRole().name());

        Optional<Vendor> vendor = vendorRepository.findByUser(user);
        // isVendor means "actually has vendor ACCESS right now" — an
        // unapproved (PENDING/REJECTED) profile must not flip this true,
        // or the frontend would grant vendor UI/routes before an admin
        // ever approved anything.
        boolean isApprovedVendor = vendor.map(v -> "APPROVED".equalsIgnoreCase(v.getStatus())).orElse(false);
        dto.setVendor(isApprovedVendor);
        vendor.ifPresent(v -> {
            dto.setVendorId(v.getId());
            dto.setVendorStatus(v.getStatus());
        });

        return dto;
    }
}
