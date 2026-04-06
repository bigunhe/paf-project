package com.smartcampus.auth;

import com.smartcampus.auth.dto.UserResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping
	public List<UserResponse> list() {
		return userService.findAll();
	}

	@GetMapping("/{id}")
	public UserResponse get(@PathVariable String id) {
		return userService.getById(id);
	}
}
