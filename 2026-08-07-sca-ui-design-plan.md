# UI Design Plan
## SCA Report & Document Management System

**Version:** 1.0 (Phase 1 — Draft for Approval)
**Date:** August 7, 2026

---

## 1. Design Direction

Inspiration is drawn from SCA's public website (www.sca.or.ke) — its "Heal. Protect. Restore." tone, calm imagery of community and children's safety, and clean editorial layout — translated into a data-dense enterprise console. Nothing is copied directly; the goal is a family resemblance: the same trust, warmth, and professionalism, applied to dashboards, tables, and forms instead of marketing pages. The visual bar is peer software used by UNICEF, UNHCR, World Vision, Save the Children, and USAID field offices: clean, credible, unflashy, and fast to scan.

**Design principles**
1. Clarity over decoration — data (report counts, statuses, budgets) is always the hero.
2. Calm, humanitarian palette — green (growth/protection) and blue (trust/stability), never harsh or alarmist except for genuine warnings (rejected, overdue, incident).
3. Consistent structure — every module (Reports, Documents, Analytics) shares the same shell, filter bar, and table/card patterns so staff with low technical proficiency learn the system once.
4. Accessible by default — WCAG 2.1 AA contrast and keyboard navigation throughout.

---

## 2. Brand & Color System

| Token | Light mode | Dark mode | Usage |
|---|---|---|---|
| `--color-primary` (SCA Green) | `#1B7A43` | `#3FAE6A` | Primary buttons, active nav, key metrics, brand accents |
| `--color-primary-foreground` | `#FFFFFF` | `#062412` | Text on primary |
| `--color-secondary` (SCA Blue) | `#1D5FA6` | `#5B9BE0` | Secondary actions, links, info states, charts |
| `--color-secondary-foreground` | `#FFFFFF` | `#04182C` | Text on secondary |
| `--color-background` | `#FFFFFF` | `#0F1A17` (dark slate, green-tinted) | App background |
| `--color-surface` | `#F7F9F8` | `#16221E` | Cards, panels |
| `--color-surface-muted` | `#EEF2F0` | `#1C2924` | Table stripes, subtle sections |
| `--color-border` | `#E2E8E5` | `#28362F` | Dividers, card borders |
| `--color-foreground` | `#111827` | `#E7EEEA` | Primary text |
| `--color-muted-foreground` | `#5B6B63` | `#9AACA3` | Secondary text |
| `--color-success` | `#1B7A43` | `#3FAE6A` | Approved |
| `--color-warning` | `#B7791F` | `#E0A83F` | Pending / draft |
| `--color-destructive` | `#B3261E` | `#E5534B` | Rejected / delete / incident |
| `--color-info` | `#1D5FA6` | `#5B9BE0` | Notices |

Dark mode is "dark slate" (near-black green-gray), not pure black, with the same green/blue accent pair for continuity — per the brief.

**Typography:** Inter (or system-ui fallback) for UI text — modern, highly legible at small sizes, wide language support (relevant given English/Swahili/French usage across Kenya/DRC operations). Type scale: 12/14/16/20/24/32/40px, base body 14–16px for data-dense tables.

**Spacing:** 4px base unit (4/8/12/16/24/32/48/64), consistent with Tailwind's default scale. Cards use 16–24px internal padding, 12–16px gaps in grids.

**Shape:** 8px radius for buttons/inputs, 12–16px for cards, subtle 1px borders + soft shadow (`shadow-sm`) rather than heavy drop shadows — matches the clean, restrained feel of the reference site.

---

## 3. Layout Shell

- **Desktop-first**, three-zone shell: collapsible left sidebar (nav), sticky top header (breadcrumbs, global search, notifications, user menu, theme toggle), main content area with consistent page header (title + primary action button, e.g., "New Report").
- **Sidebar:** Dashboard, Reports, Documents, Search, Analytics, Calendar, Notifications, Audit Log (admin/ED only), Settings — grouped with icons (lucide-react), collapsible to icon-only rail.
- **Tablet:** sidebar collapses to icon rail by default; content reflows to single/double column.
- **Mobile:** sidebar becomes a slide-over drawer; tables convert to stacked cards; filter bar collapses into a "Filters" sheet.

---

## 4. Key Screens

### 4.1 Login / Auth
Centered card on a soft green-to-blue gradient background with the SCA wordmark and tagline-style subhead (e.g., "Central Report & Document Platform"). Fields: email, password, "Forgot password?" link. Minimal, calm, no marketing clutter.

