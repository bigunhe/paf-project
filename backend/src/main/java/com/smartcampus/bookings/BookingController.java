package com.smartcampus.bookings;

import com.smartcampus.bookings.dto.BookingRequest;
import com.smartcampus.bookings.dto.BookingResponse;
import com.smartcampus.bookings.dto.BookingStatusPatchRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

	private final BookingService bookingService;

	public BookingController(BookingService bookingService) {
		this.bookingService = bookingService;
	}

	@GetMapping
	public List<BookingResponse> list(@RequestParam(required = false) String userId) {
		return bookingService.list(userId);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public BookingResponse create(@Valid @RequestBody BookingRequest request) {
		return bookingService.create(request);
	}

	@PatchMapping("/{id}/status")
	public BookingResponse patchStatus(
			@PathVariable String id, @Valid @RequestBody BookingStatusPatchRequest body) {
		return bookingService.patchStatus(id, body);
	}
}
