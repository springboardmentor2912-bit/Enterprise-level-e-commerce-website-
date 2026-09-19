package com.shopstack.backend.filter;

import com.shopstack.backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        System.out.println("========== JWT FILTER ==========");
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Request Method: " + request.getMethod());

        String authHeader = request.getHeader("Authorization");

        System.out.println(
                "Authorization Header: " +
                        (authHeader != null ? "Present" : "Not Present")
        );

        // =================================================
        // NO AUTHORIZATION HEADER
        // =================================================

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            System.out.println(
                    "No Bearer token - continuing request"
            );

            filterChain.doFilter(request, response);
            return;
        }

        // =================================================
        // EXTRACT TOKEN
        // =================================================

        String token = authHeader.substring(7);

        try {

            // =============================================
            // EXTRACT USER DETAILS FROM JWT
            // =============================================

            String email = jwtService.extractEmail(token);
            String role = jwtService.extractRole(token);

            System.out.println("Email: " + email);
            System.out.println("Role: " + role);

            // =============================================
            // ONLY SET AUTHENTICATION IF CONTEXT IS EMPTY
            // =============================================

            if (SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                List.of(
                                        new SimpleGrantedAuthority(
                                                "ROLE_" + role
                                        )
                                )
                        );

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);

                System.out.println(
                        "AUTHENTICATED: " +
                                SecurityContextHolder
                                        .getContext()
                                        .getAuthentication()
                );

                System.out.println(
                        "AUTHORITIES: " +
                                SecurityContextHolder
                                        .getContext()
                                        .getAuthentication()
                                        .getAuthorities()
                );

                System.out.println(
                        "IS AUTHENTICATED: " +
                                SecurityContextHolder
                                        .getContext()
                                        .getAuthentication()
                                        .isAuthenticated()
                );

            } else {

                System.out.println(
                        "SecurityContext already contains authentication"
                );
            }

        } catch (Exception e) {

            // =============================================
            // INVALID JWT
            // =============================================

            System.out.println(
                    "JWT ERROR: " + e.getMessage()
            );

            // Do NOT create authentication
            // for an invalid token.
        }

        // =================================================
        // CONTINUE REQUEST
        // =================================================

        filterChain.doFilter(request, response);
    }
}