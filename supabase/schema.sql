-- ==============================================================================
-- CivicLens: Complete Supabase Database Schema, Functions, RLS & Seed Data
-- Architecture & Specs based on REFERENCE/docs/prd/04-database-design.md
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. ENUM TYPES
do $$ begin
  create type user_role as enum ('citizen', 'officer', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type complaint_severity as enum ('low', 'medium', 'high', 'critical');
exception when duplicate_object then null; end $$;

do $$ begin
  create type complaint_status as enum (
    'submitted',
    'assigned',
    'under_review',
    'in_progress',
    'resolved',
    'closed',
    'rejected'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type comment_visibility as enum ('public', 'internal');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum (
    'status_change',
    'assignment',
    'comment',
    'resolution',
    'system'
  );
exception when duplicate_object then null; end $$;

-- 3. GEOGRAPHY & MASTER TABLES

-- 3.1 Countries
create table if not exists public.countries (
  code text primary key, -- ISO 3166-1 alpha-2 ('IN', 'SE')
  name text not null,
  phone_prefix text not null,
  emergency_number text not null,
  is_active boolean not null default true
);

-- 3.2 States / Regions
create table if not exists public.states (
  id uuid primary key default gen_random_uuid(),
  country_code text not null references public.countries(code) on delete cascade,
  name text not null,
  type text not null check (type in ('state', 'union_territory', 'region')),
  is_active boolean not null default true,
  unique (country_code, name)
);

-- 3.3 Cities
create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  country_code text not null references public.countries(code) on delete cascade,
  state_id uuid not null references public.states(id) on delete cascade,
  name text not null,
  timezone text not null default 'Asia/Kolkata',
  center_lat double precision not null,
  center_lng double precision not null,
  radius_km double precision not null check (radius_km > 0) default 20,
  is_active boolean not null default true,
  unique (state_id, name)
);

create index if not exists idx_cities_state_active on public.cities (state_id, is_active, name);

-- 3.4 Categories (Catalog of issue types)
create table if not exists public.categories (
  code text primary key,
  label text not null,
  group_code text not null,
  group_label text not null,
  examples text not null,
  department_key text not null,
  severity_hint complaint_severity,
  sort_order integer not null,
  is_active boolean not null default true
);

-- 3.5 Departments
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  department_key text not null,
  name text not null,
  description text,
  is_active boolean not null default true,
  is_general_review boolean not null default false,
  unique (city_id, department_key),
  unique (city_id, name)
);

-- 3.6 Department Routing Overrides (Optional per city)
create table if not exists public.department_routes (
  city_id uuid not null references public.cities(id) on delete cascade,
  category_code text not null references public.categories(code) on delete cascade,
  department_id uuid not null references public.departments(id) on delete cascade,
  primary key (city_id, category_code)
);

-- 4. PROFILES (Linked to Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 120),
  role user_role not null default 'citizen',
  department_id uuid references public.departments(id) on delete set null,
  city_id uuid references public.cities(id) on delete set null,
  phone text,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles (role);
create index if not exists idx_profiles_department on public.profiles (department_id);

-- 5. COMPLAINTS
create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  citizen_id uuid not null references public.profiles(id) on delete cascade,
  city_id uuid not null references public.cities(id),
  city_source text not null check (city_source in ('gps', 'profile')),
  outside_city_limits boolean not null default false,
  title text not null check (char_length(title) between 1 and 140),
  description text check (char_length(description) <= 2000),
  category text not null references public.categories(code),
  ai_suggested_category text references public.categories(code),
  severity complaint_severity not null default 'medium',
  ai_suggestion jsonb,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  location_accuracy_m double precision check (location_accuracy_m >= 0),
  address_text text check (char_length(address_text) <= 300),
  locality text check (char_length(locality) <= 120),
  postal_code text check (char_length(postal_code) <= 12),
  photo_path text not null,
  assigned_department_id uuid not null references public.departments(id),
  assigned_officer_id uuid references public.profiles(id),
  status complaint_status not null default 'submitted',
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolution_notes text
);

create index if not exists idx_complaints_citizen on public.complaints (citizen_id, created_at desc);
create index if not exists idx_complaints_dept_status on public.complaints (assigned_department_id, status);
create index if not exists idx_complaints_status on public.complaints (status);
create index if not exists idx_complaints_city_status on public.complaints (city_id, status);
create index if not exists idx_complaints_category on public.complaints (category);

-- 6. STATUS HISTORY & AUDIT
create table if not exists public.complaint_status_history (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  previous_status complaint_status,
  new_status complaint_status not null,
  actor_id uuid not null references public.profiles(id),
  citizen_visible_update text,
  created_at timestamptz not null default now()
);

create index if not exists idx_status_history on public.complaint_status_history (complaint_id, created_at asc);

