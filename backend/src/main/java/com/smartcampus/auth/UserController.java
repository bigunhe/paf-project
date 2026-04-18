package com.smartcampus.auth;

import com.smartcampus.auth.dto.ProfilePatchRequest;
import com.smartcampus.auth.dto.UserAccountPatchRequest;
import com.smartcampus.auth.dto.UserResponse;
import com.smartcampus.auth.model.RoleType;
import com.smartcampus.auth.security.JwtPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
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
	@PreAuthorize("hasRole('ADMIN')")
	public List<UserResponse> list() {
		return userService.findAll();
	}

	@GetMapping("/{id}")
	public UserResponse get(@PathVariable String id, @AuthenticationPrincipal JwtPrincipal principal) {
		if (principal.getRole() != RoleType.ADMIN && !principal.getUserId().equals(id)) {
			throw new AccessDeniedException("Not allowed to view this user");
		}
		return userService.getById(id);
	}

	@PatchMapping("/{id}/profile")
	public UserResponse patchProfile(
			@PathVariable String id,
			@Valid @RequestBody ProfilePatchRequest body,
			@AuthenticationPrincipal JwtPrincipal principal) {
		if (!principal.getUserId().equals(id)) {
			throw new AccessDeniedException("Not allowed to update this profile");
		}
		return userService.updateProfile(id, body);
	}

	@PatchMapping("/{id}")
	public UserResponse patchAccount(
			@PathVariable String id,
			@Valid @RequestBody UserAccountPatchRequest body,
			@AuthenticationPrincipal JwtPrincipal principal) {
		if (!principal.getUserId().equals(id)) {
			throw new AccessDeniedException("Not allowed to update this account");
		}
		return userService.updateAccount(id, body);
	}

	@DeleteMapping("/{id}")
	public void deleteAccount(@PathVariable String id, @AuthenticationPrincipal JwtPrincipal principal) {
		if (!principal.getUserId().equals(id)) {
			throw new AccessDeniedException("Not allowed to delete this account");
		}
		userService.deleteById(id);
	}
}
