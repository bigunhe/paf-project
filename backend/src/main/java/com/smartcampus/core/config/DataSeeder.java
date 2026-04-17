package com.smartcampus.core.config;

import com.smartcampus.auth.model.RoleType;
import com.smartcampus.auth.model.User;
import com.smartcampus.auth.model.UserType;
import com.smartcampus.auth.UserRepository;
import com.smartcampus.facilities.ResourceRepository;
import com.smartcampus.facilities.model.Resource;
import com.smartcampus.facilities.model.ResourceStatus;
import com.smartcampus.facilities.model.ResourceType;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import org.springframework.core.annotation.Order;

/**
 * Seeds fixed IDs matching frontend dev constants (see frontend/src/features/core/constants.js).
 */
@Component
@Profile("local")
@Order(2)
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
	private final boolean resetRolesOnStartup;
	private final Set<String> adminEmails;

	public DataSeeder(
			UserRepository userRepository,
			ResourceRepository resourceRepository,
			@Value("${app.auth.reset-roles-on-startup:true}") boolean resetRolesOnStartup,
			@Value("${app.auth.admin-emails:admin.itpm@gmail.com}") String adminEmailsCsv) {
		this.userRepository = userRepository;
		this.resourceRepository = resourceRepository;
		this.resetRolesOnStartup = resetRolesOnStartup;
		this.adminEmails = Arrays.stream(adminEmailsCsv.split(","))
				.map(v -> v == null ? "" : v.trim().toLowerCase(Locale.ROOT))
				.filter(v -> !v.isBlank())
				.collect(Collectors.toSet());
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
					.userType(UserType.STUDENT)
					.profileCompleted(true)
					.contactNumber("0000000000")
					.universityId("IT21999999")
					.academicUnit("Computing")
					.build());
		}
		if (userRepository.findById(DEV_ADMIN_ID).isEmpty()) {
			userRepository.save(User.builder()
					.id(DEV_ADMIN_ID)
					.email("dev-admin@smartcampus.local")
					.name("Dev Admin User")
					.role(RoleType.USER)
					.oauthProviderId("dev-admin")
					.userType(UserType.STAFF)
					.profileCompleted(true)
					.contactNumber("0000000001")
					.universityId("STAFF-DEV-01")
					.academicUnit("Operations")
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

		// Added explicit lecture halls across buildings
		seedResource(new org.bson.types.ObjectId().toHexString(), "Lecture Hall A1", ResourceType.LECTURE_HALL, 120, "Block A, 1st Floor",
				"Mon-Fri 08:00-18:00", ResourceStatus.ACTIVE);
		seedResource(new org.bson.types.ObjectId().toHexString(), "Lecture Hall A2", ResourceType.LECTURE_HALL, 120, "Block A, 1st Floor",
				"Mon-Fri 08:00-18:00", ResourceStatus.ACTIVE);
		seedResource(new org.bson.types.ObjectId().toHexString(), "Lecture Hall B1", ResourceType.LECTURE_HALL, 150, "Block B, Ground Floor",
				"Mon-Fri 08:00-18:00", ResourceStatus.ACTIVE);
		seedResource(new org.bson.types.ObjectId().toHexString(), "Lecture Hall B2", ResourceType.LECTURE_HALL, 80, "Block B, 2nd Floor",
				"Mon-Fri 08:00-18:00", ResourceStatus.ACTIVE);
		seedResource(new org.bson.types.ObjectId().toHexString(), "Engineering Lab 1", ResourceType.LAB, 50, "Engineering Block, Ground Floor",
				"Mon-Fri 08:00-20:00", ResourceStatus.ACTIVE);
		seedResource(new org.bson.types.ObjectId().toHexString(), "Network Lab", ResourceType.LAB, 40, "Block C, 3rd Floor",
				"Mon-Fri 08:00-20:00", ResourceStatus.ACTIVE);
		seedResource(new org.bson.types.ObjectId().toHexString(), "Library East Wing", ResourceType.ROOM, 200, "Library, 1st Floor",
				"Mon-Sun 07:00-22:00", ResourceStatus.ACTIVE);

		ensureConfiguredAdminsExist();
		if (resetRolesOnStartup) {
			enforceRolePolicy();
		}
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

	private void ensureConfiguredAdminsExist() {
		for (String adminEmail : adminEmails) {
			boolean exists = userRepository.findByEmailIgnoreCase(adminEmail).isPresent();
			if (!exists) {
				userRepository.save(User.builder()
						.email(adminEmail)
						.name("Admin User")
						.role(RoleType.ADMIN)
						.oauthProviderId(null)
						.userType(UserType.STAFF)
						.profileCompleted(true)
						.contactNumber("0000000002")
						.universityId("admin-" + adminEmail.replace('@', '-'))
						.academicUnit("Administration")
						.build());
			}
		}
	}

	private void enforceRolePolicy() {
		List<User> users = userRepository.findAll();
		int promoted = 0;
		for (User u : users) {
			String email = u.getEmail() == null ? "" : u.getEmail().trim().toLowerCase(Locale.ROOT);
			RoleType target = adminEmails.contains(email) ? RoleType.ADMIN : RoleType.USER;
			if (u.getRole() != target) {
				u.setRole(target);
				userRepository.save(u);
			}
			if (target == RoleType.ADMIN) {
				promoted++;
			}
		}
		System.out.println(
				"[Auth bootstrap] role reset complete: totalUsers=" + users.size()
						+ ", adminsAfterPolicy=" + promoted
						+ ", adminEmails=" + adminEmails);
	}
}
