package com.smartcampus.maintenance.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {

	@Id
	private String id;
	private String resourceId;
	private String userId;
	private String category;
	private String description;
	private TicketPriority priority;
	private TicketStatus status;
	private String contactDetails;
	@Builder.Default
	private List<String> imageAttachments = new ArrayList<>();
	private String resolutionNotes;
	private String technicianAssigned;
	@Builder.Default
	private List<TicketComment> comments = new ArrayList<>();
	private LocalDateTime createdAt;
}
