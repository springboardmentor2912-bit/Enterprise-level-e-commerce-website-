package shopstack_backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;


    private Key getSigningKey() {

        return new SecretKeySpec(
                secret.getBytes(),
                SignatureAlgorithm.HS256.getJcaName()
        );
    }


    public String generateToken(String email) {

        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(
                        new Date(System.currentTimeMillis() + expiration)
                )
                .signWith(getSigningKey())
                .compact();
    }


    public String extractEmail(String token) {

        return getClaims(token).getSubject();
    }


    private Claims getClaims(String token) {

        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }


    public boolean isTokenValid(String token, String email) {

        Claims claims = getClaims(token);

        String tokenEmail = claims.getSubject();

        Date expirationDate = claims.getExpiration();

        return tokenEmail.equals(email)
                && expirationDate.after(new Date());
    }
}