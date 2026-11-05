# Doctor Tracker — Frontend Web Application

Modern, commercial-grade clinical administration portal built with **Next.js 15+ (App Router)**, **TypeScript**, and **Tailwind CSS**.

## Design System & UX Standards
- **Palette Tokens**: Deep slate navigation (`#0F172A`), clinical canvas background (`#F8FAFC`), and vibrant medical blue accent (`#2563EB`).
- **Clinical Status Tags**: Active (`emerald-50`), Under Treatment (`amber-50`), Critical (`rose-50` with pulsing indicator), and Discharged (`slate-100`).
- **Responsive Layout**: Full desktop sidebar (256px), mobile sliding navigation drawer, sticky header with dynamic breadcrumbs, and accessible data tables.
- **Data Flow & Cache**: TanStack Query (v5) providing seamless caching, background invalidations, and optimistic mutations.

## Local Setup Guide

### 1. Installation
```bash
cd doctor-tracker-frontend
npm install
```

### 2. Environment Configuration
Copy the template configuration:
```bash
cp .env.example .env.local
```
- `NEXT_PUBLIC_API_URL`: REST API endpoint (default: `http://localhost:5001/api/v1`)

### 3. Execution
```bash
# Development server on port 3000
npm run dev

# Production build and preview
npm run build
npm start
```