-- 7. COMMENTS
create table if not exists public.complaint_comments (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  body text not null check (char_length(body) between 1 and 2000),
  visibility comment_visibility not null default 'public',
  created_at timestamptz not null default now()
);

create index if not exists idx_comments_complaint on public.complaint_comments (complaint_id, created_at asc);

-- 8. NOTIFICATIONS
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  complaint_id uuid references public.complaints(id) on delete cascade,
  type notification_type not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_recipient on public.notifications (recipient_id, is_read, created_at desc);

-- 9. AUDIT LOGS
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_entity on public.audit_logs (entity_type, entity_id, created_at desc);
create index if not exists idx_audit_actor on public.audit_logs (actor_id, created_at desc);

-- 10. SLA POLICIES & COUNTER
create table if not exists public.sla_policies (
  severity complaint_severity primary key,
  target_hours integer not null check (target_hours > 0)
);

create table if not exists public.reference_counters (
  year integer primary key,
  last_seq bigint not null default 0
);

-- 11. VIEWS (With SLA calculations)
create or replace view public.complaints_with_sla as
select
  c.*,
  c.created_at + make_interval(hours => s.target_hours) as due_at,
  (
    c.status not in ('resolved', 'closed', 'rejected')
    and now() > c.created_at + make_interval(hours => s.target_hours)
  ) as is_overdue
from public.complaints c
join public.sla_policies s on s.severity = c.severity;

-- 12. HELPER FUNCTIONS & TRIGGERS

-- Helper: Get current role of caller
create or replace function public.current_role()
returns user_role
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'citizen'::user_role
  );
$$;

-- Helper: Get current department of caller
create or replace function public.current_department()
returns uuid
language sql stable security definer set search_path = public as $$
  select department_id from public.profiles where id = auth.uid();
$$;

-- Trigger: Automatically create profile on Auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role, city_id, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Citizen User'),
    'citizen', -- Always citizen by default
    (new.raw_user_meta_data->>'city_id')::uuid,
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger: Update updated_at on complaints update
create or replace function public.handle_updated_at()
returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_complaint_updated on public.complaints;
create trigger on_complaint_updated
  before update on public.complaints
  for each row execute function public.handle_updated_at();

-- 13. ROW LEVEL SECURITY (RLS) POLICIES

alter table public.countries enable row level security;
alter table public.states enable row level security;
alter table public.cities enable row level security;
alter table public.categories enable row level security;
alter table public.departments enable row level security;
alter table public.department_routes enable row level security;
alter table public.profiles enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_status_history enable row level security;
alter table public.complaint_comments enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.sla_policies enable row level security;

-- Public master tables read access
create policy "Public read countries" on public.countries for select using (true);
create policy "Public read states" on public.states for select using (true);
create policy "Public read cities" on public.cities for select using (true);
create policy "Public read categories" on public.categories for select using (true);
create policy "Public read departments" on public.departments for select using (true);
create policy "Public read routes" on public.department_routes for select using (true);
create policy "Public read sla" on public.sla_policies for select using (true);

-- Profiles RLS
create policy "Users can view own profile" on public.profiles
  for select using (id = auth.uid());

create policy "Users can update own profile name/phone" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

create policy "Staff can view colleague profiles" on public.profiles
  for select using (
    public.current_role() in ('officer', 'admin')
  );

-- Complaints RLS
create policy "Citizens can view own complaints" on public.complaints
  for select using (citizen_id = auth.uid());

create policy "Officers can view department complaints" on public.complaints
  for select using (
    public.current_role() = 'officer' and assigned_department_id = public.current_department()
  );

create policy "Admins can view all complaints" on public.complaints
  for select using (public.current_role() = 'admin');

-- Status History RLS
create policy "Citizens can view history of own complaints" on public.complaint_status_history
  for select using (
    exists (
      select 1 from public.complaints c
      where c.id = complaint_id and c.citizen_id = auth.uid()
    )
  );

create policy "Staff can view history of dept complaints" on public.complaint_status_history
  for select using (
    public.current_role() = 'admin' or (
      public.current_role() = 'officer' and exists (
        select 1 from public.complaints c
        where c.id = complaint_id and c.assigned_department_id = public.current_department()
      )
    )
  );

-- Comments RLS
create policy "Citizens can view public comments on own complaints" on public.complaint_comments
  for select using (
    visibility = 'public' and exists (
      select 1 from public.complaints c
      where c.id = complaint_id and c.citizen_id = auth.uid()
    )
  );

create policy "Staff can view comments on department complaints" on public.complaint_comments
  for select using (
    public.current_role() = 'admin' or (
      public.current_role() = 'officer' and exists (
        select 1 from public.complaints c
        where c.id = complaint_id and c.assigned_department_id = public.current_department()
      )
    )
  );

create policy "Staff can insert comments on dept complaints" on public.complaint_comments
  for insert with check (
    author_id = auth.uid() and (
      public.current_role() = 'admin' or (
        public.current_role() = 'officer' and exists (
          select 1 from public.complaints c
          where c.id = complaint_id and c.assigned_department_id = public.current_department()
        )
      )
    )
  );

