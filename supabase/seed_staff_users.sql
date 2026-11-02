-- ==============================================================================
-- CivicLens: Seed Real Municipal Staff in Supabase Auth & Profiles
-- Creates real authenticated accounts for Admin & Departmental Officers.
-- Password for all accounts: staff
-- ==============================================================================

create extension if not exists pgcrypto with schema extensions;

do $$
declare
  pune_city_id uuid;
  roads_dept_id uuid;
  drainage_dept_id uuid;
  lighting_dept_id uuid;
  waste_dept_id uuid;
  
  -- Staff UUIDs
  uid_admin uuid := 'a1111111-1111-1111-1111-111111111101';
  uid_rohan uuid := 'a1111111-1111-1111-1111-111111111102';
  uid_sneha uuid := 'a1111111-1111-1111-1111-111111111103';
  uid_imran uuid := 'a1111111-1111-1111-1111-111111111104';
  uid_kavya uuid := 'a1111111-1111-1111-1111-111111111105';
begin
  -- Resolve City
  select id into pune_city_id from public.cities where lower(name) = 'pune' limit 1;

  -- Resolve Departments
  select id into roads_dept_id from public.departments where department_key = 'roads_engineering' and city_id = pune_city_id limit 1;
  select id into drainage_dept_id from public.departments where department_key = 'drainage_sewerage' and city_id = pune_city_id limit 1;
  select id into lighting_dept_id from public.departments where department_key = 'street_lighting' and city_id = pune_city_id limit 1;
  select id into waste_dept_id from public.departments where department_key = 'solid_waste' and city_id = pune_city_id limit 1;

  -- 1. MEERA DESHPANDE (ADMIN)
  if not exists (select 1 from auth.users where email = 'meera.d@example.com') then
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values ('00000000-0000-0000-0000-000000000000', uid_admin, 'authenticated', 'authenticated', 'meera.d@example.com', extensions.crypt('staff', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Meera Deshpande","role":"admin"}', now(), now());
  else
    select id into uid_admin from auth.users where email = 'meera.d@example.com';
    update auth.users set encrypted_password = extensions.crypt('staff', extensions.gen_salt('bf')), email_confirmed_at = coalesce(email_confirmed_at, now()) where id = uid_admin;
  end if;
  insert into public.profiles (id, full_name, role, city_id, phone)
  values (uid_admin, 'Meera Deshpande', 'admin', pune_city_id, '+91 98230 11223')
  on conflict (id) do update set role = 'admin', full_name = 'Meera Deshpande';

  -- 2. ROHAN PATIL (OFFICER: ROADS)
  if not exists (select 1 from auth.users where email = 'rohan.p@example.com') then
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values ('00000000-0000-0000-0000-000000000000', uid_rohan, 'authenticated', 'authenticated', 'rohan.p@example.com', extensions.crypt('staff', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rohan Patil","role":"officer"}', now(), now());
  else
    select id into uid_rohan from auth.users where email = 'rohan.p@example.com';
    update auth.users set encrypted_password = extensions.crypt('staff', extensions.gen_salt('bf')), email_confirmed_at = coalesce(email_confirmed_at, now()) where id = uid_rohan;
  end if;
  insert into public.profiles (id, full_name, role, department_id, city_id, phone)
  values (uid_rohan, 'Rohan Patil', 'officer', roads_dept_id, pune_city_id, '+91 98230 11224')
  on conflict (id) do update set role = 'officer', full_name = 'Rohan Patil', department_id = roads_dept_id;

  -- 3. SNEHA JOSHI (OFFICER: DRAINAGE)
  if not exists (select 1 from auth.users where email = 'sneha.j@example.com') then
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values ('00000000-0000-0000-0000-000000000000', uid_sneha, 'authenticated', 'authenticated', 'sneha.j@example.com', extensions.crypt('staff', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sneha Joshi","role":"officer"}', now(), now());
  else
    select id into uid_sneha from auth.users where email = 'sneha.j@example.com';
    update auth.users set encrypted_password = extensions.crypt('staff', extensions.gen_salt('bf')), email_confirmed_at = coalesce(email_confirmed_at, now()) where id = uid_sneha;
  end if;
  insert into public.profiles (id, full_name, role, department_id, city_id, phone)
  values (uid_sneha, 'Sneha Joshi', 'officer', drainage_dept_id, pune_city_id, '+91 98230 11225')
  on conflict (id) do update set role = 'officer', full_name = 'Sneha Joshi', department_id = drainage_dept_id;

  -- 4. IMRAN SHAIKH (OFFICER: ELECTRICAL)
  if not exists (select 1 from auth.users where email = 'imran.s@example.com') then
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values ('00000000-0000-0000-0000-000000000000', uid_imran, 'authenticated', 'authenticated', 'imran.s@example.com', extensions.crypt('staff', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Imran Shaikh","role":"officer"}', now(), now());
  else
    select id into uid_imran from auth.users where email = 'imran.s@example.com';
    update auth.users set encrypted_password = extensions.crypt('staff', extensions.gen_salt('bf')), email_confirmed_at = coalesce(email_confirmed_at, now()) where id = uid_imran;
  end if;
  insert into public.profiles (id, full_name, role, department_id, city_id, phone)
  values (uid_imran, 'Imran Shaikh', 'officer', lighting_dept_id, pune_city_id, '+91 98230 11226')
  on conflict (id) do update set role = 'officer', full_name = 'Imran Shaikh', department_id = lighting_dept_id;

  -- 5. KAVYA NAIR (OFFICER: SOLID WASTE)
  if not exists (select 1 from auth.users where email = 'kavya.n@example.com') then
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values ('00000000-0000-0000-0000-000000000000', uid_kavya, 'authenticated', 'authenticated', 'kavya.n@example.com', extensions.crypt('staff', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kavya Nair","role":"officer"}', now(), now());
  else
    select id into uid_kavya from auth.users where email = 'kavya.n@example.com';
    update auth.users set encrypted_password = extensions.crypt('staff', extensions.gen_salt('bf')), email_confirmed_at = coalesce(email_confirmed_at, now()) where id = uid_kavya;
  end if;
  insert into public.profiles (id, full_name, role, department_id, city_id, phone)
  values (uid_kavya, 'Kavya Nair', 'officer', waste_dept_id, pune_city_id, '+91 98230 11227')
  on conflict (id) do update set role = 'officer', full_name = 'Kavya Nair', department_id = waste_dept_id;
end $$;

