package com.smartcampus.bookings.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.FutureOrPresent;
import java.time.LocalDate;
import java.time.LocalTime;

public record BookingRequestDTO(
		@NotBlank String userId,
		@NotBlank String studentId,
		@NotBlank String studentName,
		@NotBlank String faculty,
		@NotBlank String resourceId,
		@NotBlank String resourceName,
		@NotNull @FutureOrPresent @JsonFormat(pattern = "yyyy-MM-dd") LocalDate date,
		@NotNull @JsonFormat(pattern = "HH:mm") LocalTime startTime,
		@NotNull @JsonFormat(pattern = "HH:mm") LocalTime endTime,
		@NotBlank @Size(max = 240) String purpose,
		@Min(1) int attendeesCount
) {
}