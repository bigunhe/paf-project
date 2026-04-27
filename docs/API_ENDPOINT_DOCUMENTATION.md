# API Endpoint Documentation

## Authentication

- METHOD: GET
- ENDPOINT: /oauth2/authorization/google
- LOCATION: frontend/src/features/core/constants.js (OAUTH_GOOGLE_URL), backend/src/main/java/com/smartcampus/core/config/SecurityConfig.java (permit path)
- DESCRIPTION: Starts Google OAuth2 login flow.
- REQUEST BODY: None
- RESPONSE: Redirect response to Google sign-in page.

- METHOD: GET
- ENDPOINT: /login/oauth2/code/{registrationId}
- LOCATION: backend/src/main/java/com/smartcampus/core/config/SecurityConfig.java (permit path), backend/src/main/java/com/smartcampus/auth/security/OAuth2LoginSuccessHandler.java (post-login redirect)
- DESCRIPTION: OAuth2 callback endpoint handled by Spring Security.
- REQUEST BODY: None
- RESPONSE: Redirect response to frontend callback route with token query parameter.

- METHOD: GET
- ENDPOINT: /api/v1/auth/me
- LOCATION: backend/src/main/java/com/smartcampus/auth/web/AuthController.java
- DESCRIPTION: Returns currently authenticated user profile.
- REQUEST BODY: None
- RESPONSE: UserResponse object { id, email, name, role, oauthProviderId, userType, profileCompleted, contactNumber, universityId, academicUnit }.

- METHOD: GET
- ENDPOINT: /api/v1/auth/dev-login?as={user|admin}
- LOCATION: backend/src/main/java/com/smartcampus/auth/web/DevAuthController.java
- DESCRIPTION: Issues JWT for seeded local development user.
- REQUEST BODY: None
- RESPONSE: AuthTokenResponse object { accessToken }.

## User Management

- METHOD: GET
- ENDPOINT: /api/v1/users
- LOCATION: backend/src/main/java/com/smartcampus/auth/UserController.java
- DESCRIPTION: Lists all users (admin access).
- REQUEST BODY: None
- RESPONSE: Array of UserResponse objects.

- METHOD: GET
- ENDPOINT: /api/v1/users/{id}
- LOCATION: backend/src/main/java/com/smartcampus/auth/UserController.java
- DESCRIPTION: Gets one user by id (self or admin).
- REQUEST BODY: None
- RESPONSE: UserResponse object.

- METHOD: PATCH
- ENDPOINT: /api/v1/users/{id}/profile
- LOCATION: backend/src/main/java/com/smartcampus/auth/UserController.java
- DESCRIPTION: Updates profile completion details for current user.
- REQUEST BODY: ProfilePatchRequest { userType, contactNumber, universityId, academicUnit }.
- RESPONSE: Updated UserResponse object.

- METHOD: PATCH
- ENDPOINT: /api/v1/users/{id}
- LOCATION: backend/src/main/java/com/smartcampus/auth/UserController.java
- DESCRIPTION: Updates account details for current user.
- REQUEST BODY: UserAccountPatchRequest { name, contactNumber, universityId, academicUnit }.
- RESPONSE: Updated UserResponse object.

- METHOD: DELETE
- ENDPOINT: /api/v1/users/{id}
- LOCATION: backend/src/main/java/com/smartcampus/auth/UserController.java
- DESCRIPTION: Deletes current user account.
- REQUEST BODY: None
- RESPONSE: 204 No Content.

## Resource Management

- METHOD: GET
- ENDPOINT: /api/v1/resources
- LOCATION: backend/src/main/java/com/smartcampus/facilities/ResourceController.java
- DESCRIPTION: Lists resources with optional filtering.
- REQUEST BODY: None
- RESPONSE: Array of ResourceResponse objects { id, name, type, capacity, location, availabilityWindow, status }.

- METHOD: GET
- ENDPOINT: /api/v1/resources/{id}
- LOCATION: backend/src/main/java/com/smartcampus/facilities/ResourceController.java
- DESCRIPTION: Gets one resource by id.
- REQUEST BODY: None
- RESPONSE: ResourceResponse object.

- METHOD: POST
- ENDPOINT: /api/v1/resources
- LOCATION: backend/src/main/java/com/smartcampus/facilities/ResourceController.java
- DESCRIPTION: Creates a new resource (admin access).
- REQUEST BODY: ResourceRequest { name, type, capacity, location, availabilityWindow, status }.
- RESPONSE: Created ResourceResponse object.

- METHOD: PUT
- ENDPOINT: /api/v1/resources/{id}
- LOCATION: backend/src/main/java/com/smartcampus/facilities/ResourceController.java
- DESCRIPTION: Updates an existing resource (admin access).
- REQUEST BODY: ResourceRequest { name, type, capacity, location, availabilityWindow, status }.
- RESPONSE: Updated ResourceResponse object.

- METHOD: DELETE
- ENDPOINT: /api/v1/resources/{id}
- LOCATION: backend/src/main/java/com/smartcampus/facilities/ResourceController.java
- DESCRIPTION: Deletes a resource (admin access).
- REQUEST BODY: None
- RESPONSE: 204 No Content.

## Bookings

- METHOD: GET
- ENDPOINT: /api/v1/bookings
- LOCATION: backend/src/main/java/com/smartcampus/bookings/BookingController.java
- DESCRIPTION: Lists bookings; supports user scoping.
- REQUEST BODY: None
- RESPONSE: Array of BookingResponse objects { id, resourceId, userId, startTime, endTime, purpose, expectedAttendees, status, adminReason, createdAt }.

