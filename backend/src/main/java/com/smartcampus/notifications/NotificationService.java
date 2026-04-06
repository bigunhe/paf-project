package com.smartcampus.notifications;

import com.smartcampus.notifications.dto.NotificationResponse;
import com.smartcampus.notifications.model.Notification;
import com.smartcampus.core.exception.ResourceNotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

	public static final String TYPE_BOOKING_UPDATE = "BOOKING_UPDATE";
	public static final String TYPE_TICKET_UPDATE = "TICKET_UPDATE";

	private final NotificationRepository notificationRepository;

	public NotificationService(NotificationRepository notificationRepository) {
		this.notificationRepository = notificationRepository;
	}

	public List<NotificationResponse> listForUser(String userId) {
		return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
				.map(this::toResponse)
				.toList();
	}

	public void create(String userId, String type, String message) {
		Notification n = Notification.builder()
				.userId(userId)
				.type(type)
				.message(message)
				.readFlag(false)
				.createdAt(LocalDateTime.now())
				.build();
		notificationRepository.save(n);
	}

	public NotificationResponse markRead(String id) {
		Notification n = notificationRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
		n.setReadFlag(true);
		return toResponse(notificationRepository.save(n));
	}

	private NotificationResponse toResponse(Notification n) {
		return new NotificationResponse(
				n.getId(), n.getUserId(), n.getType(), n.getMessage(), n.isReadFlag(), n.getCreatedAt());
	}
}
