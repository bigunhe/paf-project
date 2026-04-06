package com.smartcampus.core.config;

import com.smartcampus.auth.model.RoleType;
import com.smartcampus.auth.model.User;
import com.smartcampus.auth.UserRepository;
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

	private final UserRepository userRepository;

	public DataSeeder(UserRepository userRepository) {
		this.userRepository = userRepository;
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
	}
}
