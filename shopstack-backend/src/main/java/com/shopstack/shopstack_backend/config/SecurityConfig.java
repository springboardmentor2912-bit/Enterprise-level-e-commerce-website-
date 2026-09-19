package com.shopstack.shopstack_backend.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ==========================================
    // GLOBAL HIGHEST-PRECEDENCE CORS FILTER
    // ==========================================
    @Bean
    public FilterRegistrationBean<CorsFilter> customCorsFilter() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allows all origins (localhost, all Vercel domains and previews)
        configuration.setAllowedOriginPatterns(List.of("*"));
        
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // Cache preflight response for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }

    // ==========================================
    // SECURITY FILTER CHAIN
    // ==========================================
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            // Session Management
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Endpoint Authorization
            .authorizeHttpRequests(auth -> auth
                // Allow all OPTIONS preflight requests automatically
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Public Authentication Endpoints
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/vendor/register").permitAll()
                .requestMatchers("/vendor/login").permitAll()

                // Public Resource Endpoints
                .requestMatchers("/profile/**").permitAll()
                .requestMatchers("/products/**").permitAll()
                .requestMatchers("/images/**").permitAll()
                .requestMatchers("/customer/profile/**").permitAll()
                .requestMatchers("/vendor/**").permitAll()

                // Orders & Reviews
                .requestMatchers("/orders/**").permitAll()
                .requestMatchers("/orders").permitAll()
                .requestMatchers("/reviews/**").permitAll()

                // Payments & Coupons
                .requestMatchers("/payments/**").permitAll()
                .requestMatchers("/admin/**").permitAll()
                .requestMatchers("/coupons/**").permitAll()
                .requestMatchers("/coupons/validate").permitAll()

                // Warehouse & Shipping
                .requestMatchers("/warehouse/**").permitAll()
                .requestMatchers("/shipping/**").permitAll()

                // Any other request
                .anyRequest().authenticated()
            );

        return http.build();
    }
}