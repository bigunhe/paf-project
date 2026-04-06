package com.smartcampus.bookings.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record BookingRequest(
		@NotBlank String resourceId,
		@NotBlank String userId,
		@NotNull LocalDateTime startTime,
		@NotNull LocalDateTime endTime,
		@NotBlank String purpose,
		@Min(0) int expectedAttendees
) {
}
