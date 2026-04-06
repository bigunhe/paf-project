package com.smartcampus.facilities.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resources")
public class Resource {

	@Id
	private String id;
	private String name;
	private ResourceType type;
	private int capacity;
	private String location;
	private ResourceStatus status;
}
