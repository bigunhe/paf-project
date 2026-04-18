**PROJECT CONTEXT & CURRENT TASK:**
The core infrastructure for the "Smart Campus Operations Hub" (React + Spring Boot + MongoDB) is established. I need to implement a mandatory Profile Onboarding Flow for fresh users logging in via Google OAuth. 

**BUSINESS LOGIC:**
When a user authenticates via OAuth, we only get their email and name. If they are a new user, they MUST be forced to complete their profile before accessing any dashboards or features. We must categorize users into three distinct types (`STUDENT`, `LECTURER`, `STAFF`) to handle permissions and feature priorities later (e.g., Lecturers might get automatic booking approvals, while Students require Admin review).

Execute the following implementations step-by-step:

### Step 1: Update the Backend MongoDB Schema (`UserEntity.java`)
Modify the existing User model to accommodate the new profile requirements. Keep the schema flat. 
Add the following fields:
1. `userType` (Enum: `STUDENT`, `LECTURER`, `STAFF`, `UNASSIGNED`) - Default to `UNASSIGNED` on first OAuth login.
2. `profileCompleted` (Boolean) - Default to `false`.
3. `contactNumber` (String).
4. `universityId` (String) - This will store the Student Number (e.g., IT21xxxxxx), Lecturer ID, or Staff ID depending on the user type.
5. `academicUnit` (String) - This will store the Faculty (for students) or Department (for lecturers/staff).

### Step 2: Build the Frontend Routing Guard (The Interceptor)
Update the React routing logic (likely in `App.jsx` or a custom `ProtectedRoute` wrapper) to enforce the profile check.
* **Logic:** If `currentUser` exists AND `currentUser.profileCompleted === false`, instantly redirect them to `/complete-profile`. 
* **Constraint:** Block access to `/dashboard`, `/bookings`, `/tickets`, and all other authenticated routes until `profileCompleted` is true.

### Step 3: Build the Dynamic Profile Setup UI (`ProfileSetup.jsx`)
Create a new React component for the `/complete-profile` route. 
* **UI Structure:** Use standard Tailwind CSS formatting (centered card, clean form).
* **Dynamic Form Logic:**
  - The first field MUST be a dropdown to select `User Type` (Student, Lecturer, Staff).
  - **If Student is selected:** Render inputs for "Student Number" and a dropdown for "Faculty" (e.g., Computing, Business, Engineering).
  - **If Lecturer is selected:** Render inputs for "Lecturer ID" and "Department".
  - **If Staff is selected:** Render inputs for "Staff ID" and "Department".
  - Always render a field for "Contact Number".
* **Submission:** On submit, send a `PUT` or `PATCH` request to `/api/v1/users/{id}/profile` to update the backend, set `profileCompleted` to `true`, and redirect the user to their respective dashboard.

### Step 4: Implement Permission/Priority Scaffolding
In the backend Service layers (e.g., `BookingService.java`), add placeholder logic comments or basic checks demonstrating how `userType` affects priority. 
* *Example:* When creating a booking, if `user.getUserType() == LECTURER`, set status immediately to `APPROVED`. If `STUDENT`, set status to `PENDING`. 

Ensure all generated code follows the existing architectural rules, uses DTOs for the backend updates, and strictly uses Tailwind CSS for the frontend.