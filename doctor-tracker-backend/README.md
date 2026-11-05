# Doctor Tracker — Backend REST API

Standalone Node.js, Express, TypeScript, and MongoDB RESTful API powering the Doctor Tracker healthcare administration platform.

---

## 1. Architecture Highlights

* **Port**: Runs independently on port `5001`.
* **State Management**: Stateless HTTP REST API with HTTP-only cookie-based JWT sessions.
* **Database**: MongoDB with Mongoose ODM, utilizing compound B-tree indexes for fast filtered lookups and aggregation pipelines for analytics.
* **Error Handling**: Centralized error middleware with custom `AppError` subclasses and safe duplicate-key (`E11000`) recovery.
* **Validation**: Zod schema validation middleware running before every route controller.

---

## 2. Directory Structure

```
doctor-tracker-backend/
├── src/
│   ├── config/              # Environment (Zod validated) & Database connection
│   ├── controllers/         # Auth, Doctor, Patient, and Analytics controllers
│   ├── middlewares/         # Auth, Error handling, and Validation middlewares
│   ├── models/              # Mongoose schemas (Admin, Doctor, Patient)
│   ├── routes/              # Express API route definitions
│   ├── scripts/             # Database seed script (admin, doctors, patients)
│   ├── types/               # TypeScript interfaces & Express Request augmentations
│   ├── utils/               # AppError, JWT, Cookies, QueryBuilder utilities
│   ├── validations/         # Zod validation schemas
│   ├── app.ts               # Express application initialization & middleware chain
│   └── server.ts            # HTTP server entry point with graceful shutdown
├── package.json
└── tsconfig.json
```

---

## 3. Environment Configuration (`.env`)

```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/doctor-tracker?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_64_character_cryptographic_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@doctortracker.io
ADMIN_PASSWORD=DoctorTracker2026!
```

---

## 4. Scripts

```bash
# Install dependencies
npm install

# Seed initial admin and clinical database records
npm run seed

# Run in development mode (ts-node-dev with hot reload)
npm run dev

# Run TypeScript type check
npm run type-check

# Compile production build to dist/
npm run build

# Start production server
npm start
```

---

## 5. Security Architecture

1. **Authentication**: Admin passwords hashed using `bcrypt` with 12 salt rounds. Access tokens signed with HMAC-SHA256 and transmitted via `httpOnly` cookies with `sameSite` and `secure` configurations.
2. **CORS & Preflight**: Whitelisted origin matching `FRONTEND_URL` with `credentials: true`.
3. **Regex Search Sanitization**: All user query inputs pass through `escapeRegex()` before construction of `RegExp` objects, preventing ReDoS attacks.
4. **Non-destructive Cascades**: When a doctor is deleted, assigned patients are atomically updated with `{ doctorId: null }` using `updateMany`, preserving clinical history.
