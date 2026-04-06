package com.smartcampus.notifications;

import com.smartcampus.notifications.dto.NotificationResponse;
import java.util.List;
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
	public List<NotificationResponse> list(@RequestParam String userId) {
		return notificationService.listForUser(userId);
	}

	@PatchMapping("/{id}/read")
	public NotificationResponse markRead(@PathVariable String id) {
		return notificationService.markRead(id);
	}
}
