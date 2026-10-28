# CivicLens — Product Requirements Document (PRD)

> **Deliverable 1 of 9.** Documentation only — nothing in this document has been implemented or provisioned.
> **Product:** CivicLens · **Tagline:** *Turn a photo into action. Make your city better.*
> **Context:** Meta Global AI Developer Hackathon · Primary market: **India** (English UI) · Stockholm also seeded for the hackathon story
> **Related docs:** [Analysis & Assumptions](./00-analysis-and-assumptions.md) · [Screen Flow](./02-user-journey-and-screen-flow.md) · [Architecture](./03-technical-architecture.md) · [Database](./04-database-design.md) · [AI Spec](./05-ai-specification.md) · [Security](./06-security-and-privacy.md) · [Scope](./07-mvp-scope-and-milestones.md) · [Tests](./08-acceptance-criteria-and-test-plan.md) · [Risks](./09-assumptions-risks-open-questions.md)

---

## 1. Product overview

### 1.1 Vision
CivicLens makes reporting civic problems effortless. A citizen photographs an issue, attaches their current GPS location, optionally describes it, and submits a trackable municipal complaint. The system classifies the issue (AI-assisted), routes it to the correct municipal department using deterministic rules, and lets the citizen follow its progress through a transparent, ticket-based lifecycle. Municipal officers and administrators get a centralized dashboard to triage, update, and resolve complaints and to spot recurring problems.

### 1.2 Problem statement
Citizens regularly encounter potholes, damaged roads, broken streetlights, overflowing bins, illegal dumping, and blocked sidewalks. Reporting is often slow and confusing: people don't know which department to contact and get no visibility after submitting. Departments, in turn, receive incomplete, duplicated, or location-poor reports that are hard to prioritize. CivicLens converts photos + descriptions into **structured, categorized, location-aware** complaints with **transparent status tracking** for both sides.

### 1.3 Solution summary
A mobile-first app (Expo/React Native) backed by Supabase, with a web dashboard for officials. The citizen journey is: sign in → capture photo → auto-GPS → optional description → AI-assisted classification → review & correct → submit → receive a unique reference → track status in real time → see resolution and history. The officer/admin journey is: triage queue → review evidence → (re)assign → update status with citizen-visible updates and internal notes → resolve, with audit logging throughout.

