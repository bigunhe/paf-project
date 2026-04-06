package com.smartcampus.bookings;

import com.smartcampus.bookings.model.Booking;
import com.smartcampus.bookings.model.BookingStatus;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BookingRepository extends MongoRepository<Booking, String> {

	List<Booking> findByResourceIdAndStatus(String resourceId, BookingStatus status);

	List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);
}
