package com.smartcampus.auth.model;

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
@Document(collection = "users")
public class User {

	@Id
	private String id;
	private String email;
	private String name;
	private RoleType role;
	private String oauthProviderId;

	@Builder.Default
	private UserType userType = UserType.UNASSIGNED;

	@Builder.Default
	private Boolean profileCompleted = Boolean.FALSE;

	private String contactNumber;
	private String universityId;
	private String academicUnit;
}
