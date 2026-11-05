# Doctor Tracker — Full-Stack Healthcare Management Portal

A commercial-grade, full-stack healthcare administrative application built with **Next.js 15+ (App Router)** and a standalone **Node.js / Express REST API** powered by **MongoDB**.

---

## 🏗️ Monorepo Architecture

```
doctor-tracker/
├── doctor-tracker-backend/       # Standalone Node.js, Express & TypeScript REST API (Port 5001)
├── doctor-tracker-frontend/      # Next.js 15+ App Router, Tailwind CSS & shadcn/ui (Port 3000)
├── IMPLEMENTATION_PLAN.md        # Complete Architectural Blueprint (v2.0)
└── README.md                     # Root Project Documentation
```

### Key Highlights
- **Strict Separation of Concerns**: Decoupled Next.js client application and standalone Express REST API.
- **Secure Authentication**: HTTP-only cookie-based JWT session management with CSRF defense, SameSite isolation, and independent server-side token validation.
- **Doctor & Patient Management**: Full CRUD with server-side pagination, compound B-tree indexing, case-insensitive sanitized regex search, and non-destructive patient disassociation on doctor deletion.
- **High-Performance Analytics**: Optimized concurrent MongoDB aggregations executing in parallel via `Promise.all` for KPI overviews and targeted Recharts data visualizations.
- **Enterprise UI/UX**: Designed to modern clinical healthcare SaaS standards with deep slate sidebar navigation, accessible interactive data tables, and zero generic AI templates.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** >= 18.0.0
- **MongoDB** >= 6.0 (Local instance or MongoDB Atlas cluster)

### 2. Backend Setup
```bash
cd doctor-tracker-backend
cp .env.example .env
npm install
npm run seed       # Seeds initial admin, sample doctors and patients
npm run dev        # Starts REST API on http://localhost:5001
```

### 3. Frontend Setup (Coming in Phase 4)
```bash
cd doctor-tracker-frontend
cp .env.example .env
npm install
npm run dev        # Starts Next.js app on http://localhost:3000
```

---

## 🔐 Default Seed Credentials (Local Development)
- **Portal URL**: `http://localhost:3000/login`
- **Admin Email**: `admin@doctortracker.io`
- **Admin Password**: `DoctorTracker2026!`

---

## 📋 Architectural Plan
See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for full technical design details, data models, API specifications, and the phased roadmap.

