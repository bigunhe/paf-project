package com.smartcampus.auth.dto;

import com.smartcampus.auth.model.RoleType;
import com.smartcampus.auth.model.UserType;

public record UserResponse(
		String id,
		String email,
		String name,
		RoleType role,
		String oauthProviderId,
		UserType userType,
		boolean profileCompleted,
		String contactNumber,
		String universityId,
		String academicUnit
) {
}
