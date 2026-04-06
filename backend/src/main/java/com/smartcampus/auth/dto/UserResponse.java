package com.smartcampus.auth.dto;

import com.smartcampus.auth.model.RoleType;

public record UserResponse(
		String id,
		String email,
		String name,
		RoleType role,
		String oauthProviderId
) {
}
