# CivicLens — Security & Privacy Requirements

> **Deliverable 6 of 9.** Documentation only. Policies below are **proposed** and have not been applied to any database. SQL is illustrative.
> **Related:** [Architecture §4, §9](./03-technical-architecture.md) · [Database](./04-database-design.md).

---

## 1. Threat model (summary)

| Threat | Mitigation |
|--------|-----------|
| Citizen reads another citizen's complaint | RLS on `complaints` keyed to `citizen_id = auth.uid()` |
| Citizen reads internal notes | RLS on `complaint_comments` filters `visibility = 'internal'`; Realtime respects RLS |
| User promotes self to officer/admin | `profiles.role` and `department_id` not writable by the owner; changes only via admin Edge Function |
| Officer reads or edits another department | RLS + Edge Function check `assigned_department_id = my department` |
| Forged status update or forged officer comment | Status changes only via `update-status` Edge Function; trigger rejects invalid transitions; `author_id`/`actor_id` set server-side from JWT |
| Secret leakage via app bundle | Only `SUPABASE_URL` and anon key in client; service role and AI keys only in Edge Function secrets |
| Public photo exposure | Private bucket; owner policy or short-lived signed URLs |
| Malicious upload | MIME/size limits, server-side re-check, EXIF strip |
| Submission or AI spam | Rate limits per user; idempotency keys |
| Prompt injection via description | Treat as data; schema-validate output (AI Spec §8) |

---

## 2. Authentication

- Supabase Auth, email + password. Minimum password length 🟡 **10** characters (configurable in Supabase Auth settings).
- **Email confirmation is required before first sign-in** (Supabase Auth "Confirm email" on). It's a one-time step; unverified users can't log in. Login offers "Resend verification email".
- No guest or anonymous sessions (Supabase anonymous sign-in stays disabled).
- Password reset responses are identical whether or not the email exists (no account enumeration).
- Session tokens on mobile are stored with `expo-secure-store` (Keychain/Keystore), not plain AsyncStorage. *(Library choice must be verified against current Expo docs before implementation.)*
- Officer and admin accounts are **created or promoted by an admin** (or by the seed script for the demo). There is no self-service officer sign-up.
- Sign-up passes `full_name`, `city_id`, and optional `phone` as user metadata. A `handle_new_user` trigger creates the `profiles` row, checks that `city_id` is an active city, and **always** sets `role = 'citizen'`. Any `role` or `department_id` in the metadata is ignored, because the client controls metadata.

---

## 3. Role and permission matrix

Helper functions (illustrative, `security definer`, fixed `search_path`):

```sql
-- Returns the caller's role; never trusts client-supplied claims.
create function public.current_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

create function public.current_department() returns uuid
language sql stable security definer set search_path = public as $$
  select department_id from profiles where id = auth.uid()
$$;
```

| Table | Citizen | Officer | Admin | Service role (Edge Fn) |
|-------|---------|---------|-------|------------------------|
| `profiles` | R/U own row (name, phone only) | R own; R names of dept colleagues | R/U all (role via Edge Fn) | All |
| `departments` | R active | R | R/W | All |
| `complaints` | R own | R where `assigned_department_id = current_department()` | R all | All writes |
| `complaint_status_history` | R for own complaints | R for dept complaints | R all | Insert only |
| `complaint_comments` | R `public` on own complaints | R/insert on dept complaints | R/insert all | All |
| `notifications` | R/U `is_read` on own | same | same | Insert |
| `audit_logs` | — | — | R | Insert only |
| `reference_counters` | — | — | — | All |

**Direct client inserts/updates on `complaints`, `complaint_status_history`, and `audit_logs` are denied.** These go through Edge Functions only, so the server controls reference generation, routing, status transitions, and audit writes.

---

## 4. RLS policies (illustrative)

RLS is **enabled on every table** in `public`. Default deny.

