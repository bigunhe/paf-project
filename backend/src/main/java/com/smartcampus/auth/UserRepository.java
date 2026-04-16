package com.smartcampus.auth;

import com.smartcampus.auth.model.RoleType;
import com.smartcampus.auth.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {

	Optional<User> findByEmailIgnoreCase(String email);

	List<User> findByRole(RoleType role);
}
