package com.smartcampus.core.config;

import com.smartcampus.auth.security.JwtAuthenticationFilter;
import com.smartcampus.auth.security.OAuth2LoginSuccessHandler;
import jakarta.servlet.http.HttpServletResponse;
import java.nio.charset.StandardCharsets;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

	@Bean
	public SecurityFilterChain securityFilterChain(
			HttpSecurity http,
			JwtAuthenticationFilter jwtAuthenticationFilter,
			OAuth2LoginSuccessHandler oauth2LoginSuccessHandler)
			throws Exception {
		http.csrf(AbstractHttpConfigurer::disable)
				.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
				.authorizeHttpRequests(
						auth -> auth.requestMatchers("/oauth2/**", "/login/oauth2/**", "/error")
								.permitAll()
								.requestMatchers(HttpMethod.OPTIONS, "/**")
								.permitAll()
								.requestMatchers("/api/v1/auth/dev-login")
								.permitAll()
								.requestMatchers("/api/v1/**")
								.authenticated())
				.oauth2Login(oauth -> oauth.successHandler(oauth2LoginSuccessHandler))
				.formLogin(AbstractHttpConfigurer::disable)
				.httpBasic(AbstractHttpConfigurer::disable)
				.exceptionHandling(ex -> ex.defaultAuthenticationEntryPointFor(
								new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
								new AntPathRequestMatcher("/api/v1/**"))
						.defaultAccessDeniedHandlerFor(
								(request, response, accessDeniedException) -> {
									response.setStatus(HttpServletResponse.SC_FORBIDDEN);
									response.setCharacterEncoding(StandardCharsets.UTF_8.name());
									response.setContentType("application/json;charset=UTF-8");
									response.getWriter().write("{\"message\":\"Forbidden\"}");
								},
								new AntPathRequestMatcher("/api/v1/**")));
		return http.build();
	}
}
