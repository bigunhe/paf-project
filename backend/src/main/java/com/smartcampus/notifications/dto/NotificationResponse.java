package com.smartcampus.notifications.dto;

import java.time.LocalDateTime;

public record NotificationResponse(
		String id,
		String userId,
		String type,
		String message,
		boolean isRead,
		LocalDateTime createdAt
) {
}
