# CivicLens — Assumptions, Risks & Open Questions

> **Deliverable 9 of 9.** Documentation only. Contradictions and the first set of assumptions are in [00-analysis-and-assumptions.md](./00-analysis-and-assumptions.md); this file is the running register.
> **Last updated:** 2026-10-27 (owner answers rounds 1 and 2 applied).

---

## 1. Decision register

### ✅ Confirmed

| ID | Decision | Source |
|----|----------|--------|
| D-1 | Stack: Expo, React Native, TypeScript, Expo Router; Supabase (Postgres, Auth, Storage, Realtime, RLS, Edge Functions) | Brief |
| D-2 | No mandatory separate Node backend | Brief |
| D-3 | AI provider keys and service-role key are server-side only | Brief |
| D-4 | Camera capture is the primary MVP path; no silent gallery substitution | Brief |
| D-5 | AI output is advisory; final routing is deterministic | Brief |
| D-6 | In-app notifications required by brief; push/email optional | Brief |
| D-7 | No real municipal integration is claimed | Brief |
| D-8 | No guest mode. Only verified, logged-in users | Owner R1 |
| D-9 | Citizen picks **country, then home city** at sign-up | Owner R1, R2 |
| D-10 | AI via **OpenRouter free models**; Meta not mandatory; providers swappable via env | Owner R1, R2 |
| D-11 | Email verified once, before first login | Owner R1 |
| D-12 | Complaints are kept; owner wipes test data manually | Owner R1 |
| D-13 | Solo developer, build Oct 28 → Nov 3, submit Nov 4, 2026 | Owner R1 |
| D-14 | Officer/admin dashboard is an Expo web build of the same project | This PRD (from D-13) |
| D-15 | **SLA:** Critical 24 h · High 3 d · Medium 7 d · Low 14 d → Overdue | Owner R2 |
| D-16 | **Complaint city from GPS + profile city** (GPS match wins; else profile city, flagged) | Owner R2 |
| D-17 | **India-first**, tested in India; Stockholm kept as a seeded city | Owner R2 |
| D-18 | **Android** is the test and demo platform; APK for submission | Owner R2 |
| D-19 | **English only** | Owner R2 |
| D-20 | All API connections in env files (`.env` for app, `supabase/functions/.env` for secrets) | Owner R2 |
| D-21 | Sign-up location: **Country → State/UT → City** cascading dropdowns | Owner R3 |
| D-22 | **Separate category per issue type**, grouped (roads, water & drainage, electricity, cleanliness & health, parks & trees, other) | Owner R3 |
| D-23 | **Show a readable address, not coordinates**, to citizens. Coordinates are stored and used for routing; officers can open them in a map | Owner R4 |

### 🟡 Proposed (made in this PRD; changeable)

| ID | Proposal | Where |
|----|----------|-------|
| P-1 | Writes via Edge Functions, reads via RLS | Architecture §2 |
| P-2 | Reference `CL-YYYY-NNNNNN` from a per-year counter table (UTC year) | DB §4 |
| P-3 | Client-generated idempotency key per draft | DB §5 |
| P-5 | Phone optional at sign-up (`+91` prefix for India) | 00 C-3 |
| P-7 | Numeric limits (5 MB photo, 12 s AI timeout, rate limits, 5-min signed URLs, 0.5 confidence threshold, 50 m accuracy warning) | Security, AI Spec |
| P-8 | Account deletion anonymizes complaints (deferred past hackathon) | Security §11 |
| P-9 | Critical severity shows a "call 112" notice, number taken from `countries` | AI Spec §5 |
| P-11 | `countries` → `states` → `cities` (center + radius); 11 standard departments auto-created for every city; `department_routes` only as a per-city override | DB §3.0–3.2a |
| P-16 | Categories as a table (21 categories, 6 groups), routed by `department_key`; the AI enum is built from it at runtime | DB §3.0c, AI Spec §2 |
| P-13 | Seed ~40–50 major Indian cities (state/UT capitals + biggest metros) | DB §11 |
| P-14 | SLA computed in a view (`complaints_with_sla`), clock from submission, follows current severity | DB §3.8 |
| P-15 | Neutral city illustration on the splash instead of the Stockholm skyline | Screen Flow §Screen 1 |

---

## 2. Open questions (non-blocking; defaults apply)

| ID | Question | Default if unanswered |
|----|----------|------------------------|
| OQ-5 | Can an officer belong to more than one department? | One department per officer |
| OQ-15 | Exact submission deadline (time + timezone) and deliverables | Assume video + public repo + APK, end of Nov 4 IST |
| OQ-19 | Which city will you test and demo in? | Pick one from the seed list on Day 1 and seed its officers and demo complaints there |

### Resolved