-- Notifications RLS
create policy "Users can view own notifications" on public.notifications
  for select using (recipient_id = auth.uid());

create policy "Users can update own notification read status" on public.notifications
  for update using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- Audit Logs RLS
create policy "Admins can view audit logs" on public.audit_logs
  for select using (public.current_role() = 'admin');

-- 14. SEED DATA

-- SLA Policies
insert into public.sla_policies (severity, target_hours) values
  ('critical', 24),
  ('high', 72),
  ('medium', 168),
  ('low', 336)
on conflict (severity) do update set target_hours = excluded.target_hours;

-- Countries
insert into public.countries (code, name, phone_prefix, emergency_number, is_active) values
  ('IN', 'India', '+91', '112', true),
  ('SE', 'Sweden', '+46', '112', true)
on conflict (code) do nothing;

-- Categories (21 PRD standard categories)
insert into public.categories (code, label, group_code, group_label, examples, department_key, severity_hint, sort_order) values
  ('road_damage', 'Potholes & road damage', 'roads_traffic', 'Roads & Traffic', 'Potholes, broken or sunken road', 'roads', 'medium', 1),
  ('traffic_signal', 'Traffic signals & signs', 'roads_traffic', 'Roads & Traffic', 'Signal not working, missing sign, faded zebra crossing', 'traffic', 'high', 2),
  ('footpath', 'Broken or blocked footpath', 'roads_traffic', 'Roads & Traffic', 'Broken tiles, missing ramp, blocked walkway', 'public_works', 'low', 3),
  ('encroachment', 'Encroachment', 'roads_traffic', 'Roads & Traffic', 'Illegal stalls or structures on road/footpath', 'public_works', 'medium', 4),
  ('drainage', 'Blocked drain / sewage overflow', 'water_drainage', 'Water & Drainage', 'Choked drain, sewage on road', 'drainage', 'high', 5),
  ('open_manhole', 'Open or broken manhole', 'water_drainage', 'Water & Drainage', 'Missing or broken cover', 'drainage', 'critical', 6),
  ('waterlogging', 'Waterlogging / flooding', 'water_drainage', 'Water & Drainage', 'Water standing on road after rain', 'drainage', 'high', 7),
  ('water_leakage', 'Water pipe leakage', 'water_drainage', 'Water & Drainage', 'Burst pipeline, leaking valve', 'water_supply', 'medium', 8),
  ('water_supply', 'No / dirty water supply', 'water_drainage', 'Water & Drainage', 'No water, contaminated water', 'water_supply', 'high', 9),
  ('streetlight', 'Streetlight not working', 'electricity_lighting', 'Electricity & Lighting', 'Dark, flickering, or broken streetlight', 'electrical', 'low', 10),
  ('electrical_hazard', 'Electrical hazard', 'electricity_lighting', 'Electricity & Lighting', 'Hanging or exposed wires, damaged pole, sparking box', 'electrical', 'critical', 11),
  ('power_supply', 'Power supply issue', 'electricity_lighting', 'Electricity & Lighting', 'Area power cut, transformer problem', 'electrical', 'high', 12),
  ('garbage', 'Garbage & overflowing bins', 'cleanliness_health', 'Cleanliness & Health', 'Uncollected garbage, overflowing bin', 'solid_waste', 'medium', 13),
  ('illegal_dumping', 'Illegal dumping / debris', 'cleanliness_health', 'Cleanliness & Health', 'Construction debris, dumped waste', 'solid_waste', 'medium', 14),
  ('public_toilet', 'Public toilet issue', 'cleanliness_health', 'Cleanliness & Health', 'Dirty, broken, or locked public toilet', 'public_health', 'medium', 15),
  ('mosquito_breeding', 'Stagnant water / mosquito breeding', 'cleanliness_health', 'Cleanliness & Health', 'Stagnant water in open plots, tyres, containers', 'public_health', 'medium', 16),
  ('dead_animal', 'Dead animal', 'cleanliness_health', 'Cleanliness & Health', 'Carcass on road or in public place', 'public_health', 'high', 17),
  ('stray_animals', 'Stray animals', 'cleanliness_health', 'Cleanliness & Health', 'Stray dogs or cattle causing trouble', 'animal_control', 'low', 18),
  ('fallen_tree', 'Fallen or dangerous tree', 'parks_trees', 'Parks & Trees', 'Fallen tree, hanging branch', 'garden', 'high', 19),
  ('park_maintenance', 'Park / playground damage', 'parks_trees', 'Parks & Trees', 'Broken bench or swing, unmaintained park', 'garden', 'low', 20),
  ('other', 'Other / not sure', 'other', 'Other', 'Anything else', 'general', 'medium', 21)
on conflict (code) do nothing;

