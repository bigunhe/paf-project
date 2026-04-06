package com.smartcampus.auth;

import com.smartcampus.auth.dto.UserResponse;
import com.smartcampus.auth.model.User;
import com.smartcampus.core.exception.ResourceNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class UserService {

	private final UserRepository userRepository;

	public UserService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public List<UserResponse> findAll() {
		return userRepository.findAll().stream().map(this::toResponse).toList();
	}

	public UserResponse getById(String id) {
		return userRepository.findById(id).map(this::toResponse)
				.orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
	}

	private UserResponse toResponse(User u) {
		return new UserResponse(u.getId(), u.getEmail(), u.getName(), u.getRole(), u.getOauthProviderId());
	}
}
