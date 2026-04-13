package com.smartcampus.bookings.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.smartcampus.bookings.model.BookingStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record BookingResponseDTO(
		String id,
		String userId,
		String studentId,
		String studentName,
		String faculty,
		String resourceId,
		String resourceName,
		@JsonFormat(pattern = "yyyy-MM-dd") LocalDate date,
		@JsonFormat(pattern = "HH:mm") LocalTime startTime,
		@JsonFormat(pattern = "HH:mm") LocalTime endTime,
		String purpose,
		int attendeesCount,
		BookingStatus status,
		String rejectionReason,
		LocalDateTime createdAt
) {
}