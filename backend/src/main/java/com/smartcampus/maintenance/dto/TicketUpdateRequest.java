package com.smartcampus.maintenance.dto;

import com.smartcampus.maintenance.model.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record TicketUpdateRequest(
		@NotBlank String category,
		@NotBlank String description,
		@NotNull TicketPriority priority,
		@NotBlank @Pattern(regexp = "\\d{10}", message = "Contact number must be exactly 10 digits") String contactDetails
) {
}
