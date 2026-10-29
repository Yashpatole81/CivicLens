-- ==============================================================================
-- CivicLens: Clean Seed Data for India Cities, Departments & Real Wards
-- Targets: Pune (PMC), Pimpri-Chinchwad (PCMC), Mumbai (BMC), Bengaluru (BBMP)
-- ==============================================================================

-- 1. Safely remove any legacy / unused tables if they exist
drop table if exists public.department_routes cascade;
drop table if exists public.sla_policies cascade;
drop table if exists public.states cascade;
drop table if exists public.countries cascade;

-- 2. Ensure RLS is enabled on reference_counters (Supabase security advisor fix)
alter table if exists public.reference_counters enable row level security;

-- 3. Ensure necessary unique constraints exist so Postgres never throws 42P10
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'cities_state_name_key') then
    alter table public.cities add constraint cities_state_name_key unique (state, name);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'departments_city_id_department_key_key') then
    alter table public.departments add constraint departments_city_id_department_key_key unique (city_id, department_key);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'wards_city_id_ward_number_key') then
    alter table public.wards add constraint wards_city_id_ward_number_key unique (city_id, ward_number);
  end if;
exception when others then
  -- In case constraints already exist or duplicate rows prevent creation, continue gracefully
  null;
end $$;

-- 4. Upsert the 4 Target Cities (using primary key 'id' so conflict always matches)
insert into public.cities (id, name, state, timezone, center_lat, center_lng, radius_km, is_active) values
  ('c1111111-1111-1111-1111-111111111101', 'Pune', 'Maharashtra', 'Asia/Kolkata', 18.5204, 73.8567, 30.0, true),
  ('c1111111-1111-1111-1111-111111111106', 'Pimpri-Chinchwad (PCMC)', 'Maharashtra', 'Asia/Kolkata', 18.6298, 73.7997, 25.0, true),
  ('c1111111-1111-1111-1111-111111111102', 'Mumbai', 'Maharashtra', 'Asia/Kolkata', 19.0760, 72.8777, 40.0, true),
  ('c1111111-1111-1111-1111-111111111103', 'Bengaluru', 'Karnataka', 'Asia/Kolkata', 12.9716, 77.5946, 35.0, true)
on conflict (id) do update
  set name = excluded.name,
      state = excluded.state,
      timezone = excluded.timezone,
      center_lat = excluded.center_lat,
      center_lng = excluded.center_lng,
      radius_km = excluded.radius_km,
      is_active = true;

-- 5. Standard Departments for each City (Inserts if missing)
insert into public.departments (city_id, department_key, name, description, is_general_review)
select c.id, d.d_key, d.d_name, d.d_description, d.is_gen
from (
  select unnest(array[
    'c1111111-1111-1111-1111-111111111101'::uuid,
    'c1111111-1111-1111-1111-111111111106'::uuid,
    'c1111111-1111-1111-1111-111111111102'::uuid,
    'c1111111-1111-1111-1111-111111111103'::uuid
  ]) as id
) c
cross join (
  values
    ('roads', 'Roads & Engineering', 'Road maintenance, potholes, and infrastructure', false),
    ('traffic', 'Traffic Department', 'Traffic signals, signboards, and safety', false),
    ('public_works', 'Public Works & Encroachment', 'Footpaths, encroachments, and walkways', false),
    ('drainage', 'Drainage & Sewerage', 'Sewage networks, open manholes, and stormwater drains', false),
    ('water_supply', 'Water Supply Department', 'Clean water supply, pipe bursts, and connections', false),
    ('electrical', 'Street Lighting & Electrical', 'Streetlights, hanging wires, and power transformers', false),
    ('solid_waste', 'Solid Waste Management', 'Garbage collection, overflowing bins, and debris', false),
    ('public_health', 'Public Health & Sanitation', 'Public toilets, mosquito control, and disease prevention', false),
    ('animal_control', 'Animal Control', 'Stray animals and carcass removal', false),
    ('garden', 'Garden & Tree Department', 'Park maintenance, fallen trees, and greenery', false),
    ('general', 'General Municipal Review', 'Default triage department for unclassified issues', true)
) as d(d_key, d_name, d_description, is_gen)
where not exists (
  select 1 from public.departments existing
  where existing.city_id = c.id and existing.department_key = d.d_key
);

