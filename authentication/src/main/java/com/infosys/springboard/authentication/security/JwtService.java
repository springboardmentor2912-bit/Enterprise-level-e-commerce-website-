package com.infosys.springboard.authentication.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final String SECRET_KEY =
            "myverysecretkeymyverysecretkeymyverysecretkey";

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(
                SECRET_KEY.getBytes()
        );
    }

    // =========================
    // GENERATE TOKEN
    // =========================

    public String generateToken(
            String email,
            String role) {

        return Jwts.builder()

                .subject(email)

                .claim("role", role)

                .issuedAt(new Date())

                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + 86400000
                        )
                )

                .signWith(getSigningKey())

                .compact();
    }

    // =========================
    // EXTRACT EMAIL
    // =========================

    public String extractEmail(String token) {

        return Jwts.parser()

                .verifyWith(getSigningKey())

                .build()

                .parseSignedClaims(token)

                .getPayload()

                .getSubject();
    }

    // =========================
    // EXTRACT ROLE
    // =========================

    public String extractRole(String token) {

        return Jwts.parser()

                .verifyWith(getSigningKey())

                .build()

                .parseSignedClaims(token)

                .getPayload()

                .get("role", String.class);
    }

    // =========================
    // VALIDATE TOKEN
    // =========================

    public boolean validateToken(String token) {

        try {

            Jwts.parser()

                    .verifyWith(getSigningKey())

                    .build()

                    .parseSignedClaims(token);

            return true;

        } catch (Exception e) {

            return false;
        }
    }
}