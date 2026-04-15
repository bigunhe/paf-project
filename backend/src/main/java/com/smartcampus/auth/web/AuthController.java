package com.smartcampus.auth.web;

import com.smartcampus.auth.UserService;
import com.smartcampus.auth.dto.UserResponse;
import com.smartcampus.auth.security.JwtPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

	private final UserService userService;

	public AuthController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping("/me")
	public UserResponse me(@AuthenticationPrincipal JwtPrincipal principal) {
		return userService.getById(principal.getUserId());
	}
}
