package com.smartcampus.notifications;

import com.smartcampus.auth.UserRepository;
import com.smartcampus.auth.model.RoleType;
import com.smartcampus.auth.model.User;
import com.smartcampus.core.exception.ResourceNotFoundException;
import com.smartcampus.notifications.dto.NotificationResponse;
import com.smartcampus.notifications.model.Notification;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

	public static final String TYPE_BOOKING_UPDATE = "BOOKING_UPDATE";
	public static final String TYPE_TICKET_UPDATE = "TICKET_UPDATE";

	private final NotificationRepository notificationRepository;
	private final UserRepository userRepository;

	public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
		this.notificationRepository = notificationRepository;
		this.userRepository = userRepository;
	}

	public List<NotificationResponse> listForUser(String userId) {
		return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
				.map(this::toResponse)
				.toList();
	}

	public void create(String userId, String type, String message) {
		create(userId, type, message, null, null);
	}

	public void create(String userId, String type, String message, String linkPath, String entityId) {
		Notification n = Notification.builder()
				.userId(userId)
				.type(type)
				.message(message)
				.linkPath(linkPath)
				.entityId(entityId)
				.readFlag(false)
				.createdAt(LocalDateTime.now())
				.build();
		notificationRepository.save(n);
	}

	/** One persisted row per ADMIN user (fan-out). */
	public void notifyAdmins(String type, String message, String linkPath, String entityId) {
		List<User> admins = userRepository.findByRole(RoleType.ADMIN);
		for (User admin : admins) {
			create(admin.getId(), type, message, linkPath, entityId);
		}
	}

	public NotificationResponse markRead(String id, String readerUserId) {
		Notification n = notificationRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
		if (!n.getUserId().equals(readerUserId)) {
			throw new AccessDeniedException("Cannot mark another user's notification read");
		}
		n.setReadFlag(true);
		return toResponse(notificationRepository.save(n));
	}

	private NotificationResponse toResponse(Notification n) {
		return new NotificationResponse(
				n.getId(),
				n.getUserId(),
				n.getType(),
				n.getMessage(),
				n.getLinkPath(),
				n.getEntityId(),
				n.isReadFlag(),
				n.getCreatedAt());
	}
}
