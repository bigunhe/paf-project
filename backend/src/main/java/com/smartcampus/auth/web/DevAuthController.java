package com.smartcampus.auth.web;

import com.smartcampus.auth.UserRepository;
import com.smartcampus.auth.dto.AuthTokenResponse;
import com.smartcampus.auth.model.RoleType;
import com.smartcampus.auth.model.User;
import com.smartcampus.auth.security.JwtService;
import com.smartcampus.core.config.DataSeeder;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Local profile only: issue JWT for seeded dev users (no Google required).
 */
@RestController
@RequestMapping("/api/v1/auth")
@Profile("local")
public class DevAuthController {

	private final JwtService jwtService;
	private final UserRepository userRepository;

	public DevAuthController(JwtService jwtService, UserRepository userRepository) {
		this.jwtService = jwtService;
		this.userRepository = userRepository;
	}

	@GetMapping("/dev-login")
	public AuthTokenResponse devLogin(@RequestParam(defaultValue = "user") String as) {
		User u;
		if ("admin".equalsIgnoreCase(as)) {
			u = userRepository.findAll().stream()
					.filter(user -> user.getRole() == RoleType.ADMIN)
					.findFirst()
					.orElseThrow(() -> new IllegalStateException(
							"No ADMIN user found. Add admin email to app.auth.admin-emails and restart local backend."));
		} else {
			u = userRepository.findById(DataSeeder.DEV_USER_ID)
					.orElseThrow(() -> new IllegalStateException("Seeded user missing: " + DataSeeder.DEV_USER_ID));
		}
		return new AuthTokenResponse(jwtService.createAccessToken(u));
	}
}
