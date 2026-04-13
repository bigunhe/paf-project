package com.smartcampus.bookings.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.time.LocalTime;
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
	private String userId;
	private String studentId;
	private String studentName;
	private String faculty;
	private String resourceId;
	private String resourceName;
	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate date;
	@JsonFormat(pattern = "HH:mm")
	private LocalTime startTime;
	@JsonFormat(pattern = "HH:mm")
	private LocalTime endTime;
	private String purpose;
	private int attendeesCount;
	private BookingStatus status;
	private String rejectionReason;
	private LocalDateTime createdAt;
}
