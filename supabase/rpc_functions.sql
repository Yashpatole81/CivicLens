-- ==============================================================================
-- CivicLens: Production-Ready Database RPC Functions (India-Only & Wards Enabled)
-- Enforces: Atomic Reference Generation, Idempotency, Deterministic Routing,
-- Strict Status Machine Transitions, and Audit Trails.
-- ==============================================================================

-- 1. Collision-Free Reference Generator: CL-YYYY-NNNNNN
create or replace function public.next_complaint_reference()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  curr_year integer := extract(year from timezone('utc', now()));
  next_seq bigint;
  formatted_ref text;
begin
  insert into public.reference_counters (year, last_seq)
  values (curr_year, 1)
  on conflict (year) do update
    set last_seq = reference_counters.last_seq + 1
  returning last_seq into next_seq;

  formatted_ref := 'CL-' || curr_year::text || '-' || lpad(next_seq::text, 6, '0');
  return formatted_ref;
end;
$$;

-- 2. Deterministic Routing: Resolves department for city + category
create or replace function public.resolve_department(
  p_city_id uuid,
  p_category_code text
)
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  dept_id uuid;
  cat_dept_key text;
begin
  -- Step 1: Check standard department matching category department_key
  select department_key into cat_dept_key
  from public.categories
  where code = p_category_code;

  select id into dept_id
  from public.departments
  where city_id = p_city_id and department_key = cat_dept_key and is_active = true
  limit 1;

  if dept_id is not null then
    return dept_id;
  end if;

  -- Step 2: Fallback to General Municipal Review department in that city
  select id into dept_id
  from public.departments
  where city_id = p_city_id and is_general_review = true and is_active = true
  limit 1;

  if dept_id is not null then
    return dept_id;
  end if;

  raise exception 'No active department found for city %', p_city_id;
end;
$$;

-- 3. Production RPC: Submit Complaint (Atomic, Idempotent, Auto-routed, Ward-tagged)
create or replace function public.submit_complaint(
  p_idempotency_key text,
  p_title text,
  p_description text,
  p_category text,
  p_ai_suggested_category text,
  p_severity complaint_severity,
  p_ai_suggestion jsonb,
  p_latitude double precision,
  p_longitude double precision,
  p_location_accuracy_m double precision,
  p_address_text text,
  p_locality text,
  p_postal_code text,
  p_photo_path text,
  p_city_id uuid,
  p_ward_id uuid default null,
  p_city_source text default 'gps',
  p_outside_city_limits boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  existing_record record;
  assigned_dept uuid;
  new_reference text;
  new_complaint_id uuid;
begin
  if caller_id is null then
    raise exception 'Unauthorized: User must be signed in to submit a complaint.';
  end if;

  -- Idempotency check: if already submitted, return existing record
  select id, reference, status, created_at into existing_record
  from public.complaints
  where idempotency_key = p_idempotency_key;

  if existing_record.id is not null then
    return jsonb_build_object(
      'id', existing_record.id,
      'reference', existing_record.reference,
      'status', existing_record.status,
      'created_at', existing_record.created_at,
      'idempotent_replay', true
    );
  end if;

  -- Resolve Department
  assigned_dept := public.resolve_department(p_city_id, p_category);

  -- Generate atomic reference
  new_reference := public.next_complaint_reference();

  -- Insert Complaint
  insert into public.complaints (
    reference,
    citizen_id,
    city_id,
    ward_id,
    city_source,
    outside_city_limits,
    title,
    description,
    category,
    ai_suggested_category,
    severity,
    ai_suggestion,
    latitude,
    longitude,
    location_accuracy_m,
    address_text,
    locality,
    postal_code,
    photo_path,
    assigned_department_id,
    status,
    idempotency_key
  ) values (
    new_reference,
    caller_id,
    p_city_id,
    p_ward_id,
    p_city_source,
    p_outside_city_limits,
    p_title,
    p_description,
    p_category,
    p_ai_suggested_category,
    p_severity,
    p_ai_suggestion,
    p_latitude,
    p_longitude,
    p_location_accuracy_m,
    p_address_text,
    p_locality,
    p_postal_code,
    p_photo_path,
    assigned_dept,
    'submitted',
    p_idempotency_key
  )
  returning id into new_complaint_id;

  -- Status history row
  insert into public.complaint_status_history (
    complaint_id,
    previous_status,
    new_status,
    actor_id,
    citizen_visible_update
  ) values (
    new_complaint_id,
    null,
    'submitted',
    caller_id,
    'Complaint registered with municipal corporation.'
  );

  -- Notification for citizen
  insert into public.notifications (
    recipient_id,
    complaint_id,
    type,
    message
  ) values (
    caller_id,
    new_complaint_id,
    'status_change',
    'Your complaint ' || new_reference || ' has been registered.'
  );

  -- Audit log
  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  ) values (
    caller_id,
    'complaint_submitted',
    'complaint',
    new_complaint_id,
    jsonb_build_object(
      'reference', new_reference,
      'severity', p_severity,
      'category', p_category,
      'city_id', p_city_id,
      'ward_id', p_ward_id
    )
  );

  return jsonb_build_object(
    'id', new_complaint_id,
    'reference', new_reference,
    'status', 'submitted',
    'created_at', now(),
    'idempotent_replay', false
  );
