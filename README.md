# Smart Campus Operations Hub

A campus facility booking and maintenance management system.

## Features

- **Book Facilities** – Rooms, labs, and equipment with instant availability check
- **Report Maintenance** – Submit tickets with photos and track status  
- **Manage Resources** – Admin dashboard for approvals and resource setup
- **Get Notifications** – Real-time updates on bookings and tickets

## Requirements

- Java 17+
- Node.js 16+
- MongoDB 5.0+

## Installation & Setup

### 1. Configure MongoDB

Create or start MongoDB on your machine:

- macOS:
 ```
brew services start mongodb-community@7.0
```
- Windows: Start the MongoDB service from the Services app
- Linux:
  ```
  sudo systemctl start mongod
  ```

### 2. Backend Configuration

Create `backend/src/main/resources/application-local.properties`:

properties
```
spring.data.mongodb.uri=mongodb://localhost:27017/smartcampus
jwt.secret=your-32-character-secret-key-here
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_SECRET
frontend.url=http://localhost:5173
```

### 3. Frontend Configuration

Create `frontend/.env.local`:

```
VITE_API_ORIGIN=http://localhost:8080
```


### 4. Install & Run

Terminal 1 – Backend:

```
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```


### Terminal 2 – Frontend:

```
cd frontend
npm install
npm run dev
```

Open: 
```
http://localhost:5173
```

### Test Login (No Google Auth Needed)

```
http://localhost:8080/api/v1/auth/dev-login?as=user
http://localhost:8080/api/v1/auth/dev-login?as=admin
```

###Troubleshooting

Port already in use? – Change port in application.properties

MongoDB connection fails? – Verify MongoDB is running and the URI is correct

npm install fails? – Try npm cache clean --force then reinstall