### 4.2 Dashboard
- Top row: 6–8 **summary cards** in a responsive grid (Total Reports, Reports Today, Pending, Approved, Rejected, Active Projects, Total Users, Storage Used) — each a rounded card with icon, big number, small trend indicator.
- Middle: **chart panels** (Recharts) — line/bar for Monthly/Quarterly/Yearly report volume, stacked bar for Department/Programme/Project performance, radial or gauge for Budget Utilization, map or grouped bar for Geographical Distribution.
- Bottom: **recent activity feed** and **pending approvals** list (role-aware — Officers see their own drafts/rejections; Approvers see their queue).
- Loading state: skeleton cards/charts, not spinners, to reduce perceived latency.

### 4.3 Reports — List
Professional data table (TanStack Table-style): columns for Report #, Title, Type, Programme/Project, Prepared By, Period, Status (colored badge), Updated. Sticky header, pagination, column sort, dense filter bar (type, status, programme, department, date range) collapsible into a filter drawer on smaller screens. Empty state illustrates "No reports yet" with a clear CTA.

### 4.4 Report — Create/Edit
Multi-section form (not a single giant scroll): tabs or accordion for **Details**, **Narrative** (executive summary, objectives, activities, achievements, challenges, lessons, recommendations, next steps), **Beneficiaries & Budget**, **Attachments** (drag-and-drop upload with progress), **Location** (with optional map pin for GPS). React Hook Form + Zod inline validation. Sticky "Save Draft / Submit" action bar.

### 4.5 Report — Detail
Read view mirrors the create layout but read-only, plus: **Approval Timeline** (visual stepper — Draft → Submitted → Approved/Rejected, with avatars, dates, remarks), **Comments** thread, **Revision History** (versioned diff view), **Export** menu (PDF/Word/Excel/CSV), digital signature block, and the report's official header/footer preview (logo, report number, generated date) matching the exported document.

### 4.6 Document Repository
Toggle between **grid view** (thumbnail cards — file-type icon or image/video preview) and **table view**. Left-hand filter panel: Year, Programme, Project, Department, Country/Region/County, Author, Document Type, Tags. Each card shows file type badge, size, version count, and quick actions (preview, download, share).

### 4.7 Document Detail
Large preview pane (PDF/image/Office viewer) + metadata sidebar (categorization, tags, author, dates) + **Version History** timeline + **Audit History** (who viewed/downloaded/edited) + Comments + Sharing/permissions panel.

### 4.8 Search
Persistent global search in the header expands to a full results page with faceted filters on the left (mirrors the field list in SRS FR-4.2) and mixed Report/Document results, clearly labeled by type, in a unified relevance-ranked list.

### 4.9 Analytics
Full-width, filterable (date range, programme, department) canvas of interactive Recharts visualizations: report completion rate, staff productivity, budget utilization, beneficiary statistics (stacked by male/female/children/adults/PWD), geographical distribution (bar/choropleth-style by county). Every chart is clickable to drill into the underlying record set.

### 4.10 Calendar
Month/week/list toggle. Color-coded chips: report deadlines (by cadence color), meetings, org events, and completed items shown with a check. Click a day to see agenda; upcoming deadlines surfaced in a side panel.

### 4.11 Audit Log
Dense, monospace-accented table (Actor, Action, Entity, Timestamp, IP) with filters by action type/date/user; row-click expands before/after JSON diff for admins.

### 4.12 Settings
Left-nav sub-sections (Organization Profile, Users, Roles & Permissions, Departments, Programmes, Projects, Storage & Backup, Email Configuration, System Preferences), each a focused form/table page rather than one long settings page.

---

## 5. Component Inventory (shadcn/ui + custom)

Button, Input, Textarea, Select, Combobox, DatePicker/DateRangePicker, Checkbox, RadioGroup, Switch, Tabs, Accordion, Dialog/Modal, Sheet (mobile filters/drawer), DropdownMenu, Table (with sorting/pagination), Badge (status colors), Avatar, Card, Skeleton, Toast, Tooltip, Breadcrumb, Progress, FileDropzone (custom), ApprovalStepper (custom), ChartCard (custom Recharts wrapper), EmptyState (custom), CommandPalette (global search, custom).

Framer Motion used sparingly: page/route fade-slide transitions, card hover lift, modal/drawer enter-exit, list item stagger on dashboard load — never so much it delays reading data.

---

## 6. Responsiveness & Accessibility

- Breakpoints: mobile (<640px), tablet (640–1024px), desktop (>1024px), wide (>1440px for dense analytics).
- All interactive elements keyboard-reachable and screen-reader labeled; color is never the sole status indicator (badges pair color with text/icon, e.g., a check icon for Approved, not just green).
- Minimum contrast ratio 4.5:1 for body text in both light and dark themes (palette above chosen to satisfy this).
- Respects `prefers-reduced-motion` to disable non-essential animation.

---

*End of UI Design Plan — Phase 1 deliverable.*
