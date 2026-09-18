package com.shopstack.shopstack_backend.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    private static final String SECRET_KEY =
            "ThisIsMyVerySecretKeyForShopStackApplication12345678901234567890";

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(
                java.util.Base64.getEncoder().encodeToString(SECRET_KEY.getBytes())
        );
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generate JWT Token
     */
    public String generateToken(String email) {

        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 Hours
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extract Email from Token
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract Expiration Date
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Generic Claim Extractor
     */
    public <T> T extractClaim(String token,
                              Function<Claims, T> claimsResolver) {

        final Claims claims = extractAllClaims(token);

        return claimsResolver.apply(claims);
    }

    /**
     * Extract All Claims
     */
    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Check Token Expired
     */
    private boolean isTokenExpired(String token) {

        return extractExpiration(token).before(new Date());
    }

    /**
     * Validate Token
     */
    public boolean isTokenValid(String token,
                                UserDetails userDetails) {

        final String username = extractUsername(token);

        return username.equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }
}