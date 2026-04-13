package com.smartcampus.bookings.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BookingRejectRequestDTO(
		@NotBlank @Size(max = 300) String reason
) {
}