end;
$$;

-- 4. Production RPC: Update Complaint Status (State Machine Guarded)
create or replace function public.update_complaint_status(
  p_complaint_id uuid,
  p_new_status complaint_status,
  p_citizen_update text default null,
  p_resolution_notes text default null,
  p_reassign_department_id uuid default null,
  p_reassign_officer_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  caller_role user_role;
  caller_dept uuid;
  comp record;
  is_transition_valid boolean := false;
begin
  if caller_id is null then
    raise exception 'Unauthorized.';
  end if;

  select role, department_id into caller_role, caller_dept
  from public.profiles
  where id = caller_id;

  if caller_role not in ('officer', 'admin') then
    raise exception 'Permission denied: Only officers or admins can update complaint status.';
  end if;

  select * into comp
  from public.complaints
  where id = p_complaint_id
  for update;

  if comp.id is null then
    raise exception 'Complaint not found.';
  end if;

  -- Officers can only modify their department complaints
  if caller_role = 'officer' and comp.assigned_department_id != caller_dept then
    raise exception 'Permission denied: You can only update complaints for your assigned department.';
  end if;

  -- State machine transition rules
  if comp.status = 'submitted' and p_new_status = 'assigned' then
    is_transition_valid := true;
  elsif comp.status = 'assigned' and p_new_status in ('under_review', 'rejected') then
    is_transition_valid := true;
  elsif comp.status = 'under_review' and p_new_status in ('in_progress', 'rejected') then
    is_transition_valid := true;
  elsif comp.status = 'in_progress' and p_new_status = 'resolved' then
    is_transition_valid := true;
  elsif comp.status = 'resolved' and p_new_status = 'closed' then
    is_transition_valid := true;
  elsif caller_role = 'admin' then
    is_transition_valid := true;
  end if;

  if not is_transition_valid then
    raise exception 'Invalid status transition from % to %', comp.status, p_new_status;
  end if;

  if p_new_status = 'resolved' and (p_resolution_notes is null or char_length(trim(p_resolution_notes)) < 5) then
    raise exception 'Resolution notes are required when resolving a complaint (min 5 chars).';
  end if;

  update public.complaints
  set
    status = p_new_status,
    assigned_department_id = coalesce(p_reassign_department_id, assigned_department_id),
    assigned_officer_id = coalesce(p_reassign_officer_id, assigned_officer_id),
    resolution_notes = case when p_new_status = 'resolved' then p_resolution_notes else resolution_notes end,
    resolved_at = case when p_new_status = 'resolved' then now() else resolved_at end,
    updated_at = now()
  where id = p_complaint_id;

  insert into public.complaint_status_history (
    complaint_id,
    previous_status,
    new_status,
    actor_id,
    citizen_visible_update
  ) values (
    p_complaint_id,
    comp.status,
    p_new_status,
    caller_id,
    p_citizen_update
  );

  insert into public.notifications (
    recipient_id,
    complaint_id,
    type,
    message
  ) values (
    comp.citizen_id,
    p_complaint_id,
    'status_change',
    'Complaint ' || comp.reference || ' status changed to ' || replace(p_new_status::text, '_', ' ') || '.'
  );

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  ) values (
    caller_id,
    'status_change',
    'complaint',
    p_complaint_id,
    jsonb_build_object(
      'from_status', comp.status,
      'to_status', p_new_status,
      'citizen_update', p_citizen_update,
      'resolution_notes', p_resolution_notes
    )
  );

  return jsonb_build_object(
    'id', p_complaint_id,
    'status', p_new_status,
    'updated_at', now()
  );
end;
$$;
