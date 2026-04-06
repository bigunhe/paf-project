# 01 - BUSINESS AND DATA MODEL (The Single Source of Truth)

## 1. Core Architecture & Database
* **Database Engine:** MongoDB
* **ODM:** Spring Data MongoDB
* **Primary Keys:** Use `String` for all IDs (this maps directly to MongoDB's default `ObjectId`).
* **Document Relationships:** Keep it flat. Store references as `String` IDs (e.g., store `resourceId` in the Booking document). DO NOT use `@DBRef` to avoid lazy-loading issues and keep the MVP fast.

---

## 2. Global Enums (Strictly Enforced Strings)
Whenever a status or type is used in the frontend or backend, it MUST exactly match these uppercase strings. No exceptions.

* **RoleType:** `USER`, `ADMIN`
* **ResourceType:** `ROOM`, `LAB`, `EQUIPMENT`
* **ResourceStatus:** `ACTIVE`, `OUT_OF_SERVICE`
* **BookingStatus:** `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`
* **TicketStatus:** `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `REJECTED`
* **TicketPriority:** `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

---

## 3. The Data Models (JSON Contracts)

When your Spring Boot backend sends data to the React frontend, or when React sends a payload to Spring Boot, it MUST match these exact JSON structures.

### Member 1: Facilities & Assets (Resource)
The master catalog item.

```json
{
  "id": "64b8f...",
  "name": "Main Auditorium",
  "type": "ROOM",
  "capacity": 250,
  "location": "Block A, 1st Floor",
  "status": "ACTIVE"
}
```

### Member 2: Booking Management (Booking Model)
CRITICAL LOGIC: Backend BookingService.java MUST manually check for time overlaps against existing APPROVED bookings for the same resourceId before saving.

```json
{
  "id": "64b9a2...",
  "resourceId": "64b8f1...",
  "userId": "64a1b9...",
  "startTime": "2026-04-15T09:00:00",
  "endTime": "2026-04-15T11:00:00",
  "purpose": "IT3030 Guest Lecture",
  "expectedAttendees": 200,
  "status": "PENDING",
  "adminReason": null,
  "createdAt": "2026-04-11T14:20:00"
}
```

### Member 3: Maintenance & Incident Ticketing (Ticket Model)
CRITICAL LOGIC: Tickets can hold up to 3 images (Base64 strings). Comments are embedded directly into the ticket document for MongoDB performance.

```json
{
  "id": "64b9c3...",
  "resourceId": "64b8f1...",
  "userId": "64a1b9...",
  "category": "Hardware Failure",
  "description": "Projector HDMI port is broken and screen is flickering.",
  "priority": "HIGH",
  "status": "OPEN",
  "contactDetails": "0771234567",
  "imageAttachments": [
    "data:image/jpeg;base64,/9j/4AAQSkZ...",
    "data:image/jpeg;base64,/9j/4AAQSkZ..."
  ],
  "resolutionNotes": null,
  "technicianAssigned": null,
  "comments": [
    {
      "commentId": "c1a2b3...",
      "userId": "64a1b9...",
      "content": "I checked the cable, it's definitely the port.",
      "createdAt": "2026-04-11T15:30:00"
    }
  ],
  "createdAt": "2026-04-11T15:00:00"
}
```

### Member 4: Users & Notifications (User & Notification Models)
CRITICAL LOGIC: Notifications must trigger when Member 2 approves a booking or Member 3 updates a ticket status.

**User Profile:**

```json
{
  "id": "64a1b9...",
  "email": "user@my.sliit.lk",
  "name": "Student User",
  "role": "USER",
  "oauthProviderId": "google-123456789"
}
```

**Notification Payload:**

```json
{
  "id": "64b9f4...",
  "userId": "64a1b9...",
  "type": "BOOKING_UPDATE",
  "message": "Your booking for Main Auditorium was APPROVED.",
  "isRead": false,
  "createdAt": "2026-04-12T09:15:00"
}
```