```sql
alter table complaints enable row level security;

-- Citizens: own complaints only
create policy complaints_citizen_select on complaints
  for select using (citizen_id = auth.uid());

-- Officers: their department's complaints only
create policy complaints_officer_select on complaints
  for select using (
    public.current_role() = 'officer'
    and assigned_department_id = public.current_department()
  );

-- Admins: everything (read)
create policy complaints_admin_select on complaints
  for select using (public.current_role() = 'admin');

-- No insert/update/delete policies for authenticated users:
-- writes go through Edge Functions using the service role.
```

```sql
alter table complaint_comments enable row level security;

create policy comments_citizen_select on complaint_comments
  for select using (
    visibility = 'public'
    and exists (select 1 from complaints c
                where c.id = complaint_id and c.citizen_id = auth.uid())
  );

create policy comments_staff_select on complaint_comments
  for select using (
    public.current_role() = 'admin'
    or (public.current_role() = 'officer' and exists (
          select 1 from complaints c
          where c.id = complaint_id
            and c.assigned_department_id = public.current_department()))
  );
```

```sql
alter table profiles enable row level security;

create policy profiles_self_select on profiles
  for select using (id = auth.uid());

-- Owner may update only safe columns. Enforced with a column-level grant:
revoke update on profiles from authenticated;
grant update (full_name, phone) on profiles to authenticated;

create policy profiles_self_update on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
```

The column-level grant is what prevents self-promotion: even with a valid update policy, `role` and `department_id` are not updatable by `authenticated`.

---

## 5. Edge Function authorization

Each function:

1. Verifies the JWT and resolves the caller via `auth.getUser()`.
2. Loads the caller's `profiles` row (role, department) with the service role.
3. Checks the action is permitted (e.g. officer may only update complaints in their department; only admins reassign or change roles).
4. Performs the write in one transaction and writes an `audit_logs` row for privileged actions.
5. Sets `actor_id` / `author_id` from the verified user, **never** from the request body.

| Function | Allowed callers |
|----------|-----------------|
| `classify-issue` | Any authenticated user (rate-limited) |
| `submit-complaint` | Any authenticated user (rate-limited) |
| `update-status` | Officer (own dept), admin |
| `add-comment` | Officer (own dept), admin; citizens only `public` on own complaint if P1 citizen replies are enabled |
| `reassign-complaint` | Admin |
| `set-user-role` | Admin (cannot demote the last admin; cannot change own role) |
| `get-photo-url` | Owner citizen, officer (own dept), admin |
| `delete-account` | The user themself |

---

## 6. Storage

- Bucket `complaint-photos`, **private**.
- Object key: `{citizen_id}/{uuid}.jpg`. The UUID is random; keys are not guessable.
- Upload policy: an authenticated user may insert only under their own `{auth.uid()}/` prefix.
- Read: citizens may read their own prefix; officers/admins get a **signed URL** from `get-photo-url` with 🟡 **5-minute** expiry.
- Limits: `image/jpeg`, `image/png`, `image/heic` (converted to JPEG client-side if feasible); max 🟡 **5 MB**. Enforce via bucket config and re-check in `submit-complaint` (the referenced object must exist, belong to the caller, and match type/size).
- Strip EXIF before upload or on the server. EXIF can contain GPS and device identifiers.

---

## 7. Input validation

| Field | Rule |
|-------|------|
| `title` | 3–140 chars, trimmed |
| `description` | ≤ 2000 chars stored (UI caps at 500) |
| `category` | Must be an active `categories.code` (FK) |
| `severity`, `status` | Must be a valid enum value |
| `latitude` / `longitude` | Numeric, in range. City is resolved server-side by the GPS + profile rule (DB §3.0); any `city_id` sent by the client is ignored |
| `idempotency_key` | UUID format |
| `photo_path` | Must start with `{caller_id}/` and exist in the bucket |
| Comment `body` | 1–2000 chars |

All text is rendered as plain text in both clients (no HTML rendering), which avoids stored XSS on the web dashboard.

---

## 8. Rate limiting and abuse prevention

🟡 Proposed limits, enforced in Edge Functions with a small counter table or the platform's rate-limit facility (verify what Supabase offers before building):

