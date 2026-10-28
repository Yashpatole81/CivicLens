# CivicLens — Requirements Analysis, Contradictions & Assumptions

> **Status:** Documentation only. No application code, packages, configuration, or deployment described here has been built or provisioned.
> **Last updated:** 2026-10-27
> **Audience:** Product, engineering, and hackathon reviewers.

This document precedes the PRD. It records the contradictions and missing decisions found while analyzing the brief and the reference mockup (`REFERENCE/CivicLens Civic Complaint App Flow.png`), and it states the explicit, labeled assumptions used throughout the rest of the documentation set.

Legend for decision state used across all PRD docs:

| Tag | Meaning |
|-----|---------|
| ✅ **CONFIRMED** | Stated as fixed by the brief or the confirmed stack. |
| 🟡 **PROPOSED** | A design recommendation made here; reasonable but changeable. |
| 🔴 **OPEN** | Unresolved; needs a human decision before/while building. |
| 🧪 **ASSUMPTION** | A working assumption adopted so documentation can proceed. |

---

## 1. Contradictions found between the brief and the mockup

| # | Topic | Brief says | Mockup shows | Resolution in this PRD |
|---|-------|-----------|--------------|------------------------|
| C-1 | Tagline | "Turn a photo into action. Make your city better." | "Safer Cities. Happier Communities." | 🧪 Treat **"Turn a photo into action. Make your city better."** as the official product tagline (from §1). Keep the mockup line as an optional secondary marketing strap. |
| C-2 | Guest access | Auth-first; citizens must sign up/log in to submit and must only see their own data. | Login screen has a **"Continue as Guest"** button. | 🔴 OPEN → 🧪 For the MVP, **guest submission is OUT of scope.** Rationale: ownership, RLS, and tracking all require an authenticated citizen identity. Recommend removing the guest button or making it route to sign-up. See OQ-1. |
| C-3 | Sign-up fields | "Avoid collecting unnecessary personal information." | Sign-up collects **phone number**. | 🧪 Make **phone number optional** (not required). Email + password + full name are the required set. See §Registration in the flow doc. |
| C-4 | Complaint reference format | "Unique, human-readable complaint reference." | `CL-2024-0012` (year 2024). | 🟡 Adopt format `CL-YYYY-NNNNNN` where `YYYY` is the current year at creation (so 2026 in demos). The mockup's `2024` is illustrative only. See DB design doc for collision-free generation. |
| C-5 | Camera vs gallery | MVP primary flow is **camera capture**; do not silently substitute a gallery photo. | Mockup shows a captured photo with a "Retake" affordance (consistent). | ✅ No real conflict. Camera capture is primary; gallery upload is explicitly a P2 enhancement, never a silent substitute. |
| C-6 | Officer/Admin surface | Officer/admin dashboard is a "supporting interface"; may be Expo web or a separate lightweight React web app. | Dashboard is clearly a **wide desktop web** layout (sidebar + cards + charts). | 🟡 Recommend the officer/admin dashboard be delivered as a **web target** (Expo Router web build or a small separate React web app sharing the Supabase client and types). See Architecture doc §Officer/Admin surface. |
| C-7 | Severity in citizen UI | Brief wants AI-suggested severity shown and correctable. | Mockup detail screens do not prominently show severity. | 🟡 Show severity on Review & Submit and Complaint Details; keep it visually secondary to status. |

---

## 2. Missing decisions (open questions)

### 2.1 Owner decisions — 2026-10-27

| OQ | Decision |
|----|----------|
| OQ-1 Guest access | ✅ **No guest mode.** Only verified, logged-in users can use the app. The citizen picks a **home city at sign-up** so complaints connect to that city's municipal departments. |
| OQ-2 AI provider | ✅ **OpenRouter free models** for the MVP. Meta / Baseten can be swapped in later through the same adapter. Specific model IDs and limits still need verification. |
| OQ-3 Email verification | ✅ **Required once, before first login.** Unverified accounts can't sign in. |
| OQ-4 SLA | Explained to owner; decision pending (see 09). |
| OQ-9 Retention | ✅ **Keep complaints.** Owner deletes test data manually during testing. |
| OQ-10 Schedule | ✅ **Solo builder. Build Oct 28 → submit Nov 4, 2026.** |

### 2.2 Owner decisions — round 2 (2026-10-27)

| Topic | Decision |
|-------|----------|
| SLA | ✅ Critical 24 h · High 3 days · Medium 7 days · Low 14 days. Past the target → "Overdue" on the dashboard. |
| Complaint city | ✅ Decided from **both GPS and profile city** (rule in DB §3.0). |
| Target market | ✅ **India-first.** Testing happens in India. Stockholm stays seeded so the hackathon story still works. |
| City list | ✅ Sign-up shows a **country picker, then that country's city list**. |
| Meta model | ✅ Not mandatory. AI connections go in env config so providers can be swapped. |
| Test device | ✅ **Android.** |
| Language | ✅ **English only.** |

