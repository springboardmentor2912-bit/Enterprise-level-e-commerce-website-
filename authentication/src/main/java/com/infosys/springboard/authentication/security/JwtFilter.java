package com.infosys.springboard.authentication.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.infosys.springboard.authentication.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtFilter(
            JwtService jwtService,
            UserRepository userRepository) {

        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();

        System.out.println();
        System.out.println("========================================");
        System.out.println("JWT FILTER");
        System.out.println("Request Method : " + request.getMethod());
        System.out.println("Request Path   : " + path);
        System.out.println("========================================");

        // =====================================================
        // 1. PUBLIC AUTHENTICATION ENDPOINTS
        // =====================================================

        if (path.equals("/auth/register")
                || path.equals("/auth/login")
                || path.equals("/auth/forgot-password")
                || path.equals("/auth/reset-password")) {

            System.out.println(
                    "Public authentication endpoint - skipping JWT");

            filterChain.doFilter(request, response);
            return;
        }

        // =====================================================
        // 2. GET AUTHORIZATION HEADER
        // =====================================================

        String authHeader =
                request.getHeader("Authorization");

        System.out.println(
                "Authorization Header Present: "
                        + (authHeader != null));

        // =====================================================
        // 3. NO TOKEN
        // =====================================================

        if (authHeader == null
                || !authHeader.startsWith("Bearer ")) {

            System.out.println(
                    "No JWT token found - continuing");

            filterChain.doFilter(request, response);
            return;
        }

        // =====================================================
        // 4. EXTRACT TOKEN
        // =====================================================

        String token =
                authHeader.substring(7).trim();

        if (token.isEmpty()) {

            System.out.println(
                    "JWT token is empty");

            filterChain.doFilter(request, response);
            return;
        }

        try {

            // =================================================
            // 5. VALIDATE TOKEN
            // =================================================

            if (!jwtService.validateToken(token)) {

                System.out.println(
                        "JWT token is INVALID");

                filterChain.doFilter(request, response);
                return;
            }

            System.out.println(
                    "JWT token is VALID");

            // =================================================
            // 6. EXTRACT EMAIL
            // =================================================

            String email =
                    jwtService.extractEmail(token);

            System.out.println(
                    "JWT Email: " + email);

            if (email == null || email.isBlank()) {

                System.out.println(
                        "JWT email is NULL or EMPTY");

                filterChain.doFilter(request, response);
                return;
            }

            // =================================================
            // 7. EXTRACT ROLE
            // =================================================

            String jwtRole =
                    jwtService.extractRole(token);

            System.out.println(
                    "JWT Role: " + jwtRole);

            // =================================================
            // 8. FIND USER IN DATABASE
            // =================================================

            var userOptional =
                    userRepository.findByEmail(email);

            if (userOptional.isEmpty()) {

                System.out.println(
                        "User not found in database: "
                                + email);

                filterChain.doFilter(request, response);
                return;
            }

            var user =
                    userOptional.get();

            System.out.println(
                    "Database User: "
                            + user.getEmail());

            System.out.println(
                    "Database Role: "
                            + user.getRole());

            // =================================================
            // 9. NORMALIZE JWT ROLE
            // =================================================

            String normalizedJwtRole =
                    normalizeRole(jwtRole);

            // =================================================
            // 10. NORMALIZE DATABASE ROLE
            // =================================================

            String normalizedDatabaseRole =
                    normalizeRole(user.getRole());

            System.out.println(
                    "Normalized JWT Role: "
                            + normalizedJwtRole);

            System.out.println(
                    "Normalized Database Role: "
                            + normalizedDatabaseRole);

            // =================================================
            // 11. CHECK ROLE
            // =================================================

            if (normalizedJwtRole == null
                    || normalizedDatabaseRole == null) {

                System.out.println(
                        "Role is NULL");

                filterChain.doFilter(request, response);
                return;
            }

            if (!normalizedJwtRole.equals(
                    normalizedDatabaseRole)) {

                System.out.println(
                        "JWT ROLE DOES NOT MATCH DATABASE ROLE");

                System.out.println(
                        "JWT Role = "
                                + normalizedJwtRole);

                System.out.println(
                        "Database Role = "
                                + normalizedDatabaseRole);

                filterChain.doFilter(request, response);
                return;
            }

            // =================================================
            // 12. CREATE USER DETAILS
            // =================================================

            UserDetails userDetails =
                    org.springframework.security.core.userdetails.User
                            .withUsername(user.getEmail())
                            .password(user.getPassword())
                            .roles(normalizedDatabaseRole)
                            .build();

            // =================================================
            // 13. CREATE AUTHENTICATION
            // =================================================

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            // =================================================
            // 14. SET SECURITY CONTEXT
            // =================================================

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

            // =================================================
            // 15. DEBUG INFORMATION
            // =================================================

            System.out.println(
                    "JWT AUTHENTICATION SUCCESSFUL");

            System.out.println(
                    "Authenticated User: "
                            + userDetails.getUsername());

            System.out.println(
                    "Authorities: "
                            + userDetails.getAuthorities());

            System.out.println(
                    "Security Context Authentication: "
                            + SecurityContextHolder
                                    .getContext()
                                    .getAuthentication());

            System.out.println(
                    "========================================");

        } catch (Exception e) {

            System.out.println(
                    "JWT PROCESSING ERROR");

            System.out.println(
                    "Error Message: "
                            + e.getMessage());

            e.printStackTrace();
        }

        // =====================================================
        // 16. CONTINUE FILTER CHAIN
        // =====================================================

        filterChain.doFilter(request, response);
    }

    // =========================================================
    // NORMALIZE ROLE
    // =========================================================

    private String normalizeRole(String role) {

        if (role == null
                || role.trim().isEmpty()) {

            return null;
        }

        role =
                role.trim()
                        .toUpperCase();

        if (role.startsWith("ROLE_")) {

            role =
                    role.substring(5);
        }

        return role;
    }
}