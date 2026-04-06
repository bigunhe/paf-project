package com.smartcampus.maintenance.dto;

import com.smartcampus.maintenance.model.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record TicketRequest(
		@NotBlank String resourceId,
		@NotBlank String userId,
		@NotBlank String category,
		@NotBlank String description,
		@NotNull TicketPriority priority,
		String contactDetails,
		@Size(max = 3) List<String> imageAttachments
) {
}
