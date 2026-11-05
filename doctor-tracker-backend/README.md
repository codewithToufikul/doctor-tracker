# Doctor Tracker — Backend REST API

Production-ready standalone RESTful API for Doctor Tracker, an administrative healthcare management system engineered with Node.js, Express, TypeScript, and MongoDB.

## Architecture & Design Decisions
- **HTTP-Only Cookie Authentication**: Session tokens are transmitted exclusively via secure HTTP-only cookies, preventing token exposure to client-side scripts (XSS).
- **Decoupled Architecture**: Standalone REST API operating on port 5001 independently from the Next.js frontend, enabling isolated horizontal scaling and dedicated security boundaries.
- **Centralized Operational Error Handling**: Custom error hierarchy (`AppError`, `NotFoundError`, `ConflictError`, etc.) with sanitized responses and graceful MongoDB duplicate-key (`E11000`) recovery.
- **Strict Data Validation**: Runtime schema validation via Zod for all incoming payloads and query parameters.

## Local Setup Guide

### 1. Prerequisites
- Node.js >= 18.0.0
- MongoDB >= 6.0 (or MongoDB Atlas connection URI)

### 2. Installation
```bash
git clone <repository-url> doctor-tracker-backend
cd doctor-tracker-backend
npm install
```

### 3. Environment Configuration
Copy the example environment configuration:
```bash
cp .env.example .env
```
Configure your environment parameters:
- `PORT`: Server port (default: `5001`)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: 64-character cryptographic secret
- `FRONTEND_URL`: Allowed CORS origin (default: `http://localhost:3000`)
- `ADMIN_EMAIL`: Seed admin email
- `ADMIN_PASSWORD`: Seed admin password

### 4. Database Seeding
```bash
npm run seed
```

### 5. Running the API
```bash
# Development mode with hot-reload
npm run dev

# Production build and execution
npm run build
npm start
```

