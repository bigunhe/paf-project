package com.smartcampus.bookings;

import com.smartcampus.bookings.dto.BookingRejectRequestDTO;
import com.smartcampus.bookings.dto.BookingRequestDTO;
import com.smartcampus.bookings.dto.BookingResponseDTO;
import com.smartcampus.bookings.model.BookingStatus;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/bookings", "/api/v1/bookings"})
public class BookingController {

	private final BookingService bookingService;

	public BookingController(BookingService bookingService) {
		this.bookingService = bookingService;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public BookingResponseDTO createBooking(@Valid @RequestBody BookingRequestDTO request) {
		return bookingService.createBooking(request);
	}

	@PutMapping("/{id}")
	public BookingResponseDTO updateBooking(
			@PathVariable String id,
			@RequestParam String userId,
			@Valid @RequestBody BookingRequestDTO request
	) {
		return bookingService.updateBooking(id, userId, request);
	}

	@GetMapping("/my")
	public List<BookingResponseDTO> getMyBookings(@RequestParam String userId) {
		return bookingService.getMyBookings(userId);
	}

	@GetMapping
	public List<BookingResponseDTO> getAllBookings(
			@RequestParam(required = false) BookingStatus status,
			@RequestParam(required = false)
			@DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
			LocalDate date,
			@RequestParam(required = false) String resourceId
	) {
		return bookingService.getAllBookings(status, date, resourceId);
	}

	@PutMapping("/{id}/approve")
	public BookingResponseDTO approveBooking(@PathVariable String id) {
		return bookingService.approveBooking(id);
	}

	@PutMapping("/{id}/reject")
	public BookingResponseDTO rejectBooking(
			@PathVariable String id,
			@Valid @RequestBody BookingRejectRequestDTO body
	) {
		return bookingService.rejectBooking(id, body);
	}

	@PutMapping("/{id}/cancel")
	public BookingResponseDTO cancelBooking(@PathVariable String id, @RequestParam String userId) {
		return bookingService.cancelBooking(id, userId);
	}

	@PutMapping("/{id}/remove-rejected")
	public BookingResponseDTO removeRejectedBooking(@PathVariable String id, @RequestParam String userId) {
		return bookingService.removeRejectedBooking(id, userId);
	}
}
