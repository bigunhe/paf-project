package com.smartcampus.maintenance.model;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketComment {

	private String commentId;
	private String userId;
	private String content;
	private LocalDateTime createdAt;
}
