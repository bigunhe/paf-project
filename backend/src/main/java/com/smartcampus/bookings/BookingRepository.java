package com.smartcampus.bookings;

import com.smartcampus.bookings.model.Booking;
import com.smartcampus.bookings.model.BookingStatus;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BookingRepository extends MongoRepository<Booking, String> {

	List<Booking> findByResourceIdAndDateAndStatusIn(
			String resourceId,
			LocalDate date,
			List<BookingStatus> statuses
	);

	List<Booking> findByUserIdOrderByDateDescStartTimeDesc(String userId);
}