| Action | Limit |
|--------|-------|
| `submit-complaint` | 10 per user per hour; 30 per day |
| `classify-issue` | 10 per user per hour; 1 concurrent |
| Login attempts | Supabase Auth defaults (verify) |
| OpenRouter free tier | Provider limits apply on top of ours (verify current numbers). When hit, `classify-issue` returns the fallback. |

Exceeding a limit returns HTTP 429 with a friendly message. Nothing is silently dropped.

---

## 9. Secrets management

| Secret | Location | Never in |
|--------|----------|----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Function secrets | App bundle, `EXPO_PUBLIC_*`, git |
| `AI_PROVIDER_API_KEY` | Edge Function secrets | App bundle, logs, client responses |

- `.env*` files are git-ignored. A `.env.example` lists names only.
- 🟡 A CI or pre-commit check greps the built bundle and repo for `service_role` and known key prefixes.

---

## 10. Logging

- Log: function name, request ID, user ID, outcome code, latency.
- Don't log: passwords, tokens, API keys, full descriptions, image bytes, precise coordinates (round to 3 decimals if location must appear in logs).
- `audit_logs.metadata` stores before/after values for privileged changes, not personal data beyond what the action needs.

---

## 11. Privacy

**Data collected:** full name, email, optional phone, per-complaint photo, per-complaint GPS + accuracy, description.
**Not collected:** background location, contacts, device identifiers, gallery access.

| Requirement | Detail |
|-------------|--------|
| Purpose limitation | Location and photos are used only to locate and handle the reported issue |
| Precise GPS to AI | Not sent (FR-AI-008) |
| Visibility of location | Visible to the citizen, the assigned department, and admins. Not public. |
| People in photos | 🟡 P1: warn the citizen at capture ("Avoid capturing faces and licence plates"). P2: automatic blurring. |
| Retention | ✅ Complaints are kept; there's no auto-deletion in the MVP. During testing the owner wipes test data manually. A defined retention period is needed before any public launch. |
| Account deletion | `delete-account` removes the auth user and profile, deletes personal fields (name, phone), and **anonymizes** complaints (`citizen_id` reassigned to a sentinel "deleted user" profile) so municipal records stay consistent. Photos of the user's complaints are deleted or kept per the retention decision (OQ-9). |
| Privacy policy & terms | Must exist before public use; linked at registration. Hackathon version must state that the app is a demo and not connected to any municipal corporation. |
| India (DPDP Act, 2023) | The primary market is India, where the Digital Personal Data Protection Act, 2023 applies. A real launch needs a clear consent notice, a way to withdraw consent and delete data, and processor agreements with Supabase and the AI provider. Check where Supabase stores the data (project region) as part of that review. |
| EU (GDPR) | Applies if Swedish/EU users are onboarded for real. |
| Legal note | **This PRD doesn't provide legal advice.** Get a proper review before a public launch. |

---

## 12. Demo data rules

- Seed users use fake names and `@example.com` emails.
- Seed photos are team-owned or openly licensed, with no identifiable people or licence plates.
- Seed coordinates are plausible public locations (main roads, markets, bus stops) in the seeded cities, not homes.
- Every demo record is flagged and badged "Demo data" on the dashboard.

---

## 13. Verification checklist (security)

- [ ] RLS enabled on every `public` table (query `pg_tables.rowsecurity`).
- [ ] Citizen A can't select citizen B's complaint (API test).
- [ ] Citizen can't select `internal` comments, including via Realtime.
- [ ] Citizen `update profiles set role='admin'` fails.
- [ ] Officer in Roads can't read a Waste complaint.
- [ ] Direct client insert into `complaints` fails.
- [ ] Invalid status transition is rejected by the trigger even with the service role.
- [ ] Photo object is not reachable without auth; signed URL expires.
- [ ] Built app bundle contains no service-role or AI key.

These map to tests in the [Test Plan](./08-acceptance-criteria-and-test-plan.md).
