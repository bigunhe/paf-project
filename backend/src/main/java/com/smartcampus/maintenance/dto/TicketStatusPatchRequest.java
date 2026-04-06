package com.smartcampus.maintenance.dto;

import com.smartcampus.maintenance.model.TicketStatus;
import jakarta.validation.constraints.NotNull;

public record TicketStatusPatchRequest(@NotNull TicketStatus status) {}
