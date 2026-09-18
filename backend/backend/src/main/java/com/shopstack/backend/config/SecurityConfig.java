package com.shopstack.backend.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.shopstack.backend.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;


@Configuration
@RequiredArgsConstructor
public class SecurityConfig {


    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${cors.allowed-origins:http://localhost:5173,http://localhost:5174}")
    private String allowedOrigins;



    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {


        http

            .csrf(csrf -> csrf.disable())

            .cors(Customizer.withDefaults())


            .authorizeHttpRequests(auth -> auth


                .requestMatchers(
                    "/api/auth/**"
                ).permitAll()


                .requestMatchers(
                    HttpMethod.OPTIONS,
                    "/**"
                ).permitAll()


                .requestMatchers(
                    "/api/users/me"
                ).authenticated()

                .requestMatchers(
                    "/api/vendor/**"
                ).hasRole("VENDOR")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/admin/warehouse/orders"
                ).hasAnyRole("ADMIN", "STAFF")

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/admin/warehouse/orders/**"
                ).hasAnyRole("ADMIN", "STAFF")

                .requestMatchers(
                    "/api/admin/warehouse/**",
                    "/api/admin/warehouses/**",
                    "/api/admin/inventory",
                    "/api/admin/inventory/**",
                    "/api/admin/product-requests"
                ).hasAnyRole("ADMIN", "STAFF")

                .requestMatchers(
                    "/api/admin/refunds/**"
                ).hasAnyRole("ADMIN", "STAFF")

                .requestMatchers(
                    "/api/admin/**"
                ).hasRole("ADMIN")

                .anyRequest().permitAll()

            )


            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );



        return http.build();

    }





    @Bean
    public CorsConfigurationSource corsConfigurationSource() {


        CorsConfiguration configuration =
                new CorsConfiguration();


        configuration.setAllowedOrigins(
            List.of(allowedOrigins.split(","))
        );


        configuration.setAllowedMethods(
                List.of(
                    "GET",
                    "POST",
                    "PATCH",
                    "PUT",
                    "DELETE",
                    "OPTIONS"
                )
        );


        configuration.setAllowedHeaders(
                List.of("*")
        );


        configuration.setAllowCredentials(true);



        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();



        source.registerCorsConfiguration(
                "/**",
                configuration
        );


        return source;

    }

}
