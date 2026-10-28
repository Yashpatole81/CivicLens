# CivicLens — MVP Scope & Milestones

> **Deliverable 7 of 9.** Documentation only.
> **Schedule (owner, 2026-10-27):** solo developer · build **Wed Oct 28 → Tue Nov 3** · submit **Wed Nov 4, 2026**.
> **Related:** [PRD §5](./01-prd.md) · [Test Plan](./08-acceptance-criteria-and-test-plan.md).

---

## 1. Prioritized backlog

With one developer and 7 build days, P0 is kept tight and almost all of P1 is deferred.

### P0 — Must have (demo fails without these)

| # | Item | Requirement IDs |
|---|------|-----------------|
| 1 | Supabase project, schema (incl. `countries`, `states`, `cities`, `categories`, `department_routes`, `sla_policies`), enums, seed: Indian states/UTs + cities + Stockholm, 21 categories, 11 departments per city | DB doc |
| 2 | RLS on all tables + column grant on `profiles` + `handle_new_user` trigger | FR-SEC-001..003 |
| 3 | Email/password auth with **required one-time email verification**, city picker, terms checkbox, forgot password, logout. No guest mode. | FR-AUTH-001..007, 009, 011 |
| 4 | Camera capture with permission handling and retake | FR-COMPLAINT-001..005 |
| 5 | One-shot GPS with permission handling and accuracy | FR-LOCATION-001..007 |
| 6 | Optional description | Screen 6 |
| 7 | `classify-issue` Edge Function: **OpenRouter** adapter + schema validation + mock/manual fallback | FR-AI-001..004, 007, 008 |
| 8 | Review & Submit with editable fields | Screen 7 |
| 9 | Private photo upload | FR-SUBMIT-002, FR-SEC-006 |
| 10 | `submit-complaint`: idempotency, `CL-YYYY-NNNNNN`, city from GPS, deterministic routing, history row | FR-SUBMIT-*, FR-ROUTING-001..003, 005 |
| 11 | My Complaints + Complaint Details + Timeline | FR-TRACK-001, 002, 004, 005 |
| 12 | `update-status` with transition rules, public update vs internal note | FR-OFFICER-001..004 |
| 13 | Officer/admin **Expo web** routes: dashboard counts + queue + management | FR-ADMIN-001, 002 |
| 14 | Realtime status updates on citizen Details/Timeline | FR-REALTIME-001 |
| 15 | Realistic seeded demo data in your test city, labeled | A-6 |
| 16 | SLA due time + Overdue card/chip (`complaints_with_sla` view) | FR-SLA-001..003 |
| 17 | Env files + `.env.example` for all API connections; Android APK build | Architecture §7.1, §7.2 |

### P1 — Only if ahead of schedule (in this order)

1. In-app notifications list + unread badge (cheap: the rows are already written by `update-status`).
2. Queue filters by status/category.
3. AI uncertainty display and clarification prompt.
4. Rate limiting on `submit-complaint` / `classify-issue`.
5. Officer assignment (individual officer, not just department).

### Deferred past the hackathon

Audit-log UI (rows are still written) · analytics beyond counts · duplicate warnings · account deletion · change home city · capture privacy hint · offline polish · everything in P2 (push/email, map, gallery, multi-city UI beyond the picker, multilingual AI, real integrations, SLA if not chosen).

---

## 2. Minimum successful demo

The 11-step script in [Test Plan §5](./08-acceptance-criteria-and-test-plan.md#5-end-to-end-demo-script) runs end to end on a phone plus a laptop browser, with the AI either live (OpenRouter) or visibly on the fallback, and without manual database edits.

**Cut order under time pressure:** P1 items → dashboard donut chart (keep the count cards) → queue search → resolution "celebration" screen (plain status is fine).
**Never cut:** RLS, email verification, idempotent submit, server-side secrets, the fallback classifier.

---

## 3. Day-by-day plan (solo)

| Day | Date | Goal | Done when |
|-----|------|------|-----------|
| 1 | Wed Oct 28 | **Foundation.** Expo app (TypeScript, Expo Router), Supabase project, schema + enums + `countries` + `cities` + `department_routes` + `sla_policies`, RLS, `handle_new_user` trigger, seed (Indian cities + Stockholm), env files. Verify Expo Go on your Android phone for camera/location. | Migrations apply cleanly; RLS smoke tests pass for citizen/officer/admin |
| 2 | Thu Oct 29 | **Auth.** Welcome/Login, Register with city picker + terms, verification flow ("Check your inbox", Resend), forgot password, session in secure storage, tabs shell + Home. | AC-AUTH-001..013 pass on device |
| 3 | Fri Oct 30 | **Capture flow.** Camera (permission, preview, retake), GPS (permission, accuracy, retry), Describe screen with mock suggestion, Review screen. | Full flow works locally with mock data |
| 4 | Sat Oct 31 | **Submit.** Photo upload to private bucket, `submit-complaint` (idempotency, reference, GPS → city, routing, history), Confirmation screen. | AC-SUB-001..004, AC-RT-001..007 pass |
| 5 | Sun Nov 1 | **AI + tracking.** `classify-issue` with OpenRouter (verify model first) + validation + fallback; My Complaints, Details, Timeline. | AC-AI-001..009 pass; tracking screens show real data |
| 6 | Mon Nov 2 | **Officer side.** Expo web routes for dashboard counts, queue, management; `update-status`; Realtime on citizen screens. | Officer change shows on the phone without refresh |
| 7 | Tue Nov 3 | **Harden + record.** Run the full test plan's P0 checks, fix bugs, polish demo data, rehearse and record the demo video. | E2E script passes twice in a row |
| 8 | Wed Nov 4 | **Submit.** Android APK build, README, screenshots, video upload, submission form. Buffer for last fixes only, no new features. | Submitted |

> Confirm the exact submission deadline time and timezone (OQ-15). If it's early on Nov 4, treat Nov 3 as the last build day and submit that night.

**Daily rule:** end each day with a working build committed. If a day slips, take from the P1 list and the cut order above, never from Day 7's hardening time.

---

## 4. Risk notes specific to solo work

- Camera, GPS, and Realtime are the parts most likely to eat time. Test on a physical device from Day 1.
- OpenRouter free models can be rate-limited or disappear. Build against the mock on Day 3 so AI problems on Day 5 never block the flow.
- Officer web is last-but-one on purpose: it reuses the same Supabase client and types, so it's mostly UI.

---

## 5. Definition of done (per item)

- Meets acceptance criteria in the Test Plan.
- Loading, empty, and error states implemented.
- No secrets in client code.
- Types generated from the DB schema are used (no hand-typed row shapes).
- Tested on a physical phone for camera/GPS items.
