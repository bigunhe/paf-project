package com.smartcampus.bookings.config;

import com.smartcampus.bookings.BookingRepository;
import com.smartcampus.maintenance.TicketRepository;
import com.smartcampus.notifications.NotificationRepository;
import com.smartcampus.facilities.ResourceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import org.springframework.core.annotation.Order;

/**
 * Optional local-only wipe of the bookings collection. Enable explicitly with
 * {@code app.dev.clear-bookings-on-startup=true} (never default on).
 */
@Component
@Profile("local")
@Order(1)
public class BookingDevCleanupRunner implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(BookingDevCleanupRunner.class);

	private final BookingRepository bookingRepository;
	private final TicketRepository ticketRepository;
	private final NotificationRepository notificationRepository;
	private final ResourceRepository resourceRepository;
	private final boolean clearBookingsOnStartup;

	public BookingDevCleanupRunner(
			BookingRepository bookingRepository,
			TicketRepository ticketRepository,
			NotificationRepository notificationRepository,
			ResourceRepository resourceRepository,
			@Value("${app.dev.clear-bookings-on-startup:false}") boolean clearBookingsOnStartup) {
		this.bookingRepository = bookingRepository;
		this.ticketRepository = ticketRepository;
		this.notificationRepository = notificationRepository;
		this.resourceRepository = resourceRepository;
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

		long beforeTickets = ticketRepository.count();
		ticketRepository.deleteAll();
		log.warn("[dev] Cleared tickets collection. Removed {} documents.", beforeTickets);

		long beforeNotifs = notificationRepository.count();
		notificationRepository.deleteAll();
		log.warn("[dev] Cleared notifications collection. Removed {} documents.", beforeNotifs);

		long beforeResources = resourceRepository.count();
		resourceRepository.deleteAll();
		log.warn("[dev] Cleared resources collection. Removed {} documents.", beforeResources);
	}
}
