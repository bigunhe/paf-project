package com.smartcampus.auth.security;

import com.smartcampus.auth.UserService;
import com.smartcampus.auth.model.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

	private final UserService userService;
	private final JwtService jwtService;

	@Value("${app.frontend.url:http://localhost:5173}")
	private String frontendUrl;

	public OAuth2LoginSuccessHandler(UserService userService, JwtService jwtService) {
		this.userService = userService;
		this.jwtService = jwtService;
	}

	@Override
	public void onAuthenticationSuccess(
			HttpServletRequest request, HttpServletResponse response, Authentication authentication)
			throws IOException {
		OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
		String email = oauth2User.getAttribute("email");
		if (email == null || email.isBlank()) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Email not provided by identity provider");
			return;
		}
		String name = oauth2User.getAttribute("name");
		String sub = oauth2User.getName();
		User user = userService.upsertFromOAuth(email, name, sub);
		String token = jwtService.createAccessToken(user);
		String target =
				frontendUrl + "/auth/callback?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
		if (request.getSession(false) != null) {
			request.getSession().invalidate();
		}
		getRedirectStrategy().sendRedirect(request, response, target);
	}
}
