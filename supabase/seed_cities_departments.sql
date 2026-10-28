-- ==============================================================================
-- CivicLens: Seed States, Cities & Standard Departments
-- ==============================================================================

-- 1. States Seed
insert into public.states (id, country_code, name, type) values
  ('d1111111-1111-1111-1111-111111111101', 'IN', 'Maharashtra', 'state'),
  ('d1111111-1111-1111-1111-111111111102', 'IN', 'Karnataka', 'state'),
  ('d1111111-1111-1111-1111-111111111103', 'IN', 'Delhi', 'union_territory'),
  ('d1111111-1111-1111-1111-111111111104', 'IN', 'Tamil Nadu', 'state'),
  ('d1111111-1111-1111-1111-111111111105', 'IN', 'Telangana', 'state'),
  ('d1111111-1111-1111-1111-111111111106', 'IN', 'Gujarat', 'state'),
  ('d1111111-1111-1111-1111-111111111107', 'SE', 'Stockholm County', 'region')
on conflict (country_code, name) do nothing;

-- 2. Cities Seed (Pune, Mumbai, Bengaluru, Delhi, Hyderabad)
insert into public.cities (id, country_code, state_id, name, timezone, center_lat, center_lng, radius_km) values
  ('c1111111-1111-1111-1111-111111111101', 'IN', 'd1111111-1111-1111-1111-111111111101', 'Pune', 'Asia/Kolkata', 18.5204, 73.8567, 30),
  ('c1111111-1111-1111-1111-111111111102', 'IN', 'd1111111-1111-1111-1111-111111111101', 'Mumbai', 'Asia/Kolkata', 19.0760, 72.8777, 40),
  ('c1111111-1111-1111-1111-111111111103', 'IN', 'd1111111-1111-1111-1111-111111111102', 'Bengaluru', 'Asia/Kolkata', 12.9716, 77.5946, 35),
  ('c1111111-1111-1111-1111-111111111104', 'IN', 'd1111111-1111-1111-1111-111111111103', 'New Delhi', 'Asia/Kolkata', 28.6139, 77.2090, 35),
  ('c1111111-1111-1111-1111-111111111105', 'IN', 'd1111111-1111-1111-1111-111111111105', 'Hyderabad', 'Asia/Kolkata', 17.3850, 78.4867, 35)
on conflict (state_id, name) do nothing;

-- 3. Standard Departments Generator for all active cities
create or replace function public.seed_city_departments(target_city_id uuid)
returns void language plpgsql as $$
begin
  insert into public.departments (city_id, department_key, name, description, is_general_review) values
    (target_city_id, 'roads', 'Roads & Engineering', 'Road maintenance, potholes, and infrastructure', false),
    (target_city_id, 'traffic', 'Traffic Department', 'Traffic signals, signboards, and safety', false),
    (target_city_id, 'public_works', 'Public Works & Encroachment', 'Footpaths, encroachments, and walkways', false),
    (target_city_id, 'drainage', 'Drainage & Sewerage', 'Sewage networks, open manholes, and stormwater drains', false),
    (target_city_id, 'water_supply', 'Water Supply Department', 'Clean water supply, pipe bursts, and connections', false),
    (target_city_id, 'electrical', 'Street Lighting & Electrical', 'Streetlights, hanging wires, and power transformers', false),
    (target_city_id, 'solid_waste', 'Solid Waste Management', 'Garbage collection, overflowing bins, and debris', false),
    (target_city_id, 'public_health', 'Public Health & Sanitation', 'Public toilets, mosquito control, and disease prevention', false),
    (target_city_id, 'animal_control', 'Animal Control', 'Stray animals and carcass removal', false),
    (target_city_id, 'garden', 'Garden & Tree Department', 'Park maintenance, fallen trees, and greenery', false),
    (target_city_id, 'general', 'General Municipal Review', 'Default triage department for unclassified issues', true)
  on conflict (city_id, department_key) do nothing;
end;
$$;

-- Run for all seeded cities
do $$
declare
  r record;
begin
  for r in select id from public.cities loop
    perform public.seed_city_departments(r.id);
  end loop;
end $$;

