-- ==============================================================================
-- CivicLens: Migration to India-Only Architecture with Ward Hierarchy
-- Hierarchy: Ward -> City -> State
-- Removes: countries, states, sla_policies, department_routes
-- ==============================================================================

-- 1. Drop obsolete views and tables
drop view if exists public.complaints_with_sla cascade;
drop table if exists public.department_routes cascade;
drop table if exists public.sla_policies cascade;

-- 2. Modify cities table to store state directly
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='cities' and column_name='state') then
    alter table public.cities add column state text not null default 'Maharashtra';
  end if;
end $$;

-- Drop foreign keys referencing states and countries
alter table public.cities drop constraint if exists cities_state_id_fkey cascade;
alter table public.cities drop constraint if exists cities_country_code_fkey cascade;
alter table public.cities drop column if exists state_id cascade;
alter table public.cities drop column if exists country_code cascade;

-- Drop states and countries tables
drop table if exists public.states cascade;
drop table if exists public.countries cascade;

-- 3. Create Wards table
create table if not exists public.wards (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  ward_number integer not null,
  name text not null,
  office_address text,
  is_active boolean not null default true,
  unique (city_id, ward_number),
  unique (city_id, name)
);

alter table public.wards enable row level security;
create policy "Public read wards" on public.wards for select using (true);

-- 4. Add ward_id to profiles and complaints
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='ward_id') then
    alter table public.profiles add column ward_id uuid references public.wards(id) on delete set null;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='complaints' and column_name='ward_id') then
    alter table public.complaints add column ward_id uuid references public.wards(id) on delete set null;
  end if;
end $$;

create index if not exists idx_complaints_ward on public.complaints (ward_id);

-- 5. Recreate complaints_with_sla view (Calculated directly, no extra table)
create or replace view public.complaints_with_sla
with (security_invoker = true) as
select
  c.*,
  c.created_at + case c.severity
    when 'critical' then interval '24 hours'
    when 'high' then interval '72 hours'
    when 'medium' then interval '168 hours'
    else interval '336 hours'
  end as due_at,
  (
    c.status not in ('resolved', 'closed', 'rejected')
    and now() > (c.created_at + case c.severity
      when 'critical' then interval '24 hours'
      when 'high' then interval '72 hours'
      when 'medium' then interval '168 hours'
      else interval '336 hours'
    end)
  ) as is_overdue
from public.complaints c;

-- 6. Update handle_new_user trigger to include ward_id if provided
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role, city_id, ward_id, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Citizen User'),
    'citizen',
    (new.raw_user_meta_data->>'city_id')::uuid,
    (new.raw_user_meta_data->>'ward_id')::uuid,
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

-- 7. Seed Indian Cities
insert into public.cities (id, name, state, timezone, center_lat, center_lng, radius_km) values
  ('c1111111-1111-1111-1111-111111111101', 'Pune', 'Maharashtra', 'Asia/Kolkata', 18.5204, 73.8567, 30),
  ('c1111111-1111-1111-1111-111111111102', 'Mumbai', 'Maharashtra', 'Asia/Kolkata', 19.0760, 72.8777, 40),
  ('c1111111-1111-1111-1111-111111111103', 'Bengaluru', 'Karnataka', 'Asia/Kolkata', 12.9716, 77.5946, 35),
  ('c1111111-1111-1111-1111-111111111104', 'New Delhi', 'Delhi', 'Asia/Kolkata', 28.6139, 77.2090, 35),
  ('c1111111-1111-1111-1111-111111111105', 'Hyderabad', 'Telangana', 'Asia/Kolkata', 17.3850, 78.4867, 35)
on conflict do nothing;

-- 8. Seed Wards for Pune (PMC Administrative Wards)
insert into public.wards (city_id, ward_number, name) values
  ('c1111111-1111-1111-1111-111111111101', 1, 'Aundh - Baner'),
  ('c1111111-1111-1111-1111-111111111101', 2, 'Shivajinagar - Ghole Road'),
  ('c1111111-1111-1111-1111-111111111101', 3, 'Kothrud - Bavdhan'),
  ('c1111111-1111-1111-1111-111111111101', 4, 'Kasba - Vishrambaug Wada'),
  ('c1111111-1111-1111-1111-111111111101', 5, 'Bhavani Peth'),
  ('c1111111-1111-1111-1111-111111111101', 6, 'Bibvewadi'),
  ('c1111111-1111-1111-1111-111111111101', 7, 'Dhankawadi - Sahakarnagar'),
  ('c1111111-1111-1111-1111-111111111101', 8, 'Hadapsar - Mundhwa'),
  ('c1111111-1111-1111-1111-111111111101', 9, 'Wadgaon Sheri - Kalyani Nagar'),
  ('c1111111-1111-1111-1111-111111111101', 10, 'Yerwada - Dhanori')
on conflict do nothing;

-- 9. Seed Wards for Mumbai (BMC Wards)
insert into public.wards (city_id, ward_number, name) values
  ('c1111111-1111-1111-1111-111111111102', 1, 'Ward A (Colaba, Fort, Nariman Point)'),
  ('c1111111-1111-1111-1111-111111111102', 2, 'Ward D (Malabar Hill, Grant Road)'),
  ('c1111111-1111-1111-1111-111111111102', 3, 'Ward GS (Worli, Lower Parel)'),
  ('c1111111-1111-1111-1111-111111111102', 4, 'Ward HE (Bandra East, Khar)'),
  ('c1111111-1111-1111-1111-111111111102', 5, 'Ward HW (Bandra West, Santacruz)'),
  ('c1111111-1111-1111-1111-111111111102', 6, 'Ward KW (Andheri West, Juhu, Versova)'),
  ('c1111111-1111-1111-1111-111111111102', 7, 'Ward KE (Andheri East, Vile Parle)')
on conflict do nothing;

