package com.smartcampus.facilities.dto;

import com.smartcampus.facilities.model.ResourceStatus;
import com.smartcampus.facilities.model.ResourceType;

public record ResourceResponse(
		String id,
		String name,
		ResourceType type,
		int capacity,
		String location,
		String availabilityWindow,
		ResourceStatus status
) {
}
