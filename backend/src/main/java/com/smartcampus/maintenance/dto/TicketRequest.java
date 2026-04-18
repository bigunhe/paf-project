package com.smartcampus.maintenance.dto;

import com.smartcampus.maintenance.model.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public record TicketRequest(
		@NotBlank String resourceId,
		@NotBlank String userId,
		@NotBlank String category,
		@NotBlank String description,
		@NotNull TicketPriority priority,
		@NotBlank @Pattern(regexp = "\\d{10}", message = "Contact number must be exactly 10 digits") String contactDetails,
		@Size(max = 3) List<String> imageAttachments
) {
}
