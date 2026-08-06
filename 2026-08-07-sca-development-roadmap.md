# Development Roadmap
## SCA Report & Document Management System

**Version:** 1.0 (Phase 1 — Draft for Approval)
**Date:** August 7, 2026

This roadmap sequences everything after this Phase 1 planning set. Each phase ends with a checkpoint — work stops and waits for Kolamu's approval before the next phase begins, per project convention.

---

## Phase 1 — Planning & Design *(this deliverable set — complete, pending approval)*
- Software Requirements Specification
- System Architecture
- Database ER Diagram
- User Flow
- Folder Structure
- UI Design Plan
- Development Roadmap (this document)

**Checkpoint:** Await approval before writing any code.

---

## Phase 2 — Database & Backend Foundation
- Initialize monorepo per Folder Structure doc (`apps/web`, `apps/api`, `packages/*`, `infra/`).
- Write `schema.prisma` from the ER Diagram; generate and run initial migration.
- Seed data: SCA organization profile, default roles/permissions matrix, sample departments/programmes/projects, report types with cadences.
- Environment configuration (`.env.example`, Zod-validated `env.ts`).
- Base Express app: Helmet, CORS, request logging, global error handler.

**Checkpoint.**

---

## Phase 3 — Authentication & Authorization
- Register/login/forgot-password/reset-password/verify-email endpoints.
- JWT access + rotating refresh tokens, session table, account lockout logic.
- RBAC middleware (`authenticate`, `authorize`) wired to the permission matrix.
- Frontend auth pages (login, forgot/reset password, verify email) per UI Design Plan.
- Auth context + protected route handling in Next.js.

**Checkpoint.**

---

## Phase 4 — Core API: Reports & Documents
- Reports module: CRUD, report-numbering service, revision snapshots, approval workflow engine (configurable per Report Type), comments.
- Documents module: CRUD, categorization, tagging, version history, soft delete/restore.
- Files module: storage adapter interface + local-disk implementation; upload validation (MIME sniffing, size limits, extension allow-list).
- OpenAPI documentation scaffolding begins here and grows with each subsequent module.

**Checkpoint.**

---

## Phase 5 — Frontend Foundation & Design System
- Tailwind + shadcn/ui theme matching the UI Design Plan color tokens (light/dark).
- App shell: sidebar, header, breadcrumbs, theme toggle, global search entry point.
- Shared component library: tables, cards, badges, empty states, skeletons, dropzone.
- TanStack Query + API client wired to Phase 3/4 endpoints.

**Checkpoint.**

---

## Phase 6 — Reports UI
- Reports list (filters, pagination, status badges).
- Report create/edit multi-section form (React Hook Form + Zod, shared schemas).
- Report detail view: approval timeline, comments, revision history, export menu.
- Dashboard "pending approvals" and "my reports" widgets.

**Checkpoint.**

---

## Phase 7 — Document Management UI & Search
- Document repository (grid/table views, filter panel, upload flow).
- Document detail: preview pane, version history, audit history, sharing.
- Global search: PostgreSQL full-text indexing, faceted results page, command-palette-style quick search.

**Checkpoint.**

---

## Phase 8 — Analytics & Dashboard Completion
- Dashboard summary cards wired to live aggregate queries.
- Recharts visualizations: report volume trends, department/programme/project/staff performance, budget utilization, beneficiary statistics, geographical distribution.
- Drill-down interactions from charts to filtered record lists.
- Analytics export (CSV/image).

**Checkpoint.**

---

## Phase 9 — Exports, Notifications & Calendar
- PDF/Word/Excel/CSV/ZIP export generation (branded header/footer, logo, signature block, page numbers).
- Email notification templates + triggers (approval, rejection, deadline reminders by cadence).
- In-app notification center.
- Calendar view (deadlines, meetings, org events) driven by Report Type cadence data.

**Checkpoint.**

---

## Phase 10 — Audit Log, Settings & Admin Console
- Audit log capture middleware across all state-changing and sensitive-read actions; audit log UI with filters and diff view.
- Settings pages: organization profile/branding, users, roles & permissions, departments/programmes/projects, storage & backup config, email/SMTP config, system preferences.
- Backup scheduling (daily/weekly/monthly) + manual trigger + restore workflow.

**Checkpoint.**

---

## Phase 11 — Security Hardening, Testing & Accessibility Pass
- Rate limiting tuning, CSRF review, dependency/security audit, penetration-test-style review of file upload and auth flows.
- Unit tests (services, validation) and integration tests (critical API flows: auth, report approval, document upload/versioning).
- Accessibility audit against WCAG 2.1 AA; keyboard-navigation pass; reduced-motion support check.

**Checkpoint.**

---

## Phase 12 — Deployment & Documentation
- Docker Compose (dev) and production configuration; Nginx reverse proxy config.
- CI/CD pipeline (lint, typecheck, test, build, deploy).
- API documentation (OpenAPI/Swagger UI), Installation Guide, Deployment Guide.
- Production environment variables and go-live checklist.

**Checkpoint — Go-live readiness review.**

---

## Working Agreement

- No phase's code is written until the prior phase is explicitly approved.
- Each phase ends with a short summary (what was built, what's next) before moving on, per standing project instructions.
- All files for this project are created only inside the **SCA Report & Document Management System** folder; nothing outside it is touched without explicit request.
- New files follow the `YYYY-MM-DD-descriptive-name` naming convention.

---

*End of Development Roadmap — Phase 1 deliverable.*
