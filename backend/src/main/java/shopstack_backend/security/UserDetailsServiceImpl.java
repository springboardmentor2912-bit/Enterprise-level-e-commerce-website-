package shopstack_backend.security;

import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import shopstack_backend.entity.Role;
import shopstack_backend.entity.User;
import shopstack_backend.repository.UserRepository;
import shopstack_backend.repository.VendorRepository;

import java.util.LinkedHashSet;
import java.util.Set;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;

    public UserDetailsServiceImpl(UserRepository userRepository, VendorRepository vendorRepository) {
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

        // Multi-role support: an account's primary role (User.role) is
        // always granted, EXCEPT when that role is VENDOR and the vendor
        // profile isn't APPROVED yet — a PENDING/REJECTED vendor should be
        // able to log in (e.g. to see their application status) but must
        // not pass hasRole("VENDOR") on any /api/vendor/** endpoint until
        // an admin actually approves them.
        //
        // Separately, an account whose primary role ISN'T vendor can still
        // gain VENDOR authority by having an APPROVED vendor profile of
        // their own (a CUSTOMER who used "Become a Vendor" and was
        // approved) — checking existence alone here would grant vendor
        // access the instant the request is submitted, before any
        // approval happens at all.
        Set<String> roleNames = new LinkedHashSet<>();

        boolean hasApprovedVendorProfile = vendorRepository.findByUser(user)
                .map(v -> "APPROVED".equalsIgnoreCase(v.getStatus()))
                .orElse(false);

        if (user.getRole() == Role.VENDOR) {
            if (hasApprovedVendorProfile) {
                roleNames.add(Role.VENDOR.name());
            }
            // else: PENDING/REJECTED — no VENDOR authority yet.
        } else {
            roleNames.add(user.getRole().name());
            if (hasApprovedVendorProfile) {
                roleNames.add(Role.VENDOR.name());
            }
        }

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .roles(roleNames.toArray(new String[0]))
                .build();
    }
}
