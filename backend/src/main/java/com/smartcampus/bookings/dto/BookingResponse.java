package com.smartcampus.bookings.dto;

import com.smartcampus.bookings.model.BookingStatus;
import java.time.LocalDateTime;

public record BookingResponse(
		String id,
		String resourceId,
		String userId,
		LocalDateTime startTime,
		LocalDateTime endTime,
		String purpose,
		int expectedAttendees,
		BookingStatus status,
		String adminReason,
		LocalDateTime createdAt
) {
}
