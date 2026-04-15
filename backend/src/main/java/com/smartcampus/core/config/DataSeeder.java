package com.smartcampus.core.config;

import com.smartcampus.auth.model.RoleType;
import com.smartcampus.auth.model.User;
import com.smartcampus.auth.model.UserType;
import com.smartcampus.auth.UserRepository;
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

/**
 * Seeds fixed IDs matching frontend dev constants (see frontend/src/features/core/constants.js).
 */
@Component
@Profile("local")
public class DataSeeder implements ApplicationRunner {

	public static final String DEV_USER_ID = "64a1b9d0b2fc8e4b9a000001";
	public static final String DEV_ADMIN_ID = "64a1b9d0b2fc8e4b9a000002";

	private final UserRepository userRepository;
	private final boolean resetRolesOnStartup;
	private final Set<String> adminEmails;

	public DataSeeder(
			UserRepository userRepository,
			@Value("${app.auth.reset-roles-on-startup:true}") boolean resetRolesOnStartup,
			@Value("${app.auth.admin-emails:admin.itpm@gmail.com}") String adminEmailsCsv) {
		this.userRepository = userRepository;
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
		ensureConfiguredAdminsExist();
		if (resetRolesOnStartup) {
			enforceRolePolicy();
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
