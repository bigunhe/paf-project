package com.smartcampus.bookings.dto;

import com.smartcampus.bookings.model.BookingStatus;
import jakarta.validation.constraints.NotNull;

public record BookingStatusPatchRequest(
		@NotNull BookingStatus status,
		String adminReason
) {
}
