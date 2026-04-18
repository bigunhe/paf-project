package com.smartcampus.bookings.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record BookingUpdateRequest(
		@NotBlank String resourceId,
		@NotNull LocalDateTime startTime,
		@NotNull LocalDateTime endTime,
		@NotBlank String purpose,
		@Min(0) int expectedAttendees
) {
}
