package com.smartcampus.maintenance.dto;

import jakarta.validation.constraints.NotBlank;

public record TicketAssignmentRequest(@NotBlank String technicianAssigned) {}
