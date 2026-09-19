package com.shopstack.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.shopstack.backend.filter.JwtAuthenticationFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // =====================================================
    // PREVENT SPRING BOOT FROM ALSO AUTO-REGISTERING
    // JwtAuthenticationFilter AS A PLAIN SERVLET FILTER
    // (it's already wired into the Security chain below)
    // =====================================================

    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration(
            JwtAuthenticationFilter filter) {

        FilterRegistrationBean<JwtAuthenticationFilter> registration =
                new FilterRegistrationBean<>(filter);

        registration.setEnabled(false);
        return registration;
    }

    // =====================================================
    // PASSWORD ENCODER
    // =====================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =====================================================
    // SECURITY FILTER CHAIN
    // =====================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

                // ==========================================
                // CORS
                // ==========================================
                .cors(Customizer.withDefaults())

                // ==========================================
                // CSRF
                // ==========================================
                .csrf(csrf -> csrf.disable())

                // ==========================================
                // SESSION
                // ==========================================
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // ==========================================
                // AUTHORIZATION
                // ==========================================
                .authorizeHttpRequests(auth -> auth

                        // ----------------------------------
                        // CORS preflight
                        // ----------------------------------
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // ----------------------------------
                        // Authentication
                        // ----------------------------------
                        .requestMatchers(
                                "/api/auth/**"
                        ).permitAll()

                        // ----------------------------------
                        // PUBLIC PRODUCT BROWSING
                        // ----------------------------------
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/products/**"
                        ).permitAll()

                        // ----------------------------------
                        // ADMIN APIs
                        // ----------------------------------
                        .requestMatchers(
                                "/api/admin/**"
                        ).hasRole("ADMIN")

                        // ----------------------------------
                        // WAREHOUSE STAFF APIs
                        // ----------------------------------
                        .requestMatchers(
                                "/api/warehouse-staff/**"
                        ).hasRole("WAREHOUSE_STAFF")

                        // ----------------------------------
                        // COUPONS - vendor self-service
                        // ----------------------------------
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/coupons/vendor"
                        ).hasRole("VENDOR")

                        // ----------------------------------
                        // COUPONS - customer actions
                        // ----------------------------------
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/coupons/apply"
                        ).hasRole("CUSTOMER")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/coupons/available"
                        ).hasRole("CUSTOMER")

                        // ----------------------------------
                        // COUPONS - vendor moderation actions
                        // (a vendor approves/rejects coupons
                        //  created for their own products)
                        // ----------------------------------
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/coupons/*/approve",
                                "/api/coupons/*/reject"
                        ).hasRole("VENDOR")

                        // ----------------------------------
                        // COUPONS - admin activate/deactivate
                        // ----------------------------------
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/coupons/*/toggle"
                        ).hasRole("ADMIN")

                        // ----------------------------------
                        // COUPONS - admin management
                        // (create / list / view / everything
                        //  else under /api/coupons)
                        // ----------------------------------
                        .requestMatchers(
                                "/api/coupons/**"
                        ).hasRole("ADMIN")

                        // ----------------------------------
                        // EVERYTHING ELSE
                        // ----------------------------------
                        .requestMatchers("/").permitAll()
                        .anyRequest().authenticated()
                )

                // ==========================================
                // JWT FILTER
                // ==========================================
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // =====================================================
    // GLOBAL CORS CONFIGURATION
    // =====================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        // Frontend




        configuration.setAllowedOrigins(
                List.of(frontendUrl)
        );
        // HTTP methods
        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        // Request headers
        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept"
                )
        );

        // Response headers
        configuration.setExposedHeaders(
                List.of("Authorization")
        );

        // Cookies / credentials
        configuration.setAllowCredentials(true);

        // Apply CORS configuration to all endpoints
        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}