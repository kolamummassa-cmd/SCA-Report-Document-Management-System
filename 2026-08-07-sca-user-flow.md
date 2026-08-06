# User Flow
## SCA Report & Document Management System

**Version:** 1.0 (Phase 1 — Draft for Approval)
**Date:** August 7, 2026

---

## 1. Authentication Flow (All Roles)

```mermaid
flowchart TD
    A[Visit login page] --> B{Has account?}
    B -- No --> C[Contact Super Admin to be provisioned]
    B -- Yes --> D[Enter email + password]
    D --> E{Credentials valid?}
    E -- No --> F{5 failed attempts?}
    F -- Yes --> G[Account locked 15 min]
    F -- No --> D
    E -- Yes --> H{Email verified?}
    H -- No --> I[Prompt to verify email]
    H -- Yes --> J[Issue JWT + refresh token]
    J --> K[Redirect to role-aware Dashboard]
    D --> L[Forgot password?]
    L --> M[Enter email] --> N[Receive reset link] --> O[Set new password] --> D
```

---

## 2. Report Lifecycle Flow (Project Officer → Programme Manager → Executive Director)

```mermaid
flowchart TD
    A[Project Officer: New Report] --> B[Fill report form:<br/>details, narrative, beneficiaries, budget, attachments]
    B --> C{Save as Draft or Submit?}
    C -- Draft --> D[Draft saved, editable anytime]
    D --> B
    C -- Submit --> E[Status: Submitted]
    E --> F[Notification to Supervisor / Programme Manager]
    F --> G{Programme Manager reviews}
    G -- Approve --> H[Status: Approved]
    G -- Reject --> I[Status: Rejected + remarks]
    I --> J[Notification to Officer]
    J --> B
    H --> K{Requires ED sign-off?<br/>e.g., Donor / Annual report}
    K -- Yes --> L{Executive Director reviews}
    L -- Approve --> M[Final: Approved]
    L -- Reject --> I
    K -- No --> M
    M --> N[Report locked, archived, downloadable<br/>PDF / Word / Excel / CSV]
    N --> O[Visible in Analytics + Search]
```

---

## 3. Document Upload & Versioning Flow (Any Uploading Role)

```mermaid
flowchart TD
    A[Open Document Repository] --> B[Click Upload]
    B --> C[Select file: PDF/DOC/XLS/PPT/Image/Video/ZIP]
    C --> D[System validates type, size, MIME signature]
    D -- Invalid --> E[Reject with clear error]
    D -- Valid --> F[Fill metadata:<br/>title, type, programme, project, department,<br/>location, tags, keywords, year]
    F --> G{Is this a new version of an existing document?}
    G -- Yes --> H[Attach as new Version + change note]
    G -- No --> I[Create new Document record]
    H --> J[Previous versions retained + downloadable]
    I --> K[Set permissions / sharing if non-default]
    J --> L[Document available: preview, download, comment]
    K --> L
    L --> M[Indexed for search + appears in Analytics]
```

---

## 4. Advanced Search Flow (Any Role, Permission-Filtered)

```mermaid
flowchart TD
    A[User types in global search] --> B[Apply filters:<br/>title, keywords, programme, project, department,<br/>location, author, year, date, type, status, file type]
    B --> C[Query hits full-text index]
    C --> D[Results filtered by user's RBAC scope]
    D --> E{Any results?}
    E -- No --> F[Show empty state + suggestions]
    E -- Yes --> G[Paginated results: reports + documents]
    G --> H[Open record: preview / download / view history]
```

---

## 5. Executive Director / Programme Manager — Analytics & Approvals Flow

```mermaid
flowchart TD
    A[Login] --> B[Dashboard: org-wide or programme-scoped cards + charts]
    B --> C{Pending approvals?}
    C -- Yes --> D[Open Approvals queue]
    D --> E[Review report detail + attachments]
    E --> F{Decision}
    F -- Approve --> G[Report advances / finalized]
    F -- Reject --> H[Return with remarks]
    C -- No --> I[Explore Analytics:<br/>programme/project/department/staff performance,<br/>budget utilization, beneficiary stats, geo distribution]
    I --> J[Drill into a chart segment]
    J --> K[Filtered report/document list]
    K --> L[Export analytics snapshot]
```

---

## 6. Monitoring & Evaluation Officer Flow

```mermaid
flowchart TD
    A[Login] --> B[M&E Dashboard]
    B --> C[View aggregated statistics across programmes/projects]
    C --> D[Generate Monitoring / Evaluation report]
    D --> E[Attach data, beneficiary stats, indicators]
    E --> F[Submit through approval workflow]
    F --> G[Export report or dataset: PDF / Excel / CSV]
```

---

## 7. Finance Officer Flow

```mermaid
flowchart TD
    A[Login] --> B[Finance module]
    B --> C[Upload finance documents:<br/>budgets, expenditure sheets, audit files]
    C --> D[Submit Finance Report<br/>budget allocated/used/remaining fields]
    D --> E[Approval workflow: Programme Manager / ED]
    E --> F[Finance analytics: budget utilization by programme/project]
```

---

## 8. Super Administrator Flow

```mermaid
flowchart TD
    A[Login] --> B[Admin console]
    B --> C[Manage Users: create, edit, deactivate, reset access]
    B --> D[Manage Roles & Permissions]
    B --> E[Manage Departments / Programmes / Projects]
    B --> F[Organization Profile & Branding]
    B --> G[Storage & Backup configuration]
    B --> H[Email/SMTP configuration]
    B --> I[View full Audit Log]
    B --> J[Trigger manual backup / restore]
```

---

## 9. Notes

- All flows are permission-gated; a user attempting an action outside their role sees a clear "not authorized" state rather than a broken UI.
- Every terminal action in these flows (submit, approve, reject, upload, delete, export, download) writes an Audit Log entry per SRS FR-8.1.
- Rejected reports always return to **Draft**, never silently vanish — full history is retained per FR-2.4.

---

*End of User Flow — Phase 1 deliverable.*
