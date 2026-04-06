package com.smartcampus.maintenance.dto;

import com.smartcampus.maintenance.model.TicketComment;
import com.smartcampus.maintenance.model.TicketPriority;
import com.smartcampus.maintenance.model.TicketStatus;
import java.time.LocalDateTime;
import java.util.List;

public record TicketResponse(
		String id,
		String resourceId,
		String userId,
		String category,
		String description,
		TicketPriority priority,
		TicketStatus status,
		String contactDetails,
		List<String> imageAttachments,
		String resolutionNotes,
		String technicianAssigned,
		List<TicketComment> comments,
		LocalDateTime createdAt
) {
}
