package com.smartcampus.bookings.config;

import com.smartcampus.bookings.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Optional local-only wipe of the bookings collection. Enable explicitly with
 * {@code app.dev.clear-bookings-on-startup=true} (never default on).
 */
@Component
@Profile("local")
public class BookingDevCleanupRunner implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(BookingDevCleanupRunner.class);

	private final BookingRepository bookingRepository;
	private final boolean clearBookingsOnStartup;

	public BookingDevCleanupRunner(
			BookingRepository bookingRepository,
			@Value("${app.dev.clear-bookings-on-startup:false}") boolean clearBookingsOnStartup) {
		this.bookingRepository = bookingRepository;
		this.clearBookingsOnStartup = clearBookingsOnStartup;
	}

	@Override
	public void run(ApplicationArguments args) {
		if (!clearBookingsOnStartup) {
			return;
		}
		long before = bookingRepository.count();
		bookingRepository.deleteAll();
		log.warn("[dev] Cleared bookings collection (app.dev.clear-bookings-on-startup=true). Removed {} documents.", before);
	}
}
