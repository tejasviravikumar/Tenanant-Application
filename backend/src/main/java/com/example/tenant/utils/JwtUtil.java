package com.example.tenant.utils;

import org.springframework.beans.factory.annotation.Value;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.util.Date;

@Component
public class JwtUtil {
    private final Key secretKey;
    private final long expiration;
    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;
    }
    public String generateToken(String email){
        return Jwts.builder()
            .setSubject(email)
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(secretKey,SignatureAlgorithm.HS256)
            .compact();
    }

    public String extractUsername(String token){
        return Jwts.parserBuilder()
            .setSigningKey(secretKey)
            .build()
            .parseClaimsJwt(token)
            .getBody()
            .getSubject();
    }

    public boolean validateJwtToken(String token){
        try{
            Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
            return true;
        }
        catch(JwtException exception){
            return false;
        }
    }
}
