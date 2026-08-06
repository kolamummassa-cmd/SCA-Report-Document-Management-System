# Database ER Diagram
## SCA Report & Document Management System

**Version:** 1.0 (Phase 1 — Draft for Approval)
**Date:** August 7, 2026
**ORM:** Prisma · **Database:** PostgreSQL 15+

This document defines the logical data model. Physical Prisma schema (`schema.prisma`) with exact field types, indexes, and migrations will be produced in Phase 2 once this model is approved.

---

## 1. Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ REPORT : "prepares"
    USER ||--o{ DOCUMENT : "authors"
    USER ||--o{ ACTIVITY_LOG : "performs"
    USER ||--o{ AUDIT_LOG : "performs"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ COMMENT : "writes"
    USER ||--o{ SESSION : "holds"
    USER }o--|| ROLE : "assigned"
    USER }o--o| DEPARTMENT : "belongs to"

    ROLE ||--o{ ROLE_PERMISSION : "grants"
    PERMISSION ||--o{ ROLE_PERMISSION : "granted via"

    DEPARTMENT ||--o{ PROGRAMME : "oversees"
    PROGRAMME ||--o{ PROJECT : "contains"
    PROJECT ||--o{ REPORT : "scopes"
    PROGRAMME ||--o{ REPORT : "scopes"
    DEPARTMENT ||--o{ REPORT : "scopes"

    REPORT_TYPE ||--o{ REPORT : "classifies"
    REPORT ||--o{ REPORT_REVISION : "has history"
    REPORT ||--o{ APPROVAL : "goes through"
    REPORT ||--o{ COMMENT : "receives"
    REPORT ||--o{ FILE : "attaches"
    REPORT }o--o| LOCATION : "occurs at"

    DOCUMENT ||--o{ DOCUMENT_VERSION : "has versions"
    DOCUMENT ||--o{ FILE : "stores as"
    DOCUMENT }o--o{ CATEGORY : "categorized by"
    DOCUMENT }o--o{ TAG : "tagged with"
    DOCUMENT ||--o{ COMMENT : "receives"
    DOCUMENT }o--o| PROGRAMME : "relates to"
    DOCUMENT }o--o| PROJECT : "relates to"
    DOCUMENT }o--o| DEPARTMENT : "relates to"
    DOCUMENT }o--o| LOCATION : "relates to"

    FILE }o--|| USER : "uploaded by"

    APPROVAL }o--|| USER : "actioned by"

    NOTIFICATION }o--o| REPORT : "about"
    NOTIFICATION }o--o| DOCUMENT : "about"

    SETTING ||--|| ORGANIZATION_PROFILE : "configures"

    USER {
        uuid id PK
        string firstName
        string lastName
        string email UK
        string passwordHash
        string phone
        uuid roleId FK
        uuid departmentId FK
        boolean isEmailVerified
        boolean isActive
        int failedLoginAttempts
        datetime lockedUntil
        datetime lastLoginAt
        datetime createdAt
        datetime updatedAt
    }

    ROLE {
        uuid id PK
        string name UK
        string description
        boolean isSystemRole
    }

    PERMISSION {
        uuid id PK
        string resource
        string action
        string description
    }

    ROLE_PERMISSION {
        uuid id PK
        uuid roleId FK
        uuid permissionId FK
    }

    DEPARTMENT {
        uuid id PK
        string name UK
        string description
        uuid headUserId FK
    }

    PROGRAMME {
        uuid id PK
        string name
        string description
        uuid departmentId FK
        string status
    }

    PROJECT {
        uuid id PK
        string name
        string description
        uuid programmeId FK
        string status
        date startDate
        date endDate
        decimal budgetAllocated
    }

    LOCATION {
        uuid id PK
        string country
        string region
        string county
        string subCounty
        string ward
        decimal latitude
        decimal longitude
    }

    REPORT_TYPE {
        uuid id PK
        string name UK
        string cadence
        json approvalChainTemplate
    }

    REPORT {
        uuid id PK
        string reportNumber UK
        string title
        uuid reportTypeId FK
        uuid programmeId FK
        uuid projectId FK
        uuid departmentId FK
        date periodStart
        date periodEnd
        uuid locationId FK
        uuid preparedById FK
        uuid supervisorId FK
        text executiveSummary
        text objectives
        text activitiesConducted
        text achievements
        text challenges
        text lessonsLearned
        text recommendations
        text nextSteps
        int beneficiariesMale
        int beneficiariesFemale
        int beneficiariesChildren
        int beneficiariesAdults
        int beneficiariesPWD
        decimal budgetAllocated
        decimal budgetUsed
        decimal budgetRemaining
        string digitalSignature
        string status
        boolean isSensitive
        tsvector searchVector
        datetime createdAt
        datetime updatedAt
    }

    REPORT_REVISION {
        uuid id PK
        uuid reportId FK
        int versionNumber
        json snapshot
        uuid changedById FK
        datetime createdAt
    }

    APPROVAL {
        uuid id PK
        uuid reportId FK
        int stepOrder
        uuid approverId FK
        string decision
        text remarks
        datetime decidedAt
    }

    COMMENT {
        uuid id PK
        uuid authorId FK
        uuid reportId FK
        uuid documentId FK
        text body
        datetime createdAt
    }

    DOCUMENT {
        uuid id PK
        string title
        string documentType
        uuid authorId FK
        uuid programmeId FK
        uuid projectId FK
        uuid departmentId FK
        uuid locationId FK
        int year
        text description
        string status
        boolean isSensitive
        tsvector searchVector
        datetime createdAt
        datetime updatedAt
    }

    DOCUMENT_VERSION {
        uuid id PK
        uuid documentId FK
        int versionNumber
        uuid fileId FK
        uuid uploadedById FK
        text changeNote
        datetime createdAt
    }

    FILE {
        uuid id PK
        string originalName
        string storageKey
        string mimeType
        bigint sizeBytes
        string checksumSha256
        string storageProvider
        uuid uploadedById FK
        uuid reportId FK
        uuid documentId FK
        datetime createdAt
    }

    CATEGORY {
        uuid id PK
        string name UK
        uuid parentCategoryId FK
    }

    TAG {
        uuid id PK
        string name UK
    }

    NOTIFICATION {
        uuid id PK
        uuid userId FK
        string type
        string title
        text body
        boolean isRead
        uuid reportId FK
        uuid documentId FK
        datetime createdAt
    }

    ACTIVITY_LOG {
        uuid id PK
        uuid userId FK
        string action
        string entityType
        uuid entityId
        json metadata
        datetime createdAt
    }

    AUDIT_LOG {
        uuid id PK
        uuid userId FK
        string action
        string entityType
        uuid entityId
        string ipAddress
        string userAgent
        json beforeState
        json afterState
        datetime createdAt
    }

    SESSION {
        uuid id PK
        uuid userId FK
        string refreshTokenHash
        string deviceInfo
        string ipAddress
        datetime expiresAt
        datetime revokedAt
        datetime createdAt
    }

    SETTING {
        uuid id PK
        string key UK
        json value
    }

    ORGANIZATION_PROFILE {
        uuid id PK
        string name
        string mission
        string vision
        string logoUrl
        string email
        string phone
        string registrationDetails
    }
```

---

## 2. Entity Notes

| Entity | Purpose |
|---|---|
| **User / Role / Permission / RolePermission** | Core RBAC. `RolePermission` is a join table enabling many-to-many role↔permission mapping; users may additionally receive scoped overrides (e.g., a Programme Manager scoped to one Programme) via a `UserScope` extension added in Phase 2 if needed. |
| **Department / Programme / Project** | Organizational hierarchy: Department → Programme → Project. Reports and Documents can be tagged at any level. |
| **Location** | Shared, reusable location record (country/region/county/sub-county/ward + optional GPS) referenced by both Reports and Documents to avoid duplicated free-text location data. |
| **ReportType** | Defines cadence (daily/weekly/monthly/quarterly/annual/ad-hoc) and a template for the approval chain, so workflow is configurable without code changes. |
| **Report** | Central record for all report content described in the SRS. `isSensitive` flags child-identifying content for restricted access. `searchVector` backs full-text search. |
| **ReportRevision** | Immutable snapshot on every submit/resubmit — powers revision history and diff view. |
| **Approval** | One row per step in a report's approval chain; supports multi-step workflows. |
| **Comment** | Polymorphic-by-nullable-FK: attaches to either a Report or a Document. |
| **Document / DocumentVersion / File** | `Document` is the logical record (metadata, categorization); `DocumentVersion` tracks version history; `File` is the physical artifact (one File per version, also reusable for Report attachments). |
| **Category / Tag** | Many-to-many classification independent of the Department/Programme/Project hierarchy, for cross-cutting taxonomy (e.g., "Training Manual", "Success Story"). |
| **Notification** | In-app + email notification log, optionally linked to the Report or Document that triggered it. |
| **ActivityLog / AuditLog** | Separated intentionally: `ActivityLog` is lightweight "recent activity" for UI feeds; `AuditLog` is the compliance-grade, immutable security record capturing before/after state, IP, and user agent. |
| **Session** | Tracks refresh tokens per device for revocation and "active sessions" management. |
| **Setting / OrganizationProfile** | Key-value system settings plus a dedicated organization profile record for branding and legal details. |

---

## 3. Indexing Strategy (Preview)

- `Report.reportNumber`, `Document` search fields: unique/GIN indexes.
- `Report.searchVector`, `Document.searchVector`: GIN indexes for full-text search.
- Composite indexes on (`programmeId`, `projectId`, `departmentId`, `status`, `createdAt`) for both Report and Document to accelerate the dashboard and filter queries.
- `AuditLog(entityType, entityId, createdAt)` for fast per-record history lookups.

Full index and constraint definitions will ship with the Phase 2 Prisma schema.

---

*End of Database ER Diagram — Phase 1 deliverable.*
