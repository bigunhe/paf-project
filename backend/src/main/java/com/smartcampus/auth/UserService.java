package com.smartcampus.auth;

import com.smartcampus.auth.dto.ProfilePatchRequest;
import com.smartcampus.auth.dto.UserAccountPatchRequest;
import com.smartcampus.auth.dto.UserResponse;
import com.smartcampus.auth.model.RoleType;
import com.smartcampus.auth.model.User;
import com.smartcampus.auth.model.UserType;
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

	/** Resolve role from DB; create new users as USER by default. */
	public User upsertFromOAuth(String email, String name, String oauthProviderId) {
		return userRepository
				.findByEmailIgnoreCase(email)
				.map(existing -> {
					boolean changed = false;
					if (name != null && !name.equals(existing.getName())) {
						existing.setName(name);
						changed = true;
					}
					if (oauthProviderId != null && !oauthProviderId.equals(existing.getOauthProviderId())) {
						existing.setOauthProviderId(oauthProviderId);
						changed = true;
					}
					return changed ? userRepository.save(existing) : existing;
				})
				.orElseGet(
						() -> userRepository.save(User.builder()
								.email(email)
								.name(name != null ? name : email)
								.role(RoleType.USER)
								.oauthProviderId(oauthProviderId)
								.userType(UserType.UNASSIGNED)
								.profileCompleted(false)
								.build()));
	}

	public User getEntityById(String id) {
		return userRepository
				.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
	}

	public UserResponse updateProfile(String userId, ProfilePatchRequest request) {
		if (request.userType() == UserType.UNASSIGNED) {
			throw new IllegalArgumentException("userType must be STUDENT, LECTURER, or STAFF");
		}
		User u = getEntityById(userId);
		u.setUserType(request.userType());
		u.setContactNumber(request.contactNumber().trim());
		u.setUniversityId(request.universityId().trim());
		u.setAcademicUnit(request.academicUnit().trim());
		u.setProfileCompleted(true);
		return toResponse(userRepository.save(u));
	}

	public UserResponse updateAccount(String userId, UserAccountPatchRequest request) {
		if (request.userType() == UserType.UNASSIGNED) {
			throw new IllegalArgumentException("userType must be STUDENT, LECTURER, or STAFF");
		}
		User u = getEntityById(userId);
		u.setName(request.name().trim());
		u.setUserType(request.userType());
		u.setContactNumber(request.contactNumber().trim());
		u.setUniversityId(request.universityId().trim());
		u.setAcademicUnit(request.academicUnit().trim());
		u.setProfileCompleted(true);
		return toResponse(userRepository.save(u));
	}

	public void deleteById(String userId) {
		User existing = getEntityById(userId);
		userRepository.delete(existing);
	}

	private UserResponse toResponse(User u) {
		UserType userType = u.getUserType() != null ? u.getUserType() : UserType.UNASSIGNED;
		boolean profileCompleted = Boolean.TRUE.equals(u.getProfileCompleted());
		return new UserResponse(
				u.getId(),
				u.getEmail(),
				u.getName(),
				u.getRole(),
				u.getOauthProviderId(),
				userType,
				profileCompleted,
				u.getContactNumber(),
				u.getUniversityId(),
				u.getAcademicUnit());
	}
}
