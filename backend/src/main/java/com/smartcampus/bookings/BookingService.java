package com.smartcampus.bookings;

import com.smartcampus.bookings.dto.BookingRejectRequestDTO;
import com.smartcampus.bookings.dto.BookingRequestDTO;
import com.smartcampus.bookings.dto.BookingResponseDTO;
import com.smartcampus.bookings.model.Booking;
import com.smartcampus.bookings.model.BookingStatus;
import com.smartcampus.core.exception.ConflictException;
import com.smartcampus.core.exception.ResourceNotFoundException;
import com.smartcampus.facilities.ResourceService;
import com.smartcampus.facilities.model.Resource;
import com.smartcampus.facilities.model.ResourceStatus;
import com.smartcampus.notifications.NotificationService;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class BookingService {

	private final BookingRepository bookingRepository;
	private final ResourceService resourceService;
	private final NotificationService notificationService;

	public BookingService(
			BookingRepository bookingRepository,
			ResourceService resourceService,
			NotificationService notificationService) {
		this.bookingRepository = bookingRepository;
		this.resourceService = resourceService;
		this.notificationService = notificationService;
	}

	public BookingResponseDTO createBooking(BookingRequestDTO req) {
		validateTimeRange(req.startTime(), req.endTime());
		validateDate(req.date());

		try {
			Resource resource = resourceService.getEntityById(req.resourceId());
			if (resource.getStatus() != ResourceStatus.ACTIVE) {
				throw new ConflictException("Selected resource is not active");
			}
		} catch (ResourceNotFoundException ignored) {
			// Temporary fallback: allow static category options when resources are not seeded yet.
		}

		assertNoConflict(req.resourceId(), req.date(), req.startTime(), req.endTime(), null);

		Booking booking = Booking.builder()
				.userId(req.userId())
				.studentId(req.studentId())
				.studentName(req.studentName())
				.faculty(req.faculty())
				.resourceId(req.resourceId())
				.resourceName(req.resourceName())
				.date(req.date())
				.startTime(req.startTime())
				.endTime(req.endTime())
				.purpose(req.purpose())
				.attendeesCount(req.attendeesCount())
				.status(BookingStatus.PENDING)
				.rejectionReason(null)
				.createdAt(LocalDateTime.now())
				.build();

		Booking saved = bookingRepository.save(booking);
		notificationService.create(
				req.userId(),
				NotificationService.TYPE_BOOKING_UPDATE,
				"Booking request submitted for " + req.resourceName() + " on " + req.date()
		);
		return toResponse(saved);
	}

	public BookingResponseDTO updateBooking(String bookingId, String userId, BookingRequestDTO req) {
		Booking booking = getBookingOrThrow(bookingId);
		if (!booking.getUserId().equals(userId)) {
			throw new IllegalArgumentException("Only the booking owner can edit this booking");
		}
		if (booking.getStatus() != BookingStatus.PENDING) {
			throw new ConflictException("Only PENDING bookings can be edited");
		}

		validateTimeRange(req.startTime(), req.endTime());
		validateDate(req.date());

		try {
			Resource resource = resourceService.getEntityById(req.resourceId());
			if (resource.getStatus() != ResourceStatus.ACTIVE) {
				throw new ConflictException("Selected resource is not active");
			}
		} catch (ResourceNotFoundException ignored) {
			// Temporary fallback: allow static category options when resources are not seeded yet.
		}

		assertNoConflict(req.resourceId(), req.date(), req.startTime(), req.endTime(), bookingId);

		booking.setStudentId(req.studentId());
		booking.setStudentName(req.studentName());
		booking.setFaculty(req.faculty());
		booking.setResourceId(req.resourceId());
		booking.setResourceName(req.resourceName());
		booking.setDate(req.date());
		booking.setStartTime(req.startTime());
		booking.setEndTime(req.endTime());
		booking.setPurpose(req.purpose());
		booking.setAttendeesCount(req.attendeesCount());

		Booking saved = bookingRepository.save(booking);
		return toResponse(saved);
	}

	public List<BookingResponseDTO> getMyBookings(String userId) {
		if (userId == null || userId.isBlank()) {
			throw new IllegalArgumentException("userId is required");
		}

		return bookingRepository.findByUserIdOrderByDateDescStartTimeDesc(userId).stream()
				.sorted(Comparator.comparing(Booking::getDate).thenComparing(Booking::getStartTime))
				.map(this::toResponse)
				.toList();
	}

	public List<BookingResponseDTO> getAllBookings(
			BookingStatus status,
			LocalDate date,
			String resourceId
	) {
		return bookingRepository.findAll().stream()
				.filter(booking -> status == null || booking.getStatus() == status)
				.filter(booking -> date == null || date.equals(booking.getDate()))
				.filter(booking -> resourceId == null || resourceId.isBlank() || resourceId.equals(booking.getResourceId()))
				.sorted(Comparator.comparing(Booking::getDate).thenComparing(Booking::getStartTime))
				.map(this::toResponse)
				.toList();
	}

	public BookingResponseDTO approveBooking(String bookingId) {
		Booking booking = getBookingOrThrow(bookingId);
		if (booking.getStatus() != BookingStatus.PENDING) {
			throw new ConflictException("Only PENDING bookings can be approved");
		}
		assertNoConflict(
				booking.getResourceId(),
				booking.getDate(),
				booking.getStartTime(),
				booking.getEndTime(),
				booking.getId()
		);

		booking.setStatus(BookingStatus.APPROVED);
		booking.setRejectionReason(null);
		Booking saved = bookingRepository.save(booking);

		notificationService.create(
				saved.getUserId(),
				NotificationService.TYPE_BOOKING_UPDATE,
				"Booking approved for " + saved.getResourceName() + " on " + saved.getDate()
		);
		return toResponse(saved);
	}

	public BookingResponseDTO rejectBooking(String bookingId, BookingRejectRequestDTO request) {
		Booking booking = getBookingOrThrow(bookingId);
		if (booking.getStatus() != BookingStatus.PENDING) {
			throw new ConflictException("Only PENDING bookings can be rejected");
		}

		booking.setStatus(BookingStatus.REJECTED);
		booking.setRejectionReason(request.reason());
		Booking saved = bookingRepository.save(booking);

		notificationService.create(
				saved.getUserId(),
				NotificationService.TYPE_BOOKING_UPDATE,
				"Booking rejected for "
						+ saved.getResourceName()
						+ " on "
						+ saved.getDate()
						+ ". Reason: "
						+ request.reason()
		);
		return toResponse(saved);
	}

	public BookingResponseDTO cancelBooking(String bookingId, String userId) {
		Booking booking = getBookingOrThrow(bookingId);
		if (!booking.getUserId().equals(userId)) {
			throw new IllegalArgumentException("Only the booking owner can cancel this booking");
		}
		if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
			throw new ConflictException("Only PENDING or APPROVED bookings can be cancelled");
		}

		booking.setStatus(BookingStatus.CANCELLED);
		Booking saved = bookingRepository.save(booking);

		notificationService.create(
				saved.getUserId(),
				NotificationService.TYPE_BOOKING_UPDATE,
				"Booking cancelled for " + saved.getResourceName() + " on " + saved.getDate()
		);
		return toResponse(saved);
	}

	private Booking getBookingOrThrow(String id) {
		return bookingRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
	}

	private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
		if (!startTime.isBefore(endTime)) {
			throw new IllegalArgumentException("startTime must be before endTime");
		}
	}

	private void validateDate(LocalDate date) {
		if (date.isBefore(LocalDate.now())) {
			throw new IllegalArgumentException("date must not be in the past");
		}
	}

	private void assertNoConflict(
			String resourceId,
			LocalDate date,
			LocalTime startTime,
			LocalTime endTime,
			String excludeBookingId
	) {
		List<BookingStatus> blockingStatuses = List.of(BookingStatus.PENDING, BookingStatus.APPROVED);
		List<Booking> existingBookings =
				bookingRepository.findByResourceIdAndDateAndStatusIn(resourceId, date, blockingStatuses);

		for (Booking existing : existingBookings) {
			if (excludeBookingId != null && excludeBookingId.equals(existing.getId())) {
				continue;
			}

			boolean overlaps = startTime.isBefore(existing.getEndTime())
					&& endTime.isAfter(existing.getStartTime());
			if (overlaps) {
				throw new ConflictException(
						"Conflict detected: the resource is already booked during the requested time window"
				);
			}
		}
	}

	private BookingResponseDTO toResponse(Booking b) {
		return new BookingResponseDTO(
				b.getId(),
				b.getUserId(),
				b.getStudentId(),
				b.getStudentName(),
				b.getFaculty(),
				b.getResourceId(),
				b.getResourceName(),
				b.getDate(),
				b.getStartTime(),
				b.getEndTime(),
				b.getPurpose(),
				b.getAttendeesCount(),
				b.getStatus(),
				b.getRejectionReason(),
				b.getCreatedAt());
	}
}
