package com.smartcampus.notifications;

import com.smartcampus.auth.model.RoleType;
import com.smartcampus.auth.security.JwtPrincipal;
import com.smartcampus.notifications.dto.NotificationResponse;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

	private final NotificationService notificationService;

	public NotificationController(NotificationService notificationService) {
		this.notificationService = notificationService;
	}

	@GetMapping
	@PreAuthorize("isAuthenticated()")
	public List<NotificationResponse> list(
			@RequestParam String userId, @AuthenticationPrincipal JwtPrincipal principal) {
		if (principal.getRole() != RoleType.ADMIN && !principal.getUserId().equals(userId)) {
			throw new AccessDeniedException("Cannot read another user's notifications");
		}
		return notificationService.listForUser(userId);
	}

	@PatchMapping("/{id}/read")
	@PreAuthorize("isAuthenticated()")
	public NotificationResponse markRead(@PathVariable String id) {
		return notificationService.markRead(id);
	}
}
