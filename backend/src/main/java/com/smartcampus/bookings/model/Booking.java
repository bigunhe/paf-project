package com.smartcampus.bookings.model;

import java.time.LocalDateTime;
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
@Document(collection = "bookings")
public class Booking {

	@Id
	private String id;
	private String resourceId;
	private String userId;
	private LocalDateTime startTime;
	private LocalDateTime endTime;
	private String purpose;
	private int expectedAttendees;
	private BookingStatus status;
	private String adminReason;
	private LocalDateTime createdAt;
}
