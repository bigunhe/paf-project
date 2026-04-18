package com.smartcampus.bookings;

import com.smartcampus.auth.model.RoleType;
import com.smartcampus.auth.security.JwtPrincipal;
import com.smartcampus.bookings.dto.BookingRequest;
import com.smartcampus.bookings.dto.BookingResponse;
import com.smartcampus.bookings.dto.BookingStatusPatchRequest;
import com.smartcampus.bookings.dto.BookingUpdateRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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
	@PreAuthorize("isAuthenticated()")
	public List<BookingResponse> list(
			@RequestParam(required = false) String userId, @AuthenticationPrincipal JwtPrincipal principal) {
		if (principal.getRole() != RoleType.ADMIN) {
			userId = principal.getUserId();
		}
		return bookingService.list(userId);
	}

	@PostMapping
	@PreAuthorize("isAuthenticated()")
	@ResponseStatus(HttpStatus.CREATED)
	public BookingResponse create(
			@Valid @RequestBody BookingRequest request, @AuthenticationPrincipal JwtPrincipal principal) {
		String userId = request.userId();
		if (principal.getRole() != RoleType.ADMIN) {
			userId = principal.getUserId();
		}
		BookingRequest effective = new BookingRequest(
				request.resourceId(),
				userId,
				request.startTime(),
				request.endTime(),
				request.purpose(),
				request.expectedAttendees());
		return bookingService.create(effective);
	}

	@PutMapping("/{id}")
	@PreAuthorize("isAuthenticated()")
	public BookingResponse update(
			@PathVariable String id,
			@Valid @RequestBody BookingUpdateRequest request,
			@AuthenticationPrincipal JwtPrincipal principal) {
		return bookingService.updateForUser(
				id,
				request,
				principal.getUserId(),
				principal.getRole() == RoleType.ADMIN);
	}

	@PatchMapping("/{id}/cancel")
	@PreAuthorize("isAuthenticated()")
	public BookingResponse cancel(
			@PathVariable String id,
			@AuthenticationPrincipal JwtPrincipal principal) {
		return bookingService.cancelForUser(
				id,
				principal.getUserId(),
				principal.getRole() == RoleType.ADMIN);
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("isAuthenticated()")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(
			@PathVariable String id,
			@AuthenticationPrincipal JwtPrincipal principal) {
		bookingService.deleteForUser(
				id,
				principal.getUserId(),
				principal.getRole() == RoleType.ADMIN);
	}

	@PatchMapping("/{id}/status")
	@PreAuthorize("hasRole('ADMIN')")
	public BookingResponse patchStatus(
			@PathVariable String id, @Valid @RequestBody BookingStatusPatchRequest body) {
		return bookingService.patchStatus(id, body);
	}
}
