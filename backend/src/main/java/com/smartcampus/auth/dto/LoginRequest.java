package com.smartcampus.auth.dto;

public record LoginRequest(String email, String password, String role) {
}
