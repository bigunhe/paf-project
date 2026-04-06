package com.smartcampus.facilities.dto;

import com.smartcampus.facilities.model.ResourceStatus;
import com.smartcampus.facilities.model.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ResourceRequest(
		@NotBlank String name,
		@NotNull ResourceType type,
		@Min(0) int capacity,
		@NotBlank String location,
		@NotNull ResourceStatus status
) {
}