-- 6. Clean and re-seed Wards (Direct deletion & clean insertion, NO conflict errors possible)
delete from public.wards where city_id in (
  'c1111111-1111-1111-1111-111111111101',
  'c1111111-1111-1111-1111-111111111106',
  'c1111111-1111-1111-1111-111111111102',
  'c1111111-1111-1111-1111-111111111103'
);

-- PUNE (PMC: 15 Official Administrative Kshetriya Karyalayas / Ward Offices)
insert into public.wards (city_id, ward_number, name, office_address) values
  ('c1111111-1111-1111-1111-111111111101', 1, 'Aundh - Baner', 'Aundh Ward Office, Near Ambedkar Chowk, Aundh, Pune'),
  ('c1111111-1111-1111-1111-111111111101', 2, 'Shivajinagar - Ghole Road', 'Ghole Road Ward Office, Near Modern College, Pune'),
  ('c1111111-1111-1111-1111-111111111101', 3, 'Kothrud - Bavdhan', 'Kothrud Ward Office, Near Ashish Garden, DP Road, Pune'),
  ('c1111111-1111-1111-1111-111111111101', 4, 'Warje - Karvenagar', 'Warje Ward Office, Near Mai Mangeshkar Hospital, Pune'),
  ('c1111111-1111-1111-1111-111111111101', 5, 'Dhole Patil Road', 'Dhole Patil Road Ward Office, Near General Post Office, Pune'),
  ('c1111111-1111-1111-1111-111111111101', 6, 'Yerwada - Kalas - Dhanori', 'Yerwada Ward Office, Nagar Road, Yerwada, Pune'),
  ('c1111111-1111-1111-1111-111111111101', 7, 'Nagar Road - Vadgaon Sheri', 'Vadgaon Sheri Ward Office, Near Somnath Nagar, Pune'),
  ('c1111111-1111-1111-1111-111111111101', 8, 'Bhavani Peth', 'Bhavani Peth Ward Office, General Arunkumar Vaidya Stadium, Pune'),
  ('c1111111-1111-1111-1111-111111111101', 9, 'Kasba - Vishrambaug Wada', 'Vishrambaug Wada Ward Office, Sadashiv Peth, Pune'),
  ('c1111111-1111-1111-1111-111111111101', 10, 'Sinhagad Road (Tilak Road)', 'Sinhagad Road Ward Office, Dandekar Bridge, Pune'),
  ('c1111111-1111-1111-1111-111111111101', 11, 'Bibwewadi', 'Bibwewadi Ward Office, Utsav Hall, Pune'),
  ('c1111111-1111-1111-1111-111111111101', 12, 'Dhankawadi - Sahakarnagar', 'Dhankawadi Ward Office, Near Katraj Lake, Pune'),
  ('c1111111-1111-1111-1111-111111111101', 13, 'Hadapsar - Mundhwa', 'Hadapsar Ward Office, Gadital, Pune'),
  ('c1111111-1111-1111-1111-111111111101', 14, 'Wanowrie - Ramtekdi', 'Wanowrie Ward Office, Near Kedari Petrol Pump, Pune'),
  ('c1111111-1111-1111-1111-111111111101', 15, 'Kondhwa - Yewalewadi', 'Kondhwa Ward Office, Near Jyoti Chowk, Kondhwa, Pune');

