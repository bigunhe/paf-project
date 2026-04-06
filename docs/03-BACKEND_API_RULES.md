# 03 - BACKEND API AND ARCHITECTURE RULES

## 1. Tech Stack & Core Configuration
* **Framework:** Java Spring Boot (v3+)
* **Database:** Spring Data MongoDB
* **Build Tool:** Maven
* **Base API Path:** All endpoints MUST start with `/api/v1/`.

## 2. Strict Domain-Driven Packaging
Do NOT use a generic layered architecture (i.e., do not put all controllers in one `controllers` folder). You MUST use feature-based packaging to isolate team members' work.

```text
src/main/java/com/smartcampus/
├── core/             (Shared: GlobalExceptionHandler, DB Configs, CorsConfig)
├── facilities/       (Member 1: ResourceController, ResourceService, ResourceRepository, DTOs)
├── bookings/         (Member 2: BookingController, BookingService, BookingRepository, DTOs)
├── maintenance/      (Member 3: TicketController, TicketService, TicketRepository, DTOs)
├── auth/             (Member 4: AuthController, SecurityConfig)
└── notifications/    (Member 4: NotificationController, NotificationService)
3. The Internal Layered Flow (Strict Requirement)
Inside every feature package, data must flow strictly through these layers:

Controller (@RestController): Handles HTTP requests and responses. Contains NO business logic.

Service (@Service): Contains ALL business logic (e.g., Conflict checking for bookings, status validation).

Repository (extends MongoRepository): Handles database queries.

CRITICAL DTO RULE: Never accept or return a MongoDB @Document entity directly in a Controller. You MUST use Request and Response DTOs (Data Transfer Objects) to validate incoming payloads and format outgoing JSON.

4. RESTful API Naming & HTTP Methods
Endpoints must use plural nouns and standard HTTP verbs.

GET /api/v1/{resources} - Fetch all or filter.

GET /api/v1/{resources}/{id} - Fetch by ID.

POST /api/v1/{resources} - Create new.

PUT/PATCH /api/v1/{resources}/{id} - Update existing. (Use PATCH for status changes).

DELETE /api/v1/{resources}/{id} - Delete.

Example: /api/v1/bookings, /api/v1/tickets/{id}/comments

5. HTTP Status Codes (Strictly Enforced)
Return exact standard codes from Controllers:

200 OK: Successful GET, PUT, or PATCH.

201 Created: Successful POST.

204 No Content: Successful DELETE.

400 Bad Request: Validation failure (e.g., missing fields).

404 Not Found: Entity ID does not exist in the database.

409 Conflict: Business logic failure (e.g., Resource is double-booked).

6. Global Exception Handling
Do NOT use try/catch blocks in every controller.

Member 4 (or the team lead) will implement a single @RestControllerAdvice class in the core/ package to catch exceptions (like ResourceNotFoundException) and return a standardized JSON error response.