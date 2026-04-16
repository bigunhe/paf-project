package com.smartcampus.auth.dto;

import com.smartcampus.auth.model.UserType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record ProfilePatchRequest(
		@NotNull UserType userType,
		@NotBlank
		@Pattern(regexp = "^[0-9]{10}$", message = "must be exactly 10 digits")
		String contactNumber,
		@NotBlank String universityId,
		@NotBlank String academicUnit
) {
}