-- PIMPRI-CHINCHWAD (PCMC: 8 Administrative Zones A to H)
insert into public.wards (city_id, ward_number, name, office_address) values
  ('c1111111-1111-1111-1111-111111111106', 1, 'Ward A (Nigdi, Pradhikaran, Akurdi)', 'Zone A Office, Tilak Chowk, Nigdi, PCMC'),
  ('c1111111-1111-1111-1111-111111111106', 2, 'Ward B (Chinchwad, Thergaon, Keshavnagar)', 'Zone B Office, Chaphekar Chowk, Chinchwad, PCMC'),
  ('c1111111-1111-1111-1111-111111111106', 3, 'Ward C (Bhosari, Indrayaninagar, Dighi)', 'Zone C Office, Gavli Matha, Bhosari, PCMC'),
  ('c1111111-1111-1111-1111-111111111106', 4, 'Ward D (Wakad, Pimple Saudagar, Punawale, Tathawade)', 'Zone D Office, Rahatani, PCMC'),
  ('c1111111-1111-1111-1111-111111111106', 5, 'Ward E (Moshi, Chikhali, Charholi, Dudulgaon)', 'Zone E Office, Moshi Toll Naka, PCMC'),
  ('c1111111-1111-1111-1111-111111111106', 6, 'Ward F (Yamunanagar, Rupeenagar, Talawade IT Park)', 'Zone F Office, Rupeenagar, PCMC'),
  ('c1111111-1111-1111-1111-111111111106', 7, 'Ward G (Pimpri, Nehrunagar, Kharalwadi, Morwadi)', 'Zone G Office, Deluxe Chowk, Pimpri, PCMC'),
  ('c1111111-1111-1111-1111-111111111106', 8, 'Ward H (Sangvi, Dapodi, Pimple Gurav, Kasarwadi)', 'Zone H Office, Old Sangvi, PCMC');

-- MUMBAI (BMC / MCGM: All 24 Official Administrative Wards A to T)
insert into public.wards (city_id, ward_number, name, office_address) values
  ('c1111111-1111-1111-1111-111111111102', 1, 'Ward A (Colaba, Fort, Nariman Point, Churchgate)', '134 E, SBS Road, Fort, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 2, 'Ward B (Sandhurst Road, Dongri, Masjid Bunder)', '121, Ramchandra Bhatt Marg, Babula Tank, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 3, 'Ward C (Marine Lines, Charni Road, Bhuleshwar)', '76, Shrikant Palekar Marg, Chandanwadi, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 4, 'Ward D (Malabar Hill, Grant Road, Walkeshwar)', 'Jobanputra Compound, Nana Chowk, Grant Road, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 5, 'Ward E (Byculla, Mazgaon, Mumbai Central)', '10, Shaikh Hafizuddin Marg, Byculla West, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 6, 'Ward F/North (Matunga, Sion, Wadala)', 'Plot 96, Bhau Daji Road, Matunga, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 7, 'Ward F/South (Parel, Sewri, Naigaon)', 'Jagatguru Sant Tukaram Maharaj Marg, Parel, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 8, 'Ward G/North (Dharavi, Dadar, Mahim)', 'Harishchandra Yelve Marg, Dadar West, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 9, 'Ward G/South (Worli, Lower Parel, Prabhadevi)', 'N.M. Joshi Marg, Elphinstone West, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 10, 'Ward H/East (Bandra East, Khar East, Santacruz East)', 'TPS 5, Prabhat Colony, Santacruz East, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 11, 'Ward H/West (Bandra West, Khar West, Santacruz West)', 'Saint Martin Road, Bandra West, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 12, 'Ward K/East (Andheri East, Jogeshwari East, Vile Parle East)', 'Gundavali, Azad Road, Andheri East, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 13, 'Ward K/West (Andheri West, Juhu, Versova, Vile Parle West)', 'Paliram Path, Near Andheri Station, Andheri West, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 14, 'Ward L (Kurla, Sakinaka, Chandivali, Chunabhatti)', 'LBS Marg, Near Kurla Bus Depot, Kurla West, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 15, 'Ward M/East (Govandi, Mankhurd, Shivaji Nagar)', 'Deonar Colony, Govandi, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 16, 'Ward M/West (Chembur, Tilak Nagar, Mahul)', 'Sharadbhau Acharya Marg, Chembur, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 17, 'Ward N (Ghatkopar, Vidyavihar, Pant Nagar)', 'Jawahar Road, Ghatkopar East, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 18, 'Ward P/North (Malad, Marve, Manori, Madh)', 'Liberty Garden, Malad West, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 19, 'Ward P/South (Goregaon West, Goregaon East)', 'S.V. Road, Near Goregaon Flyover, Goregaon West, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 20, 'Ward R/Central (Borivali, Gorai, Eksar)', 'Chandavarkar Road, Borivali West, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 21, 'Ward R/North (Dahisar, Mandapeshwar)', 'Rangnath Keskar Marg, Dahisar West, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 22, 'Ward R/South (Kandivali, Charkop, Poisar)', 'M.G. Cross Road 2, Kandivali West, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 23, 'Ward S (Bhandup, Powai, Kanjurmarg, Vikhroli)', 'LBS Marg, Near Mangatram Petrol Pump, Bhandup West, Mumbai'),
  ('c1111111-1111-1111-1111-111111111102', 24, 'Ward T (Mulund, Nahur)', 'Lala Devidayal Marg, Mulund West, Mumbai');

