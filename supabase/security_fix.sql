-- ==============================================================================
-- CivicLens: Security Linter Fixes for Supabase Advisors
-- 1. Enables RLS on reference_counters (Default Deny for PostgREST clients)
-- 2. Sets security_invoker = true on complaints_with_sla view (Enforces caller's RLS)
-- ==============================================================================

-- 1. Fix: RLS on reference_counters
alter table public.reference_counters enable row level security;

-- 2. Fix: Security Invoker on View
drop view if exists public.complaints_with_sla;
create or replace view public.complaints_with_sla
with (security_invoker = true) as
select
  c.*,
  c.created_at + make_interval(hours => s.target_hours) as due_at,
  (
    c.status not in ('resolved', 'closed', 'rejected')
    and now() > c.created_at + make_interval(hours => s.target_hours)
  ) as is_overdue
from public.complaints c
join public.sla_policies s on s.severity = c.severity;

