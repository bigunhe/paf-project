package com.smartcampus.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UserAccountPatchRequest(
		@NotBlank String name,
		@NotBlank
		@Pattern(regexp = "^[0-9]{10}$", message = "must be exactly 10 digits")
		String contactNumber,
		@NotBlank String universityId,
		@NotBlank String academicUnit
) {
}