The rest of this section is the original list written before these answers.

These are tracked in detail in `09-assumptions-risks-open-questions.md`. Summary here for visibility:

- **OQ-1 Guest access** — keep or drop "Continue as Guest"? (Assumed dropped for MVP.)
- **OQ-2 AI provider** — Meta model API vs Baseten; access and credits **not confirmed**. The brief explicitly says *do not assume credits are approved*. Assumed: provider-agnostic adapter with a **manual/mock classifier fallback** as the guaranteed MVP path.
- **OQ-3 Email verification** — enforce Supabase email confirmation before first complaint, or allow unverified use during the hackathon? (Assumed: verification enabled but **not blocking** complaint creation in demo mode; blocking in production.)
- **OQ-4 SLA / overdue** — the dashboard lists "overdue" only "if an explicit SLA is configured." No SLA numbers given. (Assumed: SLA is **config-driven and off by default** for MVP; overdue card hidden when unset.)
- **OQ-5 Officer→department mapping source** — how are officers bound to departments? (Assumed: via `profiles.department_id`, seeded for demo.)
- **OQ-6 Reverse geocoding** — do we show a human-readable address, or only lat/long? The brief warns AI must not invent street names. (Assumed: show raw coordinates + accuracy for MVP; optional map/address is P2 and must come from a real geocoder, never the AI.)
- **OQ-7 Location to AI** — send precise GPS to the AI provider? Brief says not unless justified. (Assumed: **do not** send precise GPS to the AI; the AI sees only the image + description + category list.)
- **OQ-8 City scope** — demo is Stockholm; architecture must allow other cities later. (Assumed: single-city config for MVP, with a `city`/config seam reserved.)

---

## 3. Working assumptions adopted for the whole PRD

| ID | Assumption | Basis |
|----|-----------|-------|
| A-1 | Single confirmed stack: **Expo + React Native + TypeScript + Expo Router**, **Supabase** (Postgres, Auth, Storage, Realtime, RLS), with **Edge Functions** for secret-bearing/server-side logic. | Brief §4. |
| A-2 | **No separate mandatory Node backend.** Server-side needs are met by Supabase Edge Functions. | Brief §4. |
| A-3 | AI is accessed through a **provider-agnostic adapter** invoked only server-side (Edge Function). A **deterministic manual/mock classifier** is the guaranteed fallback so the end-to-end demo never depends on external AI availability or credits. | Brief §4, §10. |
| A-4 | **Final category/department routing is deterministic application logic**, not the AI. The AI suggestion is stored separately and never overwrites the validated routing. | Brief §7, §10. |
| A-5 | **Location required** to submit a complaint in the MVP (no approved fallback documented). | Brief §5 Flow B Screen 5. |
| A-6 | Demo uses **realistic seeded data for Indian cities (primary) and Stockholm**, clearly labeled as demo data. No real municipal integration is claimed. | Brief §2, §6, §15; owner round 2. |
| A-7 | Officer/admin dashboard delivered as a **web target**; not assumed pixel-identical to native RN. | Brief §6, mockup. |
| A-8 | Complaint reference format `CL-YYYY-NNNNNN`, generated collision-free server-side. | C-4. |
| A-9 | All timestamps stored as UTC (`timestamptz`); displayed in the complaint city's timezone (`Asia/Kolkata` for Indian cities). | India-first decision. |
| A-10 | Currency/payment, push, and email are **excluded from MVP** (P2). | Brief §2, §5, §14. |

---

## 4. What this documentation set contains

| File | Deliverable (brief §16) |
|------|-------------------------|
| `00-analysis-and-assumptions.md` | This file — contradictions & assumptions (feeds deliverable 9). |
| `01-prd.md` | 1. Product Requirements Document. |
| `02-user-journey-and-screen-flow.md` | 2. User Journey & Screen Flow. |
| `03-technical-architecture.md` | 3. Technical Architecture. |
| `04-database-design.md` | 4. Database Design. |
| `05-ai-specification.md` | 5. AI Specification. |
| `06-security-and-privacy.md` | 6. Security & Privacy Requirements. |
| `07-mvp-scope-and-milestones.md` | 7. MVP Scope & Milestones. |
| `08-acceptance-criteria-and-test-plan.md` | 8. Acceptance Criteria & Test Plan. |
| `09-assumptions-risks-open-questions.md` | 9. Assumptions, Risks & Open Questions. |
| `README.md` | Index / reading order. |
