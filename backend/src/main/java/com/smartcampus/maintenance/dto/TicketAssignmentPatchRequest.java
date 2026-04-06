package com.smartcampus.maintenance.dto;

import jakarta.validation.constraints.NotBlank;

public record TicketAssignmentPatchRequest(@NotBlank String technicianAssigned) {}