### 1.4 Scope of this MVP
The MVP delivers a realistic end-to-end scenario in an Indian city (where it's tested) with seeded demo data clearly labeled as demo. Citizens pick a country and then a home city at sign-up, and every complaint routes to the departments of its city (decided from GPS and the profile city together). Indian cities are seeded as the primary list and Stockholm is kept for the hackathon story; more cities can be added as data (a `cities` row plus its departments and routes) without code changes. Push/email, maps, and real municipal integrations are **not** in the MVP.

---

## 2. Goals & success metrics

Targets below are **proposed** (🟡) hackathon-appropriate measures unless marked otherwise. They are aspirations for the demo build, **not** claims of measured performance.

| Goal | Metric | Target (proposed) |
|------|--------|-------------------|
| G-1 Fewer steps to submit | Distinct citizen actions from "start complaint" to "submitted" | ≤ **5 primary taps** on the happy path (capture → confirm location → optional description → review → submit) |
| G-2 Minimal-text submission | Submission possible with photo + GPS + zero typed characters | Description is optional; submission succeeds with it empty |
| G-3 Information completeness | % of submitted complaints with photo + valid GPS + category + department | **100%** (enforced by validation; none of these can be null at insert) |
| G-4 Correct department suggestion | Routing is deterministic and always resolves to a valid, active department | **100%** of complaints get a valid department (fallback = General Municipal Review) |
| G-5 Transparent status | Every status change writes a timestamped history row with actor | **1:1** history rows per transition; current status always equals latest history row |
| G-6 Centralized official view | Officers see exactly their department's queue; admins see all | Enforced by RLS (see Security doc) |
| G-7 Meaningful multimodal AI | Image + optional text → validated structured JSON suggestion | Demonstrated live, with schema validation and a visible fallback path |
| G-8 Polished functional MVP | The 11-step end-to-end demo (Test Plan §E2E) runs without manual DB edits | Demo passes end-to-end |

> **No invented baselines.** We do not cite existing resolution times, satisfaction scores, or adoption numbers, because none exist. Metrics are defined so they can be measured from stored data once the app runs.

---

## 3. Non-goals (MVP)

The following are explicitly **out of scope** for the MVP and must not be represented as working:

- Direct integration with any real municipal corporation's systems (Indian or Swedish), grievance portals, or identity providers.
- Automatic dispatch of real repair crews or any real-world action.
- Emergency response / emergency-services integration. **Critical severity ≠ emergency dispatch.**
- Payment processing.
- Predictive maintenance / advanced trend forecasting.
- App-store publication as a hard requirement.
- Fully automated government decisions without human review. **AI output is advisory only.**
- Production-grade municipal SSO.

All municipal workflows in the MVP are **simulated** and labeled as such.

---

## 4. Personas & roles

See the [Screen Flow doc](./02-user-journey-and-screen-flow.md) for role-specific journeys and the [Security doc](./06-security-and-privacy.md) for exact permissions/RLS.

### 4.1 Citizen (primary)
A resident reporting and tracking a civic issue.
- **Can:** register/log in; start a complaint; capture a photo; grant location & attach GPS; add/edit description; review & correct AI suggestions; submit; view **only their own** complaints; track status & history; see department assignment and citizen-visible official updates; receive in-app notifications; view resolved complaints.
- **Cannot:** see other citizens' private data; see internal officer notes; change status; access officer/admin tools; elevate their own role.

### 4.2 Municipal officer
An official handling complaints for their department.
- **Can:** log in via an authorized officer account; view complaints assigned to **their department**; review photo/description/location/AI suggestion; accept or reject assignment with a reason; update status; add internal notes and citizen-visible updates; mark work completed; view complaint history; filter/sort their queue.
- **Cannot:** access other departments' complaints; access admin controls; elevate roles.

### 4.3 Administrator
An authorized municipal administrator.
- **Can:** access a city-wide dashboard; view/manage all complaints; manage departments and officer assignments; review routing/classification errors; reassign complaints; manage permitted user roles; monitor trends and resolution metrics.
- **Cannot:** be self-appointed. Admin role is granted only by an existing admin or via a privileged server-side/seed path (never by the client).

### 4.4 Role model summary

| Capability | Citizen | Officer | Admin |
|---|:--:|:--:|:--:|
| Submit complaint | ✅ | ✅* | ✅* |
| Read own complaints | ✅ | ✅ | ✅ |
| Read dept complaints | — | ✅ (own dept) | ✅ (all) |
| Read all complaints | — | — | ✅ |
| Change status | — | ✅ (own dept) | ✅ |
| Internal notes | — | ✅ | ✅ |
| Reassign dept/officer | — | — | ✅ |
| Manage departments/roles | — | — | ✅ |
| See internal notes | — | ✅ | ✅ |

\* Officers/admins are also citizens of the system and may file complaints; such complaints follow citizen RLS for their own records.

---

## 5. Functional requirements

IDs are stable and referenced by the [Test Plan](./08-acceptance-criteria-and-test-plan.md). Priority: **P0** must-have, **P1** should-have, **P2** future.

### 5.1 Authentication & profile
| ID | Requirement | Priority |
|----|-------------|:--:|
| FR-AUTH-001 | A citizen can create an account with full name, email, password, and home city (phone optional). | P0 |
| FR-AUTH-002 | A user can log in with email + password via Supabase Auth. | P0 |
| FR-AUTH-003 | A user can trigger a password-reset (forgot-password) flow. | P0 |
| FR-AUTH-004 | On first sign-up, a `profiles` row is created with role defaulting to `citizen`. | P0 |
| FR-AUTH-005 | A user can log out; session tokens are cleared from the device. | P0 |
| FR-AUTH-006 | Registration requires explicit acceptance of privacy policy & terms. | P0 |
| FR-AUTH-007 | Email must be verified once before first login; unverified accounts can't sign in. Login offers "Resend verification email". | P0 |
| FR-AUTH-008 | A user can request account deletion (removes/anonymizes personal data per policy). | P1 |
| FR-AUTH-009 | Registration requires picking **Country → State/UT → City** in cascading, searchable dropdowns (India default). The city is stored on the profile. | P0 |
| FR-AUTH-010 | A citizen can change their home city from Profile. | P1 |
| FR-AUTH-011 | There is no guest or anonymous mode. | P0 |

### 5.2 Complaint capture (photo)
| ID | Requirement | Priority |
|----|-------------|:--:|
| FR-COMPLAINT-001 | Citizen can capture a new photo using the device camera at point of use. | P0 |
| FR-COMPLAINT-002 | App requests camera permission in-context and explains why. | P0 |
| FR-COMPLAINT-003 | Citizen can retake the photo and sees a preview before continuing. | P0 |
| FR-COMPLAINT-004 | On camera denial, the app explains and offers a recovery path (settings deep link). | P0 |
| FR-COMPLAINT-005 | The app never silently substitutes a gallery image for the required camera capture. | P0 |
| FR-COMPLAINT-006 | Gallery upload (alternative source) — explicitly deferred. | P2 |

### 5.3 Location
| ID | Requirement | Priority |
|----|-------------|:--:|
| FR-LOCATION-001 | After capture, the app requests location permission and obtains current GPS coordinates. | P0 |
| FR-LOCATION-002 | The app stores latitude, longitude, and accuracy (when available). | P0 |
| FR-LOCATION-003 | The app shows the location as a **readable address** (e.g. "Near Shivajinagar Bus Stop, FC Road, Shivajinagar, Pune 411005") plus accuracy, not raw coordinates. The address comes from a reverse geocoder, never from the AI. Coordinates are still stored. | P0 |
| FR-LOCATION-008 | If reverse geocoding fails, the app shows "Location captured · address not available" with the city name if known, and submission still works. Officers can always see coordinates and open them in a map. | P0 |
| FR-LOCATION-004 | The app handles denial, disabled location services, timeouts, and low accuracy with clear messaging and a retry. | P0 |
| FR-LOCATION-005 | The app never invents or substitutes coordinates. | P0 |
| FR-LOCATION-006 | A valid location is required to submit (per A-5); the UI states this clearly. | P0 |
| FR-LOCATION-007 | The app does not track location continuously; it captures only during complaint creation. | P0 |

### 5.4 AI-assisted classification
| ID | Requirement | Priority |
|----|-------------|:--:|
| FR-AI-001 | The app generates structured issue recommendations from the photo + optional description via a server-side call. | P0 |
| FR-AI-002 | AI output is validated against a defined JSON schema before use. | P0 |
| FR-AI-003 | If AI is unavailable/invalid/times out, a manual/mock categorization fallback keeps the flow working. | P0 |
| FR-AI-004 | AI suggestions (category, severity, department) are stored **separately** from final verified values. | P0 |
| FR-AI-005 | For ambiguous/irrelevant/insufficient images, the app asks the citizen to clarify rather than inventing details. | P1 |
| FR-AI-006 | Confidence/uncertainty is surfaced to the citizen when the provider supports it. | P1 |
| FR-AI-007 | The AI provider is swappable via a server-side adapter; no provider lock-in. | P0 |
| FR-AI-008 | Precise GPS is not sent to the AI provider (OQ-7). | P0 |
| FR-CAT-001 | Issues are classified into **21 categories in 6 groups** (roads, water & drainage, electricity, cleanliness & health, parks & trees, other), each mapped to a department. List in DB §3.0c. | P0 |
| FR-CAT-002 | Categories are data (`categories` table); a new one can be added without code or schema changes, and the AI, picker, and routing pick it up. | P0 |
| FR-CAT-003 | Admin UI to add/edit categories. | P1 |

### 5.5 Routing & prioritization
| ID | Requirement | Priority |
|----|-------------|:--:|
| FR-ROUTING-001 | Complaints are assigned to a department **of the complaint's city** via validated, deterministic rules (not raw AI output). | P0 |
| FR-ROUTING-005 | The complaint's city is decided from **both GPS and the profile city** (rule in DB §3.0): GPS inside a known city → that city; otherwise → the profile city, flagged "outside city limits". The Review screen shows which city's municipal office it goes to. Submission is never blocked for this reason. | P0 |
| FR-ROUTING-002 | Unknown/uncertain categories route to **General Municipal Review**. | P0 |
| FR-ROUTING-003 | Severity is one of Low/Medium/High/Critical with documented criteria; officers can override. | P0 |
| FR-ROUTING-004 | Duplicate detection is **advisory** in MVP and never silently discards a report. | P1 |

### 5.6 Submission
| ID | Requirement | Priority |
|----|-------------|:--:|
| FR-SUBMIT-001 | On submit, required fields are validated (photo, GPS, category, department). | P0 |
| FR-SUBMIT-002 | The photo is uploaded to a private Storage bucket. | P0 |
| FR-SUBMIT-003 | A complaint record is created with initial status `submitted` and a timestamp. | P0 |
| FR-SUBMIT-004 | A unique human-readable reference (`CL-YYYY-NNNNNN`) is assigned without collisions. | P0 |
| FR-SUBMIT-005 | Repeated taps / network retries do not create duplicate tickets (idempotency). | P0 |
| FR-SUBMIT-006 | A confirmation screen shows the reference only after the backend confirms creation. | P0 |

### 5.7 Tracking (citizen)
| ID | Requirement | Priority |
|----|-------------|:--:|
| FR-TRACK-001 | Citizen can view a status timeline/history for their complaint. | P0 |
| FR-TRACK-002 | My Complaints lists reference, title, thumbnail, category, date, status, department. | P0 |
| FR-TRACK-003 | Citizen can filter by status and sort by latest activity. | P1 |
| FR-TRACK-004 | Complaint Details shows all public fields, status history, and citizen-visible updates. | P0 |
| FR-TRACK-005 | Citizens never see internal officer notes. | P0 |

### 5.8 Realtime & notifications
| ID | Requirement | Priority |
|----|-------------|:--:|
| FR-REALTIME-001 | Status updates propagate to connected citizen clients without manual refresh (Supabase Realtime). | P0 |
| FR-REALTIME-002 | On realtime disconnect, the client reconnects and falls back to manual/pull refresh. | P1 |
| FR-NOTIFY-001 | In-app notifications are created for citizen-relevant status changes. | P1 |
| FR-NOTIFY-002 | Push notifications. | P2 |
| FR-NOTIFY-003 | Email notifications. | P2 |

### 5.9 Officer & admin
| ID | Requirement | Priority |
|----|-------------|:--:|
| FR-OFFICER-001 | Authorized officers can view and manage complaints for their department. | P0 |
| FR-OFFICER-002 | Officers can update status with valid transitions only. | P0 |
| FR-OFFICER-003 | Officers can add citizen-visible updates and private internal notes (distinct). | P0 |
| FR-OFFICER-004 | Officers can accept/reject an assignment with a reason; rejection requires a reason. | P0 |
| FR-OFFICER-005 | Officers can filter/sort/search their queue. | P1 |
| FR-ADMIN-001 | Admins can view a city-wide dashboard with metrics from real stored data. | P0 |
| FR-ADMIN-002 | Admins can reassign department/officer and manage departments and roles. | P0 |
| FR-ADMIN-003 | Analytics beyond core counts (trends over time). | P1 |
| FR-SLA-001 | Each complaint gets a due time from its severity: Critical 24 h, High 72 h, Medium 7 days, Low 14 days (stored in `sla_policies`, editable by admin). | P0 |
| FR-SLA-002 | A complaint not in `resolved`/`closed`/`rejected` past its due time shows as **Overdue** on the dashboard card and in the queue. | P0 |
| FR-SLA-003 | If an officer changes severity, the due time is recalculated from the original submission time. | P0 |
| FR-SLA-004 | Citizen sees the target ("Expected within 3 days") on Complaint Details. | P1 |

### 5.10 Security & audit
| ID | Requirement | Priority |
|----|-------------|:--:|
| FR-SEC-001 | Unauthorized users cannot read another citizen's private complaint data. | P0 |
| FR-SEC-002 | Officers cannot access complaints outside their authorized department. | P0 |
| FR-SEC-003 | No user can elevate their own role from the client. | P0 |
| FR-SEC-004 | Service-role and AI-provider secrets never appear in the client bundle. | P0 |
| FR-SEC-005 | Every privileged action writes an audit log entry. | P1 |
| FR-SEC-006 | Private photos are served only via authorized policy or short-lived signed URLs. | P0 |
| FR-SEC-007 | Upload size/type restrictions and input validation are enforced. | P0 |
| FR-SEC-008 | Rate limiting / abuse prevention on submission and AI calls. | P1 |

---

## 6. Non-functional requirements

All targets are **proposed** (🟡) unless noted; label as assumptions when building.

| ID | Category | Requirement / target |
|----|----------|----------------------|
| NFR-PERF-001 | Performance | Primary screens render interactive content in **< 2 s** on a mid-range device over 4G (cold data). |
| NFR-PERF-002 | Performance | Photo upload + complaint creation completes in **< 8 s** on 4G for a ≤ 5 MB image; UI shows progress. |
| NFR-PERF-003 | Performance | AI suggestion returns or falls back within **≤ 15 s**; a visible timeout triggers the manual fallback. |
| NFR-REL-001 | Reliability | Complaint creation is idempotent; a retried submit never duplicates a ticket. |
| NFR-REL-002 | Reliability | `current status` and the latest `complaint_status_history` row are always consistent (enforced server-side). |
| NFR-RT-001 | Realtime | Status change is reflected on a connected citizen client in **≤ 3 s** under normal conditions. |
| NFR-RT-002 | Realtime | On disconnect, reconnect is attempted automatically; a manual refresh always works as fallback. |
| NFR-A11Y-001 | Accessibility | Text/background contrast meets **WCAG 2.1 AA (4.5:1)**; touch targets **≥ 44×44 pt**; all actionable elements have accessible labels. *(Full WCAG conformance requires manual assistive-tech testing and expert review — not claimed here.)* |
| NFR-SEC-001 | Security | All data access governed by RLS; no table with user data is world-readable. |
| NFR-PRIV-001 | Privacy | Collect only name, email, (optional) phone, and per-complaint GPS. No background tracking. |
| NFR-PRIV-002 | Privacy | Precise GPS is not transmitted to third-party AI providers. |
| NFR-USE-001 | Mobile usability | Happy-path submission achievable in ≤ 5 primary taps (G-1). |
| NFR-ERR-001 | Error recovery | Every permission/network/AI failure has a defined message + recovery action (see Screen Flow & Edge Cases). |
| NFR-MAINT-001 | Maintainability | TypeScript throughout; shared types for DB rows; AI provider behind a single adapter interface. |
| NFR-COST-001 | Cost control | AI calls are server-side, rate-limited, and short-circuited by the manual fallback to bound inference spend; no client-triggered unbounded calls. |

---

## 7. Assumptions, dependencies & risks (pointer)

Full detail in [09-assumptions-risks-open-questions.md](./09-assumptions-risks-open-questions.md). Headline dependencies: a Supabase project; an OpenRouter account with a free vision-capable model (availability and limits to verify; the manual fallback carries the demo if it's down or rate-limited); Expo tooling and a physical device for camera & GPS testing.

---

## 8. Glossary

| Term | Meaning |
|------|---------|
| Complaint reference | Public human-readable ID, `CL-YYYY-NNNNNN`. |
| Citizen-visible update | A progress note published to the citizen. |
| Internal note | Officer/admin-only comment; never shown to citizens. |
| Routing | Deterministic mapping from final category → department. |
| Fallback classifier | Deterministic/manual categorization used when AI is unavailable. |
| Demo data | Seeded, clearly-labeled synthetic data for demonstration. |
