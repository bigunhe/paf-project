package com.smartcampus.auth;

import com.smartcampus.auth.model.UserType;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Validates campus ID and faculty rules for profile onboarding and account updates.
 */
public final class ProfileFieldValidator {

	private static final Set<String> FACULTIES = Set.of("Computing", "Business", "Engineering");
	private static final Map<String, String> FACULTY_TO_PREFIX = Map.of(
			"Computing", "IT",
			"Business", "BM",
			"Engineering", "EN");

	private ProfileFieldValidator() {
	}

	public static String normalizeUniversityId(String raw) {
		if (raw == null) {
			return "";
		}
		return raw.trim().toUpperCase(Locale.ROOT);
	}

	public static void validateProfileFields(UserType userType, String academicUnitTrimmed, String universityIdNormalized) {
		if (userType == null || userType == UserType.UNASSIGNED) {
			throw new IllegalArgumentException("userType must be STUDENT, LECTURER, or STAFF");
		}
		switch (userType) {
			case STUDENT -> validateStudent(academicUnitTrimmed, universityIdNormalized);
			case LECTURER -> validateLecturerOrStaff(academicUnitTrimmed, universityIdNormalized, "LEC", "Lecturer");
			case STAFF -> validateLecturerOrStaff(academicUnitTrimmed, universityIdNormalized, "STF", "Staff");
			default -> throw new IllegalArgumentException("userType must be STUDENT, LECTURER, or STAFF");
		}
	}

	private static void requireFacultyDepartment(String faculty) {
		if (!FACULTIES.contains(faculty)) {
			throw new IllegalArgumentException("Department must be Computing, Business, or Engineering");
		}
	}

	private static void validateStudent(String faculty, String id) {
		requireFacultyDepartment(faculty);
		String prefix = FACULTY_TO_PREFIX.get(faculty);
		if (!id.matches("^" + prefix + "\\d{8}$")) {
			throw new IllegalArgumentException(
					"Student number must be " + prefix + " followed by 8 digits for " + faculty);
		}
	}

	private static void validateLecturerOrStaff(String faculty, String id, String prefixLetters, String label) {
		requireFacultyDepartment(faculty);
		if (!id.matches("^" + prefixLetters + "\\d{6}$")) {
			throw new IllegalArgumentException(
					label + " ID must be " + prefixLetters + " followed by 6 digits");
		}
	}
}
