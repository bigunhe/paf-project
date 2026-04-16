package com.smartcampus.bookings;

import com.smartcampus.auth.UserService;
import com.smartcampus.auth.model.User;
import com.smartcampus.auth.model.UserType;
import com.smartcampus.bookings.dto.BookingRequest;
import com.smartcampus.bookings.dto.BookingResponse;
import com.smartcampus.bookings.dto.BookingStatusPatchRequest;
import com.smartcampus.bookings.model.Booking;
import com.smartcampus.bookings.model.BookingStatus;
import com.smartcampus.core.exception.ConflictException;
import com.smartcampus.core.exception.ResourceNotFoundException;
import com.smartcampus.facilities.ResourceService;
import com.smartcampus.facilities.model.Resource;
import com.smartcampus.facilities.model.ResourceStatus;
import com.smartcampus.notifications.NotificationService;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BookingService {

	private final BookingRepository bookingRepository;
	private final ResourceService resourceService;
	private final NotificationService notificationService;
	private final UserService userService;

	public BookingService(
			BookingRepository bookingRepository,
			ResourceService resourceService,
			NotificationService notificationService,
			UserService userService) {
		this.bookingRepository = bookingRepository;
		this.resourceService = resourceService;
		this.notificationService = notificationService;
		this.userService = userService;
	}

	public List<BookingResponse> list(String userId) {
		List<Booking> list =
				userId == null || userId.isBlank()
						? bookingRepository.findAll()
						: bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
		return list.stream().map(this::toResponse).toList();
	}

	public BookingResponse create(BookingRequest req) {
		if (!req.startTime().isBefore(req.endTime())) {
			throw new IllegalArgumentException("startTime must be before endTime");
		}
		User booker = userService.getEntityById(req.userId());
		if (!Boolean.TRUE.equals(booker.getProfileCompleted())) {
			throw new ResponseStatusException(
					HttpStatus.FORBIDDEN, "Complete your profile before creating a booking");
		}
		UserType userType = booker.getUserType() != null ? booker.getUserType() : UserType.UNASSIGNED;
		if (userType == UserType.UNASSIGNED) {
			throw new ResponseStatusException(
					HttpStatus.FORBIDDEN, "Complete your profile before creating a booking");
		}
		// LECTURER: auto-approved when no conflict. STUDENT/STAFF: pending admin review.
		BookingStatus initialStatus =
				userType == UserType.LECTURER ? BookingStatus.APPROVED : BookingStatus.PENDING;

		Resource resource = resourceService.getEntityById(req.resourceId());
		if (resource.getStatus() != ResourceStatus.ACTIVE) {
			throw new ConflictException("Resource is not available for booking");
		}
		assertNoOverlap(req.resourceId(), req.startTime(), req.endTime(), null);

		Booking b = Booking.builder()
				.resourceId(req.resourceId())
				.userId(req.userId())
				.startTime(req.startTime())
				.endTime(req.endTime())
				.purpose(req.purpose())
				.expectedAttendees(req.expectedAttendees())
				.status(initialStatus)
				.adminReason(null)
				.createdAt(LocalDateTime.now())
				.build();
		Booking saved = bookingRepository.save(b);
		if (initialStatus == BookingStatus.PENDING) {
			notificationService.notifyAdmins(
					NotificationService.TYPE_BOOKING_UPDATE,
					"New booking request from " + booker.getName() + " for " + resource.getName() + ".",
					"/admin/bookings",
					saved.getId());
		}
		return toResponse(saved);
	}

	public BookingResponse patchStatus(String id, BookingStatusPatchRequest patch) {
		Booking b = bookingRepository
				.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));

		if (patch.status() == BookingStatus.APPROVED) {
			assertNoOverlap(b.getResourceId(), b.getStartTime(), b.getEndTime(), id);
			b.setStatus(BookingStatus.APPROVED);
			b.setAdminReason(null);
			Booking saved = bookingRepository.save(b);
			Resource r = resourceService.getEntityById(b.getResourceId());
			notificationService.create(
					b.getUserId(),
					NotificationService.TYPE_BOOKING_UPDATE,
					"Your booking for " + r.getName() + " was APPROVED.",
					"/app/bookings",
					saved.getId());
			return toResponse(saved);
		}

		if (patch.status() == BookingStatus.REJECTED) {
			b.setStatus(BookingStatus.REJECTED);
			b.setAdminReason(patch.adminReason());
			Booking saved = bookingRepository.save(b);
			Resource r = resourceService.getEntityById(b.getResourceId());
			notificationService.create(
					b.getUserId(),
					NotificationService.TYPE_BOOKING_UPDATE,
					"Your booking for " + r.getName() + " was REJECTED."
							+ (patch.adminReason() != null ? " Reason: " + patch.adminReason() : ""),
					"/app/bookings",
					saved.getId());
			return toResponse(saved);
		}

		b.setStatus(patch.status());
		if (patch.adminReason() != null) {
			b.setAdminReason(patch.adminReason());
		}
		return toResponse(bookingRepository.save(b));
	}

	private void assertNoOverlap(
			String resourceId, LocalDateTime start, LocalDateTime end, String excludeBookingId) {
		List<Booking> approved =
				bookingRepository.findByResourceIdAndStatus(resourceId, BookingStatus.APPROVED);
		for (Booking existing : approved) {
			if (excludeBookingId != null && excludeBookingId.equals(existing.getId())) {
				continue;
			}
			if (overlaps(start, end, existing.getStartTime(), existing.getEndTime())) {
				throw new ConflictException("Time slot conflicts with an approved booking for this resource");
			}
		}
	}

	private static boolean overlaps(
			LocalDateTime s1, LocalDateTime e1, LocalDateTime s2, LocalDateTime e2) {
		return s1.isBefore(e2) && s2.isBefore(e1);
	}

	private BookingResponse toResponse(Booking b) {
		return new BookingResponse(
				b.getId(),
				b.getResourceId(),
				b.getUserId(),
				b.getStartTime(),
				b.getEndTime(),
				b.getPurpose(),
				b.getExpectedAttendees(),
				b.getStatus(),
				b.getAdminReason(),
				b.getCreatedAt());
	}
}
