# CivicLens — Acceptance Criteria & Test Plan

> **Deliverable 8 of 9.** Documentation only. No tests have been written or run.
> Criteria use Given/When/Then. IDs map to [PRD §5](./01-prd.md) requirements and [Screen Flow §7](./02-user-journey-and-screen-flow.md#7-edge-case-handling) edge cases.

---

## 1. Test approach

| Layer | What | Tooling (🟡 proposed; verify versions before use) |
|-------|------|-------------------------------|
| Database / RLS | Policies, constraints, triggers, transitions | SQL tests (pgTAP) or a Supabase-JS test script against a local Supabase stack |
| Edge Functions | Validation, routing, idempotency, AI fallback | Deno test (Edge Functions run on Deno) |
| App units | Validators, schema parsing, state reducers | Jest + React Native Testing Library |
| UI flows | Permissions, states, navigation | Manual on device for MVP; Maestro or Detox as P1 |
| End-to-end | Demo script §5 | Manual, scripted, on demo devices |

Test users (seeded): `citizen_a`, `citizen_b`, `officer_roads`, `officer_waste`, `admin`.

---

## 2. P0 acceptance criteria

### 2.1 Authentication

| ID | Given / When / Then |
|----|---------------------|
| AC-AUTH-001 | Given a new email, when the user registers with name, email, valid password, and accepted terms, then an auth user and a `profiles` row with role `citizen` exist. |
| AC-AUTH-002 | Given registration without accepting terms, when Submit is tapped, then the form shows an error and no account is created. |
| AC-AUTH-003 | Given an existing email, when registering again, then a duplicate-account error is shown. |
| AC-AUTH-004 | Given valid credentials, when logging in, then Home loads with the user's name. |
| AC-AUTH-005 | Given a wrong password, when logging in, then an inline error is shown and the email field keeps its value. |
| AC-AUTH-006 | Given any email, when requesting a password reset, then the same confirmation message is shown whether or not the account exists. |
| AC-AUTH-007 | Given a logged-in user, when logging out, then the session is cleared and protected screens redirect to Welcome. |
| AC-AUTH-008 | Phone is optional: registration succeeds with phone empty. |
| AC-AUTH-009 | Given an unverified account, when logging in, then sign-in is refused with "Verify your email" and a Resend option. |
| AC-AUTH-010 | After the user clicks the verification link once, they can log in and are never asked to verify again. |
| AC-AUTH-011 | Registration without a city shows an error; the city picker lists only active cities. |
| AC-AUTH-012 | Given sign-up metadata containing `role: "admin"`, the created profile still has role `citizen`. |
| AC-AUTH-013 | The Welcome screen has no guest option, and anonymous sign-in is disabled in Supabase. |

### 2.2 Form validation

| ID | Criteria |
|----|----------|
| AC-VAL-001 | Invalid email format shows an inline error before any network call. |
| AC-VAL-002 | Password under the minimum length is rejected with a specific message. |
| AC-VAL-003 | Description over 500 chars can't be entered; counter shows `n/500`. |
| AC-VAL-004 | Review: Submit is disabled until photo, GPS, title, and category are present. |
| AC-VAL-005 | Server rejects out-of-range lat/long and invalid enum values with 400 and no row created. |

### 2.3 Camera and GPS permissions

| ID | Criteria |
|----|----------|
| AC-CAM-001 | First tap on Register New Complaint shows the camera rationale, then the OS prompt. |
| AC-CAM-002 | Camera denied (EC-01): the screen explains, shows "Open Settings", and the user can't proceed. |
| AC-CAM-003 | After capture, a preview with Retake and Use photo is shown; Retake reopens the camera. |
| AC-CAM-004 | No gallery picker is offered on the MVP path; no previously stored image is used. |
| AC-GPS-001 | After photo, the location rationale and OS prompt appear; on grant, lat/long and accuracy are shown. |
| AC-GPS-002 | Location denied (EC-02): explanation + Settings link; Next/Submit blocked. |
| AC-GPS-003 | Location services off: prompt to enable; Retry works after enabling. |
| AC-GPS-004 | Timeout (simulate): Retry shown; no coordinates are displayed or stored. |
| AC-GPS-005 | Low accuracy (simulate > 🟡 50 m): warning shown; user may Retry or proceed; accuracy stored. |
| AC-GPS-006 | No location requests occur outside the complaint flow (verify via OS location indicator / logs). |
| AC-GPS-007 | After a fix, the citizen sees a readable address (street/area, city, PIN) and accuracy; no raw coordinates appear on citizen screens. |
| AC-GPS-008 | With the network off (geocoder unavailable), the screen shows "address not available" and submission still succeeds with coordinates stored. |
| AC-GPS-009 | Address fields are stored on the complaint, and changing them in the request doesn't change the routed city (routing uses coordinates). |

### 2.4 AI output schema and fallback

| ID | Criteria |
|----|----------|
| AC-AI-001 | A valid provider/mock response passes schema validation and pre-fills Review. |
| AC-AI-002 | Response with an unknown category is normalized to `other`. |
| AC-AI-003 | Response with extra properties or wrong types fails validation and returns `source: "fallback"`. |
| AC-AI-004 | Non-JSON response returns fallback; client receives no provider text. |
| AC-AI-005 | Provider exceeding `AI_TIMEOUT_MS` returns fallback within timeout + 1 s (EC-07). |
| AC-AI-006 | Provider 429/5xx returns fallback (EC-08); manual category picker opens. |
| AC-AI-007 | Request payload to the provider contains no latitude/longitude and the image has no EXIF GPS. |
| AC-AI-008 | Client responses never contain the system prompt, API key, or stack trace (inspect network). |
| AC-AI-009 | With `AI_PROVIDER=mock`, the full submit flow works with no external network calls to AI. |

### 2.5 Complaint creation and retry

| ID | Criteria |
|----|----------|
| AC-SUB-001 | Successful submit creates exactly one `complaints` row with status `submitted`, one history row, and a reference matching `^CL-\d{4}-\d{6}$`. |
| AC-SUB-002 | Confirmation screen appears only after the server returns the reference (EC-20). |
| AC-SUB-003 | Rapid double tap on Submit creates one row (EC-09). |
| AC-SUB-004 | Re-sending the same request with the same idempotency key returns the same reference and no new row (EC-10, EC-11). |
| AC-SUB-005 | Upload failure (simulate): error shown, no complaint row created (EC-06). |
| AC-SUB-006 | Upload succeeds, create fails: retry reuses the uploaded object; result is one row (EC-12). |
| AC-SUB-007 | 100 concurrent submissions (script) produce 100 distinct references. |
| AC-SUB-008 | `ai_suggestion` and `ai_suggested_category` are stored; if the citizen changed the category, `category` holds the citizen's value. |

### 2.6 Department routing

| ID | Criteria |
|----|----------|
| AC-RT-001 | Each of the 21 categories routes to the department in DB §3.0c (table-driven test, 21 cases). |
| AC-RT-001a | Adding a new active category row (with an existing `department_key`) makes it appear in the picker and the AI list, and routes correctly, with no code change. |
| AC-RT-001b | A `department_routes` override for a city wins over the default mapping. |
| AC-RT-002 | `other` routes to General Municipal Review. |
| AC-RT-003 | If the mapped department is inactive, routing falls back to General Municipal Review. |
| AC-RT-004 | A request that includes a `department_id` in the body is ignored; routing uses the category only. |
| AC-RT-005 | Admin reassignment updates the department, writes history and audit rows (EC-16). |
| AC-RT-006 | Assigning a Pune complaint to another city's department is rejected by the trigger. |
| AC-RT-007 | Profile city Pune, GPS in Pune → `city_id` = Pune, `city_source = 'gps'`. |
| AC-RT-008 | Profile city Pune, GPS in Mumbai → `city_id` = Mumbai; Review shows "goes to Mumbai". |
| AC-RT-009 | Profile city Pune, GPS outside every seeded city → `city_id` = Pune, `outside_city_limits = true`; submission succeeds with a warning. |
| AC-RT-010 | A `city_id` sent in the request body is ignored. |
| AC-RT-011 | A complaint in any seeded city routes to that city's department (every city has the 11 standard departments). |

### 2.6a SLA

| ID | Criteria |
|----|----------|
| AC-SLA-001 | A new High complaint has `due_at` = submission time + 72 h (repeat for each severity). |
| AC-SLA-002 | A complaint past `due_at` and not resolved/closed/rejected shows Overdue on the dashboard count and queue chip. |
| AC-SLA-003 | A resolved complaint is never Overdue, even after its due time. |
| AC-SLA-004 | Officer changes severity Medium → Critical: `due_at` becomes submission time + 24 h. |
| AC-SLA-005 | Admin edits `sla_policies`; due times update; officers/citizens can't edit it. |
| AC-SLA-006 | Overdue counts respect RLS (an officer only counts their department). |

### 2.6b Country and city picker

| ID | Criteria |
|----|----------|
| AC-CITY-001 | Sign-up defaults to India; the State dropdown lists only India's states/UTs. |
| AC-CITY-002 | City stays disabled until a state is chosen; then it lists only that state's active cities. |
| AC-CITY-003 | Changing the state clears the selected city; changing the country clears both. |
| AC-CITY-004 | Search works in both dropdowns ("maha" finds Maharashtra, "pun" finds Pune). |
| AC-CITY-005 | Inactive states and cities never appear. |
| AC-CITY-006 | Server rejects sign-up when the city doesn't belong to the chosen state (or is inactive). |

### 2.7 RLS and unauthorized access

| ID | Criteria |
|----|----------|
| AC-RLS-001 | `citizen_b` selecting `citizen_a`'s complaint by ID returns zero rows. |
| AC-RLS-002 | Citizen can't read `internal` comments on their own complaint (select and Realtime). |
| AC-RLS-003 | Citizen update of `profiles.role` fails (permission denied). |
| AC-RLS-004 | Citizen direct insert into `complaints` or `complaint_status_history` fails. |
| AC-RLS-005 | `officer_roads` can't read a complaint assigned to Waste (EC-15). |
| AC-RLS-006 | `officer_roads` calling `update-status` on a Waste complaint gets 403. |
| AC-RLS-007 | Admin can read all complaints. |
| AC-RLS-008 | Officer calling `reassign-complaint` or `set-user-role` gets 403. |
| AC-RLS-009 | Unauthenticated requests to any table return no rows / 401. |
| AC-RLS-010 | RLS is enabled on every `public` table (catalog query). |

### 2.8 Officer workflow

| ID | Criteria |
|----|----------|
| AC-OFF-001 | Officer queue shows only their department's complaints. |
| AC-OFF-002 | Officer moves `assigned → under_review → in_progress → resolved`; each step writes one history row with `actor_id` = officer. |
| AC-OFF-003 | `resolved` without a resolution note is rejected. |
| AC-OFF-004 | `rejected` without a reason is rejected; with a reason, the citizen sees it (EC-17). |
| AC-OFF-005 | Invalid transition (e.g. `submitted → resolved`) is rejected by the function and by the DB trigger. |
| AC-OFF-006 | A public update is visible to the citizen; an internal note isn't. |
| AC-OFF-007 | Two officers editing the same complaint: the second save with a stale version gets a conflict error and a reload prompt (EC-14). |

### 2.9 Status-history consistency

| ID | Criteria |
|----|----------|
| AC-HIST-001 | For every complaint, `status` equals the `new_status` of its latest history row (query over all seed + test data). |
| AC-HIST-002 | History rows can't be updated or deleted by any non-service role. |
| AC-HIST-003 | `resolved_at` is set exactly when status becomes `resolved`. |

### 2.10 Realtime

| ID | Criteria |
|----|----------|
| AC-RTM-001 | With citizen Details open, an officer status change appears within ~3 s without manual refresh. |
| AC-RTM-002 | Timeline gains a new entry live with timestamp and public update text. |
| AC-RTM-003 | Toggle airplane mode for 30 s, then reconnect: the screen shows the latest state (refetch on reconnect) (EC-13). |
| AC-RTM-004 | Pull-to-refresh returns current state when Realtime is unavailable. |
| AC-RTM-005 | Citizen subscription never receives events for other citizens' complaints or internal comments. |

### 2.11 Image storage access

| ID | Criteria |
|----|----------|
| AC-IMG-001 | The photo object URL without auth returns 400/403. |
| AC-IMG-002 | Citizen can view their own complaint photo; `citizen_b` can't. |
| AC-IMG-003 | Officer gets a signed URL for a department complaint; it stops working after expiry. |
| AC-IMG-004 | Upload over the size limit or with a disallowed MIME type is rejected. |
| AC-IMG-005 | Upload to another user's prefix is rejected. |
| AC-IMG-006 | Stored image has no EXIF GPS data. |

### 2.12 Mobile usability and responsive layout

| ID | Criteria |
|----|----------|
| AC-UX-001 | Happy path from Home to Confirmation takes ≤ 5 primary taps (excluding OS permission prompts and typing). |
| AC-UX-002 | All tappable elements are ≥ 44×44 pt. |
| AC-UX-003 | Text contrast meets 4.5:1 for body text (check palette with a contrast tool). |
| AC-UX-004 | All icon buttons have accessibility labels (check with VoiceOver/TalkBack spot test). |
| AC-UX-005 | Layouts work on a small phone (≈ 360×640 dp) and a large phone without clipped content. |
| AC-UX-006 | Dashboard is usable at 1280 px and 1920 px widths; queue table scrolls horizontally rather than breaking under 1024 px. |
| AC-UX-007 | Status chips use text labels plus color (not color alone). |

*Accessibility spot checks don't constitute full WCAG validation, which needs manual assistive-technology testing and expert review.*

---

## 3. Edge-case coverage map

| Edge case | Covered by |
|-----------|-----------|
| EC-01, EC-02, EC-03 | AC-CAM-002, AC-GPS-002..005 |
| EC-04 (app closed mid-submit) | Manual: kill app during submit, relaunch, confirm resume/discard and single row |
| EC-05, EC-06, EC-12 | AC-SUB-005, AC-SUB-006 |
| EC-07, EC-08 | AC-AI-005, AC-AI-006 |
| EC-09, EC-10, EC-11, EC-20 | AC-SUB-002..004 |
| EC-13 | AC-RTM-003, AC-RTM-004 |
| EC-14 | AC-OFF-007 |
| EC-15 | AC-RLS-005, AC-RLS-006 |
| EC-16 | AC-RT-005 |
| EC-17 | AC-OFF-004 |
| EC-18 (account deletion, P1) | Manual: delete account, confirm profile removed and complaints anonymized |
| EC-19 | AC-AI-002 + manual irrelevant-photo test |

---

## 4. Test data

- Seed: Indian states/UTs and cities + Stockholm, 21 categories, 11 departments per city, SLA policies, 2 officers and ~20 demo complaints in your test city (some backdated to show Overdue), 1 admin, 2 citizens. Examples above use Pune/Mumbai as placeholders; swap in your actual test city.
- Test device: Android phone (Expo Go during development, APK for the final run).
- Fixtures: one clear photo per group at least (pothole, blocked drain, open manhole, garbage pile, hanging wire, fallen tree), one streetlight photo, one blurry photo, one irrelevant photo (e.g. a coffee cup), all team-owned with no people or plates.
- Forced-failure switches (server config, test env only): `AI_PROVIDER=mock_timeout`, `mock_invalid_json`, `mock_500`.

---

## 5. End-to-end demo script

Devices: citizen on a phone (Expo dev build or Expo Go if camera/location work there), officer on a laptop browser.

| Step | Actor | Action | Expected result |
|------|-------|--------|-----------------|
| 1 | Citizen | Log in as `citizen_a` | Home shows greeting and recent complaints |
| 2 | Citizen | Register New Complaint → photograph the pothole fixture | Preview with Retake |
| 3 | Citizen | Allow location | Lat/long + accuracy shown |
| 4 | Citizen | (Optional) add "Near the bus stop" → Next | AI (or labeled fallback) suggests category `road_damage`, title, severity, Roads |
| 5 | Citizen | Review → Submit | Spinner, then confirmation |
| 6 | Citizen | — | Reference `CL-2026-NNNNNN` and Roads Department shown |
| 7 | Officer | Log in as `officer_roads` on web | New complaint at top of queue |
| 8 | Officer | Set Under Review → In Progress with public update "Crew scheduled for inspection" | Saved; history rows written |
| 9 | Citizen | (Details screen already open) | Status and timeline update without refresh |
| 10 | Officer | Resolve with note "Pothole filled" | Status Resolved |
| 11 | Citizen | — | "Issue Resolved" view with resolution note and full history |

Presenter note: say clearly that this is a simulated municipal workflow and not connected to any real municipal corporation, and state whether the AI is live or on the fallback. Optional: show one backdated complaint in the Overdue card to demonstrate the SLA.

---

## 6. Exit criteria for the MVP

- All P0 acceptance criteria pass, or failures are documented with a workaround the team accepts.
- AC-RLS-*, AC-SUB-003/004, and AC-AI-007/008 pass with **no exceptions** (security and integrity).
- The demo script passes twice in a row.
