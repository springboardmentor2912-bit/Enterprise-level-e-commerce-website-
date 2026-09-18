package com.infosys.springboard.authentication.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.infosys.springboard.authentication.security.JwtFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                // =====================================================
                // CSRF
                // =====================================================

                .csrf(csrf -> csrf.disable())

                // =====================================================
                // CORS
                // =====================================================

                .cors(cors -> {})

                // =====================================================
                // SESSION
                // =====================================================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // =====================================================
                // AUTHORIZATION
                // =====================================================

                .authorizeHttpRequests(auth -> auth

                        // =================================================
                        // BACKEND CONNECTION TEST
                        // =================================================

                        .requestMatchers(
                                "/test-connection"
                        ).permitAll()

                        // =================================================
                        // ERROR HANDLING
                        // =================================================

                        .requestMatchers(
                                "/error"
                        ).permitAll()

                        // =================================================
                        // PUBLIC AUTHENTICATION
                        // =================================================

                        .requestMatchers(
                                "/auth/register",
                                "/auth/login",
                                "/auth/forgot-password",
                                "/auth/reset-password"
                        ).permitAll()

                        // =================================================
                        // CUSTOMER
                        // =================================================

                        .requestMatchers(
                                "/customer/**"
                        ).hasRole("CUSTOMER")

                        // =================================================
                        // VENDOR
                        // =================================================

                        .requestMatchers(
                                "/vendor/**"
                        ).hasRole("VENDOR")

                        // =================================================
                        // ADMINISTRATOR
                        // =================================================

                        .requestMatchers(
                                "/admin/**"
                        ).hasRole("ADMINISTRATOR")

                        // =================================================
                        // WAREHOUSE STAFF
                        // =================================================

                        .requestMatchers(
                                "/warehouse/**"
                        ).hasRole("WAREHOUSE_STAFF")

                        // =================================================
                        // ADMIN COUPONS
                        // =================================================

                        .requestMatchers(
                                HttpMethod.POST,
                                "/coupons"
                        ).hasRole("ADMINISTRATOR")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/coupons/**"
                        ).hasRole("ADMINISTRATOR")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/coupons/**"
                        ).hasRole("ADMINISTRATOR")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/coupons/**"
                        ).hasRole("ADMINISTRATOR")

                        // =================================================
                        // EVERYTHING ELSE
                        // =================================================

                        .anyRequest().authenticated()
                )

                // =====================================================
                // JWT FILTER
                // =====================================================

                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // =============================================================
    // PASSWORD ENCODER
    // =============================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =============================================================
    // AUTHENTICATION MANAGER
    // =============================================================

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }
}