package com.smartcampus.maintenance.dto;

import jakarta.validation.constraints.NotBlank;

public record TicketCommentRequest(@NotBlank String userId, @NotBlank String content) {}