-- BENGALURU (BBMP: 8 Official Zones & Key Administrative Clusters)
insert into public.wards (city_id, ward_number, name, office_address) values
  ('c1111111-1111-1111-1111-111111111103', 1, 'East Zone: Shivajinagar, Bharathinagar, Halasuru', 'BBMP East Zone Office, Mayo Hall, Bengaluru'),
  ('c1111111-1111-1111-1111-111111111103', 2, 'East Zone: Pulakeshinagar, Frazer Town, Cox Town', 'BBMP Office, Davis Road, Bengaluru'),
  ('c1111111-1111-1111-1111-111111111103', 3, 'West Zone: Malleshwaram, Vyalikaval, Sadashivanagar', 'BBMP West Office, Malleshwaram, Bengaluru'),
  ('c1111111-1111-1111-1111-111111111103', 4, 'West Zone: Rajajinagar, Basaveshwaranagar', 'BBMP Office, Rajajinagar 2nd Block, Bengaluru'),
  ('c1111111-1111-1111-1111-111111111103', 5, 'South Zone: Jayanagar, JP Nagar, Basavanagudi', 'BBMP South Office, 9th Cross, Jayanagar 2nd Block, Bengaluru'),
  ('c1111111-1111-1111-1111-111111111103', 6, 'South Zone: BTM Layout, Padmanabhanagar, Banashankari', 'BBMP Office, BTM 2nd Stage, Bengaluru'),
  ('c1111111-1111-1111-1111-111111111103', 7, 'Mahadevapura Zone: Whitefield, Varthur, Bellandur, Marathahalli', 'BBMP Mahadevapura Office, RHB Colony, Bengaluru'),
  ('c1111111-1111-1111-1111-111111111103', 8, 'Mahadevapura Zone: Hoodi, KR Puram, Kadugodi', 'BBMP Office, Devasandra Main Road, Bengaluru'),
  ('c1111111-1111-1111-1111-111111111103', 9, 'Bommanahalli Zone: Koramangala, HSR Layout, Bommanahalli', 'BBMP Bommanahalli Office, Begur Main Road, Bengaluru'),
  ('c1111111-1111-1111-1111-111111111103', 10, 'Bommanahalli Zone: Begur, Bilekahalli, Arakere', 'BBMP Office, Bannerghatta Road, Bengaluru'),
  ('c1111111-1111-1111-1111-111111111103', 11, 'Yelahanka Zone: Yelahanka New Town, Byatarayanapura', 'BBMP Yelahanka Office, Byatarayanapura, Bengaluru'),
  ('c1111111-1111-1111-1111-111111111103', 12, 'Yelahanka Zone: Hebbal, Vidyaranyapura, Thanisandra', 'BBMP Office, Hebbal Kempapura, Bengaluru'),
  ('c1111111-1111-1111-1111-111111111103', 13, 'Rajarajeshwari Nagar Zone: RR Nagar, Kengeri, Nayandahalli', 'BBMP RR Nagar Office, Ideal Homes Twp, Bengaluru'),
  ('c1111111-1111-1111-1111-111111111103', 14, 'Dasarahalli Zone: Peenya Industrial Area, T Dasarahalli, Chokkasandra', 'BBMP Dasarahalli Office, MEI Colony, Bengaluru');
