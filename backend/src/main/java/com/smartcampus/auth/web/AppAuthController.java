package com.smartcampus.auth.web;

import com.smartcampus.auth.UserRepository;
import com.smartcampus.auth.dto.AuthTokenResponse;
import com.smartcampus.auth.dto.LoginRequest;
import com.smartcampus.auth.model.User;
import com.smartcampus.auth.security.JwtService;
import com.smartcampus.core.exception.ForbiddenException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AppAuthController {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public AppAuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	@PostMapping("/login")
	public AuthTokenResponse login(@RequestBody LoginRequest request) {
		User user = userRepository.findByEmailIgnoreCase(request.email())
				.orElseThrow(() -> new ForbiddenException("Invalid credentials or user not found."));

		if (request.password() == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
			throw new ForbiddenException("Invalid credentials or user not found.");
		}

		if (!user.getRole().name().equals(request.role())) {
			throw new ForbiddenException("Access Denied: Your account role (" + user.getRole().name() + ") does not match the requested login type.");
		}

		return new AuthTokenResponse(jwtService.createAccessToken(user));
	}
}
