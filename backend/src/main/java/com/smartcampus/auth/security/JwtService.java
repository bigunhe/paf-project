package com.smartcampus.auth.security;

import com.smartcampus.auth.model.RoleType;
import com.smartcampus.auth.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

	private final SecretKey key;
	private final long expirationMs;

	public JwtService(
			@Value("${app.jwt.secret}") String secret,
			@Value("${app.jwt.expiration-ms:86400000}") long expirationMs) {
		if (secret.length() < 32) {
			throw new IllegalStateException("app.jwt.secret must be at least 32 characters (256-bit) for HS256");
		}
		this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
		this.expirationMs = expirationMs;
	}

	public String createAccessToken(User user) {
		Date now = new Date();
		Date exp = new Date(now.getTime() + expirationMs);
		return Jwts.builder()
				.subject(user.getId())
				.claim("email", user.getEmail())
				.claim("role", user.getRole().name())
				.issuedAt(now)
				.expiration(exp)
				.signWith(key)
				.compact();
	}

	public JwtPrincipal parseAndValidate(String token) {
		Claims claims =
				Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
		String userId = claims.getSubject();
		String email = claims.get("email", String.class);
		String roleStr = claims.get("role", String.class);
		RoleType role = RoleType.valueOf(roleStr);
		return new JwtPrincipal(userId, email, role);
	}
}
