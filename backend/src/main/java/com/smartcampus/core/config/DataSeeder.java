package com.smartcampus.core.config;

import com.smartcampus.auth.model.RoleType;
import com.smartcampus.auth.model.User;
import com.smartcampus.auth.UserRepository;
import com.smartcampus.facilities.ResourceRepository;
import com.smartcampus.facilities.model.Resource;
import com.smartcampus.facilities.model.ResourceStatus;
import com.smartcampus.facilities.model.ResourceType;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds fixed IDs matching frontend dev constants (see frontend/src/features/core/constants.js).
 */
@Component
public class DataSeeder implements ApplicationRunner {

	public static final String DEV_USER_ID = "64a1b9d0b2fc8e4b9a000001";
	public static final String DEV_ADMIN_ID = "64a1b9d0b2fc8e4b9a000002";
	public static final String RESOURCE_AUDITORIUM_ID = "64b8f1a00000000000000101";
	public static final String RESOURCE_LAB_ID = "64b8f1a00000000000000102";
	public static final String RESOURCE_MEETING_ROOM_ID = "64b8f1a00000000000000103";
	public static final String RESOURCE_PROJECTOR_ID = "64b8f1a00000000000000104";
	public static final String RESOURCE_CAMERA_ID = "64b8f1a00000000000000105";

	private final UserRepository userRepository;
	private final ResourceRepository resourceRepository;

	public DataSeeder(UserRepository userRepository, ResourceRepository resourceRepository) {
		this.userRepository = userRepository;
		this.resourceRepository = resourceRepository;
	}

	@Override
	public void run(ApplicationArguments args) {
		if (userRepository.findById(DEV_USER_ID).isEmpty()) {
			userRepository.save(User.builder()
					.id(DEV_USER_ID)
					.email("student@my.sliit.lk")
					.name("Student User")
					.role(RoleType.USER)
					.oauthProviderId("dev-user")
					.build());
		}
		if (userRepository.findById(DEV_ADMIN_ID).isEmpty()) {
			userRepository.save(User.builder()
					.id(DEV_ADMIN_ID)
					.email("admin@my.sliit.lk")
					.name("Campus Admin")
					.role(RoleType.ADMIN)
					.oauthProviderId("dev-admin")
					.build());
		}

		seedResource(RESOURCE_AUDITORIUM_ID, "Main Auditorium", ResourceType.ROOM, 250, "Block A, Ground Floor",
				"Mon-Fri 08:00-20:00", ResourceStatus.ACTIVE);
		seedResource(RESOURCE_LAB_ID, "Computer Lab 2", ResourceType.LAB, 40, "Block C, 2nd Floor",
				"Mon-Fri 08:00-18:00", ResourceStatus.ACTIVE);
		seedResource(RESOURCE_MEETING_ROOM_ID, "Meeting Room 4B", ResourceType.ROOM, 12, "Block B, 4th Floor",
				"Mon-Fri 09:00-17:00", ResourceStatus.ACTIVE);
		seedResource(RESOURCE_PROJECTOR_ID, "Portable Projector P-12", ResourceType.EQUIPMENT, 1,
				"Media Store, Block A", "Mon-Sat 09:00-17:00", ResourceStatus.ACTIVE);
		seedResource(RESOURCE_CAMERA_ID, "Conference Camera Kit", ResourceType.EQUIPMENT, 1,
				"Media Store, Block A", "Mon-Fri 09:00-17:00", ResourceStatus.OUT_OF_SERVICE);
	}

	private void seedResource(String id, String name, ResourceType type, int capacity, String location,
			String availabilityWindow, ResourceStatus status) {
		if (resourceRepository.findById(id).isEmpty()) {
			resourceRepository.save(Resource.builder()
					.id(id)
					.name(name)
					.type(type)
					.capacity(capacity)
					.location(location)
					.availabilityWindow(availabilityWindow)
					.status(status)
					.build());
		}
	}
}
