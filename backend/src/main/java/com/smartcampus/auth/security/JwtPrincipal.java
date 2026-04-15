package com.smartcampus.auth.security;

import com.smartcampus.auth.model.RoleType;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Authenticated identity from signed JWT (and dev-login). Role comes from DB at token issue time.
 */
public class JwtPrincipal implements UserDetails {

	private final String userId;
	private final String email;
	private final RoleType role;

	public JwtPrincipal(String userId, String email, RoleType role) {
		this.userId = userId;
		this.email = email;
		this.role = role;
	}

	public String getUserId() {
		return userId;
	}

	public RoleType getRole() {
		return role;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
	}

	@Override
	public String getPassword() {
		return "";
	}

	@Override
	public String getUsername() {
		return email != null ? email : userId;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}
}
