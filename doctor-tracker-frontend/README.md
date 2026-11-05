# Doctor Tracker — Frontend Web Application

Modern, commercial-grade healthcare administration portal engineered with **Next.js 15+ (App Router)**, **TypeScript**, **Tailwind CSS**, **TanStack Query (v5)**, and **Recharts**.

---

## 1. Application Features

* **Authentication Guard**: Cookie-based authentication with `localStorage` user profile caching for instant page transitions without full-screen loading flash.
* **Clinical Operations Dashboard**: Real-time KPI summaries, continuous 30-day admission trends (Area Chart), condition distribution (Donut Chart), and practitioner caseload distribution (Bar Chart).
* **Doctor Directory**: Search by name/hospital/email (400ms debounce), filter by specialization and date, add/edit modals, and paginated data table.
* **Doctor Details**: Physician profile card with quick actions and assigned patients sub-table (add patient under doctor, unassign patient, delete patient).
* **Patient Directory**: Comprehensive patient roster with multi-criteria filtering (condition, status, doctor assignment, date range), color-coded status badges, and edit/delete modals.
* **Healthcare Design System**: Custom clinical color palette: Deep Slate sidebar (`#0F172A`), Hospital Canvas (`#F8FAFC`), and Medical Blue accent (`#2563EB`).

---

## 2. Directory Structure

```
doctor-tracker-frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/login/        # Admin authentication portal
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/       # Clinical operations dashboard
│   │   │   ├── doctors/         # Doctor directory & profile (/doctors/[id])
│   │   │   ├── patients/        # Patient directory
│   │   │   └── layout.tsx       # Auth guard & layout shell
│   │   ├── globals.css          # Tailwind CSS styles & custom scrollbars
│   │   ├── layout.tsx           # Root HTML shell
│   │   └── page.tsx             # Root redirect
│   ├── components/
│   │   ├── common/              # ConfirmDialog, DataTablePagination, EmptyState, TableSkeleton
│   │   ├── doctors/             # DoctorFormModal, AddPatientToDoctorModal
│   │   ├── layout/              # Sidebar, Header, MobileNav
│   │   ├── patients/            # PatientFormModal
│   │   └── providers/           # AppProviders (QueryClient, AuthProvider, Toaster)
│   ├── context/                 # AuthContext (cookie verification & user caching)
│   ├── hooks/                   # useDoctors, usePatients, useAnalytics, useDebounce
│   ├── lib/                     # Axios client (withCredentials) & utility functions
│   ├── types/                   # Shared TypeScript interfaces
│   └── validations/             # Zod client-side form schemas
├── package.json
└── tsconfig.json
```

---

## 3. Environment Configuration (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
```

---

## 4. Scripts

```bash
# Install dependencies
npm install

# Run development server on port 3000
npm run dev

# Run TypeScript type check
npm run type-check

# Compile production build
npm run build

# Start production server
npm start
```
