package com.smartcampus.facilities.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resources")
public class Resource {

	@MongoId(targetType = FieldType.STRING)
	private String id;
	private String name;
	private ResourceType type;
	private int capacity;
	private String location;
	private String availabilityWindow;
	private ResourceStatus status;
}
