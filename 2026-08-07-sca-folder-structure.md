# Folder Structure
## SCA Report & Document Management System

**Version:** 1.0 (Phase 1 — Draft for Approval)
**Date:** August 7, 2026

Monorepo layout using npm/pnpm workspaces, organized by feature within each app for clean-code and SOLID compliance.

```
sca-rdms/
├── apps/
│   ├── web/                              # Next.js frontend
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── forgot-password/page.tsx
│   │   │   │   ├── reset-password/page.tsx
│   │   │   │   └── verify-email/page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx            # Sidebar + header shell
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── reports/
│   │   │   │   │   ├── page.tsx          # List + filters
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   └── [reportId]/
│   │   │   │   │       ├── page.tsx      # Detail
│   │   │   │   │       └── edit/page.tsx
│   │   │   │   ├── documents/
│   │   │   │   │   ├── page.tsx          # Repository browser
│   │   │   │   │   ├── upload/page.tsx
│   │   │   │   │   └── [documentId]/page.tsx
│   │   │   │   ├── search/page.tsx
│   │   │   │   ├── analytics/page.tsx
│   │   │   │   ├── calendar/page.tsx
│   │   │   │   ├── notifications/page.tsx
│   │   │   │   ├── audit-log/page.tsx
│   │   │   │   └── settings/
│   │   │   │       ├── organization/page.tsx
│   │   │   │       ├── users/page.tsx
│   │   │   │       ├── roles-permissions/page.tsx
│   │   │   │       ├── departments/page.tsx
│   │   │   │       ├── programmes/page.tsx
│   │   │   │       ├── projects/page.tsx
│   │   │   │       ├── storage-backup/page.tsx
│   │   │   │       └── email-config/page.tsx
│   │   │   ├── layout.tsx                 # Root layout (theme provider)
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/                        # shadcn/ui primitives
│   │   │   ├── reports/                   # ReportForm, ReportCard, ApprovalTimeline...
│   │   │   ├── documents/                 # DocumentCard, VersionHistory, PreviewModal...
│   │   │   ├── dashboard/                 # SummaryCard, ChartPanel...
│   │   │   ├── analytics/                 # Recharts wrappers
│   │   │   ├── calendar/
│   │   │   ├── notifications/
│   │   │   └── layout/                    # Sidebar, Header, Breadcrumbs
│   │   ├── features/
│   │   │   ├── auth/                      # hooks, api client, schemas
│   │   │   ├── reports/
│   │   │   ├── documents/
│   │   │   ├── analytics/
│   │   │   ├── users/
│   │   │   └── settings/
│   │   ├── lib/
│   │   │   ├── api-client.ts              # Axios/fetch wrapper + interceptors
│   │   │   ├── query-client.ts            # TanStack Query setup
│   │   │   ├── auth-context.tsx
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   ├── public/
│   │   │   └── branding/                  # SCA logo, favicon
│   │   ├── styles/
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── api/                               # Express backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   │   ├── auth.routes.ts
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── auth.repository.ts
│       │   │   │   ├── auth.validation.ts
│       │   │   │   └── auth.test.ts
│       │   │   ├── users/
│       │   │   ├── roles-permissions/
│       │   │   ├── departments/
│       │   │   ├── programmes/
│       │   │   ├── projects/
│       │   │   ├── reports/
│       │   │   │   ├── reports.routes.ts
│       │   │   │   ├── reports.controller.ts
│       │   │   │   ├── reports.service.ts        # approval workflow logic
│       │   │   │   ├── reports.repository.ts
│       │   │   │   ├── reports.validation.ts
│       │   │   │   ├── report-numbering.service.ts
│       │   │   │   └── reports.test.ts
│       │   │   ├── documents/
│       │   │   │   ├── documents.routes.ts
│       │   │   │   ├── documents.controller.ts
│       │   │   │   ├── documents.service.ts
│       │   │   │   ├── documents.repository.ts
│       │   │   │   ├── documents.validation.ts
│       │   │   │   └── documents.test.ts
│       │   │   ├── files/
│       │   │   │   ├── storage-adapter.interface.ts
│       │   │   │   ├── local-disk.adapter.ts
│       │   │   │   ├── s3-compatible.adapter.ts
│       │   │   │   └── files.service.ts
│       │   │   ├── search/
│       │   │   ├── analytics/
│       │   │   ├── notifications/
│       │   │   ├── calendar/
│       │   │   ├── audit-log/
│       │   │   ├── activity-log/
│       │   │   ├── settings/
│       │   │   └── backups/
│       │   ├── middleware/
│       │   │   ├── authenticate.ts
│       │   │   ├── authorize.ts           # RBAC permission check
│       │   │   ├── rate-limit.ts
│       │   │   ├── error-handler.ts
│       │   │   ├── request-logger.ts
│       │   │   └── audit-capture.ts
│       │   ├── jobs/                      # BullMQ background jobs
│       │   │   ├── reminder-emails.job.ts
│       │   │   ├── backup.job.ts
│       │   │   ├── export-generation.job.ts
│       │   │   └── thumbnail-generation.job.ts
│       │   ├── lib/
│       │   │   ├── prisma.ts
│       │   │   ├── redis.ts
│       │   │   ├── mailer.ts
│       │   │   ├── pdf-generator.ts
│       │   │   ├── excel-generator.ts
│       │   │   └── logger.ts
│       │   ├── config/
│       │   │   ├── env.ts                 # Zod-validated environment config
│       │   │   └── constants.ts
│       │   ├── app.ts                     # Express app assembly (helmet, cors, routes)
│       │   ├── server.ts                  # Entry point
│       │   └── worker.ts                  # Background worker entry point
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       ├── tests/
│       │   ├── integration/
│       │   └── unit/
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── shared-types/                      # Types/interfaces shared web ↔ api
│   ├── shared-schemas/                    # Zod schemas shared web ↔ api
│   └── config/                            # Shared eslint/tsconfig/prettier
│
├── infra/
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   ├── nginx/
│   │   └── nginx.conf
│   └── scripts/
│       ├── backup-db.sh
│       ├── backup-storage.sh
│       └── restore.sh
│
├── docs/
│   ├── srs.md
│   ├── architecture.md
│   ├── er-diagram.md
│   ├── user-flow.md
│   ├── ui-design-plan.md
│   ├── roadmap.md
│   ├── api-documentation.md               # Phase 4+
│   ├── installation-guide.md               # Later phase
│   └── deployment-guide.md                 # Later phase
│
├── .env.example
├── .github/workflows/ci.yml
├── package.json                            # workspace root
├── pnpm-workspace.yaml
└── README.md
```

---

## Notes

- **Feature-based, not layer-based, top-level organization** inside each app — each module under `modules/` owns its routes, controller, service, repository, and validation, keeping related code together (per the Development Roadmap's SOLID/repository-pattern requirement).
- **`packages/shared-schemas`** lets Zod validation rules be authored once and consumed by both React Hook Form (client) and Express middleware (server), avoiding drift between frontend and backend validation.
- **`infra/`** isolates all deployment concerns (Docker, Nginx, backup scripts) from application code.
- **`docs/`** in the repo will mirror the standalone documents in this project folder, so the codebase is self-documenting once Phase 2 begins.

---

*End of Folder Structure — Phase 1 deliverable.*