| ID | Resolution |
|----|-----------|
| OQ-1 | No guest mode (D-8) |
| OQ-2 | OpenRouter free models (D-10) |
| OQ-3 | Required one-time verification (D-11) |
| OQ-4 | SLA defaults accepted (D-15) |
| OQ-6 | Show a readable address instead of coordinates, from the device's reverse geocoder (D-23) |
| OQ-7 | Never send location to the AI |
| OQ-8 | Cities are data from day one (D-9, P-11) |
| OQ-9 | Keep complaints; manual test cleanup (D-12) |
| OQ-10 | Solo, Oct 28 → Nov 4 (D-13) |
| OQ-12 | English only (D-19) |
| OQ-13 | Android; verify Expo Go on Day 1 (D-18) |
| OQ-14 | GPS + profile (D-16) |
| OQ-16 | Meta not mandatory (D-10) |
| OQ-17 | Country → State/UT → City cascading picker, India primary (D-9, D-17, D-21) |
| OQ-18 | Separate categories for every issue type: 21 categories in 6 groups incl. drainage, water leakage, electricity (D-22) |

---

## 3. Risks

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|:---:|:---:|-----------|
| R-1 | OpenRouter free vision model unavailable, slow, or rate-limited during the demo | **High** | High | Mock/manual fallback is P0; backup model list in env; consider a small paid top-up before the demo |
| R-2 | Model returns poor or invented details | Medium | Medium | Schema validation, enum-only categories, prompt rules, citizen review, officer correction |
| R-3 | RLS misconfiguration leaks data | Medium | High | Default deny; RLS tests gate the demo |
| R-4 | Secrets end up in the APK | Low | High | Only `EXPO_PUBLIC_` non-secrets in the app `.env`; bundle grep check |
| R-5 | Realtime unreliable on demo network | Medium | High (demo moment) | Refetch on reconnect, pull-to-refresh, mobile hotspot backup |
| R-6 | Camera/GPS behave differently on emulator vs device | High | Medium | Android phone from Day 1 |
| R-7 | Indoor demo gives poor GPS | High | Low | Show accuracy honestly; allow proceed with low-accuracy flag |
| R-8 | Abusive image uploads | Low (demo) | Medium | Rate limits; moderation later |
| R-9 | Scope creep | **High (solo)** | High | P0 list is the gate; cut order in Scope §2 |
| R-10 | Expo web dashboard layout issues | Medium | Low | Keep dashboard simple: cards + table |
| R-11 | Audience assumes it's an official municipal service | Medium | Medium | "Demo, not affiliated" note in app and presentation |
| R-12 | Personal data in photos | Medium | Medium | Clean demo fixtures; privacy hint later |
| R-13 | Verification emails delayed or in spam (Supabase's built-in email sender has low limits) | Medium | High | Pre-verify demo accounts the day before; custom SMTP if limits bite (verify current limits) |
| R-14 | Free OpenRouter model provider logs prompts | Medium | Low (test data) | Send only the photo and description; test photos only |
| R-15 | City radius too small/large, so GPS matches the wrong city near borders | Medium | Low | Nearest-center rule; Review screen shows the destination city; officer/admin can reassign |
| R-16 | Seeding 40–50 cities by hand takes too long | Medium | Low | Seed all states/UTs (short list) but only your test city + a handful of cities on Day 1; add the rest later as data |
| R-17 | 21 categories make the AI's pick less accurate than 6 would (e.g. `drainage` vs `waterlogging`) | Medium | Low | Per-category examples in the prompt; two-step manual picker; officer re-categorization; both still route to the same department |

---

## 4. Things this PRD deliberately does not claim

- That any specific OpenRouter, Meta, or Baseten model, endpoint, price, or quota exists or is available.
- That Supabase is provisioned or any policy is applied.
- That any integration with an Indian municipal corporation or the City of Stockholm exists.
- Any baseline performance, accuracy, or adoption figure.
- Legal compliance (DPDP Act, GDPR, or otherwise).

---

## 5. Suggested additions (beyond the brief)

Each is marked so you can accept or drop it.

| # | Addition | Priority | Where documented |
|---|----------|:---:|------------------|
| S-1 | "Not an emergency service, call 112" notice on Critical severity | P0 | AI Spec §5 |
| S-2 | EXIF stripping (photos can embed GPS and device IDs) | P0 | Security §6, AI Spec §2 |
| S-3 | Column-level grant on `profiles` so self-promotion is impossible | P0 | Security §4 |
| S-4 | Prompt versioning stored with each AI suggestion | P1 | AI Spec §4, §10 |
| S-5 | AI quality metrics from stored data | P1 | AI Spec §11 |
| S-6 | Forced-failure AI modes for testing the fallback | P0 | Test Plan §4 |
| S-7 | City matching by center + radius | P0 | DB §3.0 |
| S-8 | Privacy hint at capture about faces and plates | Deferred | Security §11 |
| S-9 | "Demo data / not affiliated" labeling | P0 | Security §12 |
| S-10 | Optimistic concurrency for concurrent officer edits | P0 | DB §6 |
| S-11 | Pre-verified demo accounts | P0 | R-13 |
| S-12 | Backdated demo complaints so the Overdue card has data | P0 | Test Plan §4 |
| S-13 | India-specific categories (drainage, open manhole, waterlogging, mosquito breeding, stray animals, encroachment, etc.) | P0 (accepted) | DB §3.0c |
| S-14 | Track how often complaints land in `other`, so it's clear which category to add next | P1 | DB §3.0c notes |
