package com.smartcampus.notifications.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

	@Id
	private String id;
	private String userId;
	/** e.g. BOOKING_UPDATE, TICKET_UPDATE */
	private String type;
	private String message;
	/** In-app route path only, e.g. /app/bookings — optional for legacy rows */
	private String linkPath;
	/** Entity id for query param (bookingId / ticketId) — optional */
	private String entityId;
	@Field("isRead")
	@JsonProperty("isRead")
	private boolean readFlag;
	private LocalDateTime createdAt;
}
