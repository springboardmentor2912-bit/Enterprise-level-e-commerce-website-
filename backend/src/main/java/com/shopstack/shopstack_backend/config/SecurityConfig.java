package com.shopstack.shopstack_backend.config;

import com.shopstack.shopstack_backend.security.jwt.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // =========================
    // PASSWORD ENCODER
    // =========================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =========================
    // AUTHENTICATION MANAGER
    // =========================

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration.getAuthenticationManager();
    }

    // =========================
    // SECURITY FILTER CHAIN
    // =========================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                // =========================
                // CORS
                // =========================

                .cors(Customizer.withDefaults())

                // =========================
                // CSRF
                // =========================

                .csrf(csrf -> csrf.disable())

                // =========================
                // SESSION
                // =========================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // =========================
                // AUTHORIZATION
                // =========================

                .authorizeHttpRequests(auth -> auth

                        // -------------------------
                        // AUTH APIs
                        // -------------------------

                        .requestMatchers(
                                "/api/auth/**"
                        ).permitAll()

                        // -------------------------
                        // SWAGGER
                        // -------------------------

                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // -------------------------
                        // CORS PREFLIGHT
                        // -------------------------

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // -------------------------
                        // ADMIN ORDER STATUS
                        // -------------------------

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/orders/*/status"
                        ).hasAuthority("ROLE_ADMIN")

                        // -------------------------
                        // ADMIN APIs
                        // -------------------------

                        .requestMatchers(
                                "/api/admin/**"
                        ).hasAuthority("ROLE_ADMIN")

                        // -------------------------
                        // VENDOR APIs
                        // -------------------------

                        .requestMatchers(
                                "/api/vendor/**"
                        ).hasAuthority("ROLE_VENDOR")

                        // -------------------------
                        // CUSTOMER APIs
                        // -------------------------

                        .requestMatchers(
                                "/api/cart/**",
                                "/api/orders/**"
                        ).hasAuthority("ROLE_CUSTOMER")

                        // -------------------------
                        // EVERYTHING ELSE
                        // -------------------------

                        .anyRequest().authenticated()
                )

                // =========================
                // JWT FILTER
                // =========================

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}