- METHOD: POST
- ENDPOINT: /api/v1/bookings
- LOCATION: backend/src/main/java/com/smartcampus/bookings/BookingController.java
- DESCRIPTION: Creates a booking.
- REQUEST BODY: BookingRequest { resourceId, userId, startTime, endTime, purpose, expectedAttendees }.
- RESPONSE: Created BookingResponse object.

- METHOD: PUT
- ENDPOINT: /api/v1/bookings/{id}
- LOCATION: backend/src/main/java/com/smartcampus/bookings/BookingController.java
- DESCRIPTION: Updates booking details.
- REQUEST BODY: BookingUpdateRequest { resourceId, startTime, endTime, purpose, expectedAttendees }.
- RESPONSE: Updated BookingResponse object.

- METHOD: PATCH
- ENDPOINT: /api/v1/bookings/{id}/cancel
- LOCATION: backend/src/main/java/com/smartcampus/bookings/BookingController.java
- DESCRIPTION: Cancels a booking.
- REQUEST BODY: None
- RESPONSE: Updated BookingResponse object with canceled status.

- METHOD: PATCH
- ENDPOINT: /api/v1/bookings/{id}/status
- LOCATION: backend/src/main/java/com/smartcampus/bookings/BookingController.java
- DESCRIPTION: Updates booking status (admin access).
- REQUEST BODY: BookingStatusPatchRequest { status, adminReason }.
- RESPONSE: Updated BookingResponse object.

- METHOD: DELETE
- ENDPOINT: /api/v1/bookings/{id}
- LOCATION: backend/src/main/java/com/smartcampus/bookings/BookingController.java
- DESCRIPTION: Deletes a booking.
- REQUEST BODY: None
- RESPONSE: 204 No Content.

## Maintenance Tickets

- METHOD: GET
- ENDPOINT: /api/v1/tickets
- LOCATION: backend/src/main/java/com/smartcampus/maintenance/TicketController.java
- DESCRIPTION: Lists tickets; supports user scoping.
- REQUEST BODY: None
- RESPONSE: Array of TicketResponse objects { id, resourceId, userId, category, description, priority, status, contactDetails, imageAttachments, resolutionNotes, technicianAssigned, comments, createdAt }.

- METHOD: GET
- ENDPOINT: /api/v1/tickets/{id}
- LOCATION: backend/src/main/java/com/smartcampus/maintenance/TicketController.java
- DESCRIPTION: Gets one ticket by id.
- REQUEST BODY: None
- RESPONSE: TicketResponse object.

- METHOD: POST
- ENDPOINT: /api/v1/tickets
- LOCATION: backend/src/main/java/com/smartcampus/maintenance/TicketController.java
- DESCRIPTION: Creates a maintenance ticket.
- REQUEST BODY: TicketRequest { resourceId, userId, category, description, priority, contactDetails, imageAttachments }.
- RESPONSE: Created TicketResponse object.

- METHOD: PUT
- ENDPOINT: /api/v1/tickets/{id}
- LOCATION: backend/src/main/java/com/smartcampus/maintenance/TicketController.java
- DESCRIPTION: Updates ticket details.
- REQUEST BODY: TicketUpdateRequest { category, description, priority, contactDetails }.
- RESPONSE: Updated TicketResponse object.

- METHOD: PATCH
- ENDPOINT: /api/v1/tickets/{id}/status
- LOCATION: backend/src/main/java/com/smartcampus/maintenance/TicketController.java
- DESCRIPTION: Updates ticket status (admin access).
- REQUEST BODY: TicketStatusPatchRequest { status }.
- RESPONSE: Updated TicketResponse object.

- METHOD: PATCH
- ENDPOINT: /api/v1/tickets/{id}/assignment
- LOCATION: backend/src/main/java/com/smartcampus/maintenance/TicketController.java
- DESCRIPTION: Assigns ticket technician (admin access).
- REQUEST BODY: TicketAssignmentPatchRequest { technicianAssigned }.
- RESPONSE: Updated TicketResponse object.

- METHOD: POST
- ENDPOINT: /api/v1/tickets/{id}/comments
- LOCATION: backend/src/main/java/com/smartcampus/maintenance/TicketController.java
- DESCRIPTION: Adds a comment to ticket.
- REQUEST BODY: TicketCommentRequest { userId, content }.
- RESPONSE: Updated TicketResponse object with appended comments.

- METHOD: DELETE
- ENDPOINT: /api/v1/tickets/{id}
- LOCATION: backend/src/main/java/com/smartcampus/maintenance/TicketController.java
- DESCRIPTION: Deletes a ticket.
- REQUEST BODY: None
- RESPONSE: 204 No Content.

## Notifications

- METHOD: GET
- ENDPOINT: /api/v1/notifications
- LOCATION: backend/src/main/java/com/smartcampus/notifications/NotificationController.java
- DESCRIPTION: Lists notifications for a user.
- REQUEST BODY: None
- RESPONSE: Array of NotificationResponse objects { id, userId, type, message, linkPath, entityId, isRead, createdAt }.

- METHOD: PATCH
- ENDPOINT: /api/v1/notifications/{id}/read
- LOCATION: backend/src/main/java/com/smartcampus/notifications/NotificationController.java
- DESCRIPTION: Marks a notification as read.
- REQUEST BODY: None
- RESPONSE: Updated NotificationResponse object.
