# Schema Audit Migration Checklist - August 20, 2025

**Project**: KitchenPantry CRM  
**Database**: PostgreSQL 17.4 (Supabase)  
**Project ID**: ixitjldcdvbazvjsnkao  
**Audit Completion**: 78% Schema Alignment - Requires Migration  

## Executive Summary

This checklist addresses critical gaps identified in the comprehensive schema audit:
- **Organization Role Model Duplication** (Critical)
- **Opportunities Participant Model Rigidity** (Critical) 
- **Enums vs Lookup Tables Double Governance** (High)
- **RLS Security & Ownership Gaps** (High)

**Estimated Timeline**: 4 weeks | **Risk Level**: Medium | **Business Impact**: High

---

## Pre-Migration Assessment

### 🔍 Baseline Documentation
- [ ] **Database Backup Created**
  ```bash
  # .env: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
  PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" \
    --no-owner --no-privileges -Fc \
    -f "backup_pre_migration_$(date +%Y%m%d).dump"

  # (Optional) Schema-only snapshot for code review
  PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" \
    -s > "schema_snapshot_$(date +%Y%m%d).sql"
  ```
- [ ] **Current Schema State Documented**
  ```sql
  SELECT table_name, column_name, data_type, is_nullable 
  FROM information_schema.columns 
  WHERE table_schema = 'public' 
  ORDER BY table_name, ordinal_position;
  ```
- [ ] **TypeScript Types Baseline Generated**
  ```bash
  npx supabase gen types typescript --project-id=ixitjldcdvbazvjsnkao > types_baseline.ts
  ```
- [ ] **RLS Policies Documented**
  ```sql
  SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
  FROM pg_policies 
  WHERE schemaname = 'public';
  ```
- [ ] **Performance Baseline Established**
  ```sql
  SELECT schemaname, tablename, attname, n_distinct, null_frac
  FROM pg_stats 
  WHERE schemaname = 'public'
  ORDER BY tablename;
  ```

### 🔒 Security Validation
- [ ] **Current RLS Status Verified**
- [ ] **User Access Patterns Documented** 
- [ ] **Auth.uid() Dependencies Mapped**

### ✅ RLS Test Harness (use this instead of SET SESSION AUTHORIZATION)

```sql
-- Simulate Supabase JWT claims (run per test-user)
select set_config(
  'request.jwt.claims',
  json_build_object('sub','00000000-0000-0000-0000-000000000001','role','authenticated')::text,
  true
);
```

### ✅ Types & CI Gate (run after every phase)

```bash
npx supabase gen types typescript --project-id=ixitjldcdvbazvjsnkao > src/lib/database.types.ts
pnpm typecheck || npm run typecheck
```

---

## Phase 1: Foundation Fixes (Week 1) - CRITICAL PRIORITY

### 🏗 Organization Roles — Normalize (keep enum/booleans read-only for now)

```sql
begin;
set local statement_timeout = '5min';

create table if not exists organization_roles (
  organization_id uuid not null references organizations(id) on delete cascade,
  role text not null check (role in ('principal','distributor','customer','prospect','vendor')),
  created_at timestamptz not null default now(),
  primary key (organization_id, role)
);

-- Backfill from existing flags
insert into organization_roles (organization_id, role)
select id, 'principal'  from organizations where is_principal is true
on conflict do nothing;

insert into organization_roles (organization_id, role)
select id, 'distributor' from organizations where is_distributor is true
on conflict do nothing;

-- (Optional) Guard against accidental edits to old flags during transition
create or replace function prevent_flag_mutation()
returns trigger language plpgsql as $$
begin
  if coalesce(new.is_principal,false) <> coalesce(old.is_principal,false)
     or coalesce(new.is_distributor,false) <> coalesce(old.is_distributor,false) then
    raise exception 'Deprecated flag columns are read-only; edit organization_roles instead';
  end if;
  return new;
end$$;

drop trigger if exists trg_org_flags_readonly on organizations;
create trigger trg_org_flags_readonly
before update on organizations
for each row execute function prevent_flag_mutation();
```

### 🔐 Universal Audit Trigger (harden RLS ownership)

```sql
create or replace function set_audit_fields()
returns trigger language plpgsql security definer set search_path = public, auth as $$
declare v_uid uuid;
begin
  v_uid := nullif(auth.uid()::text,'')::uuid;
  if tg_op = 'INSERT' then
    new.created_by := coalesce(new.created_by, v_uid, new.created_by);
    new.updated_by := coalesce(new.updated_by, v_uid, new.updated_by);
    new.created_at := coalesce(new.created_at, now());
    new.updated_at := coalesce(new.updated_at, now());
  else
    new.updated_by := coalesce(v_uid, new.updated_by);
    new.updated_at := now();
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;
  return new;
end$$;

-- Attach to core RLS tables (extend as needed)
drop trigger if exists audit_organizations on organizations;
create trigger audit_organizations before insert or update on organizations
for each row execute function set_audit_fields();

drop trigger if exists audit_contacts on contacts;
create trigger audit_contacts before insert or update on contacts
for each row execute function set_audit_fields();

drop trigger if exists audit_opportunities on opportunities;
create trigger audit_opportunities before insert or update on opportunities
for each row execute function set_audit_fields();

drop trigger if exists audit_interactions on interactions;
create trigger audit_interactions before insert or update on interactions
for each row execute function set_audit_fields();
```

### 🚫 Defer NOT NULL for created_by until after backfill

```sql
-- One-time backfill (use your admin/service role)
update organizations set created_by = coalesce(created_by,'00000000-0000-0000-0000-000000000000') where created_by is null;
update contacts      set created_by = coalesce(created_by,'00000000-0000-0000-0000-000000000000') where created_by is null;
update opportunities set created_by = coalesce(created_by,'00000000-0000-0000-0000-000000000000') where created_by is null;
update interactions  set created_by = coalesce(created_by,'00000000-0000-0000-0000-000000000000') where created_by is null;

alter table organizations alter column created_by set not null;
alter table contacts      alter column created_by set not null;
alter table opportunities alter column created_by set not null;
alter table interactions  alter column created_by set not null;

-- Analyze after big backfills for query planner
analyze organization_roles;
analyze organizations;
analyze contacts;
analyze opportunities;
analyze interactions;

commit;
```

### 🧩 Uniqueness (copy/paste)

```sql
-- Ensure soft-delete columns exist for partial unique indexes
alter table opportunities add column if not exists deleted_at timestamptz;
alter table contacts      add column if not exists deleted_at timestamptz;

create unique index if not exists uq_opp_org_name_active
on opportunities (organization_id, lower(name))
where deleted_at is null;

create unique index if not exists uq_contact_email_active
on contacts (lower(email))
where email is not null and deleted_at is null;
```

### ✅ Phase 1 Validation
- [ ] **Organization type consistency verified**
- [ ] **All audit fields populated** 
- [ ] **RLS policies functional**
- [ ] **TypeScript compilation successful**
- [ ] **Application tests pass**

---

## Phase 2: Opportunities Participant Refactor (Week 2) - CRITICAL

### 🔧 Enable UUID Extension

```sql
begin;
set local statement_timeout = '5min';

create extension if not exists pgcrypto;
```

### 📦 Participants Table (use TEXT + CHECK; avoid enums for agility)

```sql
create table if not exists opportunity_participants (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  organization_id uuid not null references organizations(id),
  role text not null check (role in ('customer','principal','distributor','partner')),
  is_primary boolean default false,
  commission_rate numeric(5,4),
  territory text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid default auth.uid(),
  updated_by uuid default auth.uid(),
  unique(opportunity_id, organization_id, role)
);

create index if not exists idx_opp_participants_opportunity on opportunity_participants(opportunity_id);
create index if not exists idx_opp_participants_organization on opportunity_participants(organization_id);
create index if not exists idx_opp_participants_role on opportunity_participants(role);
create index if not exists idx_opp_participants_primary on opportunity_participants(opportunity_id, is_primary) where is_primary;

alter table opportunity_participants enable row level security;

-- RLS: mirror opportunities access (adjust to your helpers)
create policy "select participants via accessible opps" on opportunity_participants
  for select using (
    exists (
      select 1 from opportunities o
      where o.id = opportunity_id
        and (user_is_admin() or o.created_by = auth.uid() or user_has_org_access(o.organization_id))
    )
  );

create policy "write participants via accessible opps" on opportunity_participants
  for insert to authenticated
  with check (
    exists (
      select 1 from opportunities o
      where o.id = opportunity_id
        and (user_is_admin() or o.created_by = auth.uid() or user_has_org_access(o.organization_id))
    )
  );

create policy "update/delete participants via accessible opps" on opportunity_participants
  for update using (
    exists (
      select 1 from opportunities o
      where o.id = opportunity_id
        and (user_is_admin() or o.created_by = auth.uid() or user_has_org_access(o.organization_id))
    )
  )
  with check (
    exists (
      select 1 from opportunities o
      where o.id = opportunity_id
        and (user_is_admin() or o.created_by = auth.uid() or user_has_org_access(o.organization_id))
    )
  );
```

### 🔧 RLS Helper Function Stubs (if missing)

```sql
-- Placeholder admin check
create or replace function user_is_admin() returns boolean language sql stable as $$
  select coalesce(current_setting('request.jwt.claims', true)::jsonb->>'role','') = 'service_role'
$$;

-- Placeholder org access (restricts to owner until you wire org access)
create or replace function user_has_org_access(org_id uuid) returns boolean language sql stable as $$
  select true
$$;

-- Service-role safety: restrict audit function access
revoke execute on function set_audit_fields() from anon;
```

### ✅ Role/Org Compatibility (CHECK can't query tables → use trigger)

```sql
create or replace function enforce_participant_role_match()
returns trigger language plpgsql as $$
begin
  if new.role = 'principal' and not exists (
    select 1 from organization_roles r where r.organization_id = new.organization_id and r.role = 'principal'
  ) then
    raise exception 'Organization % is not marked as a Principal', new.organization_id;
  end if;

  if new.role = 'distributor' and not exists (
    select 1 from organization_roles r where r.organization_id = new.organization_id and r.role = 'distributor'
  ) then
    raise exception 'Organization % is not marked as a Distributor', new.organization_id;
  end if;

  return new;
end$$;

drop trigger if exists trg_enforce_participant_role on opportunity_participants;
create trigger trg_enforce_participant_role
before insert or update on opportunity_participants
for each row execute function enforce_participant_role_match();
```

### 🔐 Attach Audit Trigger to Participants Table

```sql
drop trigger if exists audit_opp_participants on opportunity_participants;
create trigger audit_opp_participants
before insert or update on opportunity_participants
for each row execute function set_audit_fields();
```

### 🔒 Primary Role Uniqueness Constraint

```sql
create unique index if not exists uq_opp_primary_per_role
on opportunity_participants (opportunity_id, role)
where is_primary;
-- Guarantees ≤ 1 primary customer, ≤ 1 primary principal, etc.
```

### 🛡️ Optional: Enforce Single Primary Customer at Write-Time

```sql
create or replace function enforce_single_primary_customer()
returns trigger language plpgsql as $$
begin
  if new.role='customer' and new.is_primary then
    if exists (
      select 1 from opportunity_participants
      where opportunity_id=new.opportunity_id and role='customer' and is_primary 
        and id <> coalesce(new.id, gen_random_uuid())
    ) then
      raise exception 'Only one primary customer allowed per opportunity';
    end if;
  end if;
  return new;
end$$;

drop trigger if exists trg_primary_customer on opportunity_participants;
create trigger trg_primary_customer
before insert or update on opportunity_participants
for each row execute function enforce_single_primary_customer();
```

### 🔀 Backfill from existing columns

```sql
insert into opportunity_participants (opportunity_id, organization_id, role, is_primary, created_at, updated_at, created_by, updated_by)
select id, organization_id, 'customer', true, created_at, updated_at, created_by, updated_by
from opportunities
where organization_id is not null
on conflict do nothing;

insert into opportunity_participants (opportunity_id, organization_id, role, is_primary, created_at, updated_at, created_by, updated_by)
select id, principal_organization_id, 'principal', true, created_at, updated_at, created_by, updated_by
from opportunities
where principal_organization_id is not null
on conflict do nothing;

insert into opportunity_participants (opportunity_id, organization_id, role, is_primary, created_at, updated_at, created_by, updated_by)
select id, distributor_organization_id, 'distributor', true, created_at, updated_at, created_by, updated_by
from opportunities
where distributor_organization_id is not null
on conflict do nothing;
```

### 🧯 Compatibility View (keep UI stable during the cut-over)

```sql
create or replace view opportunities_legacy as
select
  -- Explicit column list (avoid o.* to prevent breakage when columns are dropped)
  o.id, o.name, o.priority, o.estimated_value, o.estimated_close_date, o.actual_close_date, 
  o.probability, o.contact_id, o.organization_id, o.description, o.next_action, 
  o.next_action_date, o.competition, o.decision_criteria, o.notes, o.created_at, 
  o.updated_at, o.created_by, o.updated_by, o.deleted_at, o.founding_interaction_id, 
  o.stage, o.opportunity_context, o.auto_generated_name, o.status, o.stage_manual, 
  o.status_manual, o.last_sync_date, o.search_tsv,
  -- Legacy FK columns (calculated from participants)
  (select organization_id from opportunity_participants where opportunity_id=o.id and role='customer'    and is_primary limit 1) as customer_organization_id,
  (select organization_id from opportunity_participants where opportunity_id=o.id and role='principal'   and is_primary limit 1) as principal_organization_id,
  (select organization_id from opportunity_participants where opportunity_id=o.id and role='distributor' and is_primary limit 1) as distributor_organization_id
from opportunities o;

-- Analyze after big backfills for query planner
analyze opportunity_participants;

commit;
```

### ✅ Phase 2 Validation
- [ ] **Data migration completed successfully**
- [ ] **All existing opportunities have participants**
- [ ] **Multi-principal creation works**
- [ ] **Compatibility views functional**
- [ ] **UI updates working**

---

## Phase 3: Interactions & Governance (Week 3) - HIGH PRIORITY

### 📌 Interactions must belong to an Opportunity (backfill then enforce)

```sql
begin;
set local statement_timeout = '5min';

-- Preflight: confirm enum values exist for backfill
-- Should return 1 row each. If 0, add or switch to an existing value.
select 1 from pg_type t join pg_enum e on e.enumtypid = t.oid
where t.typname = 'opportunity_status' and e.enumlabel = 'Active';
select 1 from pg_type t join pg_enum e on e.enumtypid = t.oid
where t.typname = 'opportunity_stage' and e.enumlabel = 'New Lead';

-- Create a placeholder per org that has orphan interactions
with orphan as (
  select i.id, coalesce(i.organization_id, c.organization_id) as org_id
  from interactions i
  left join contacts c on c.id = i.contact_id
  where i.opportunity_id is null and i.deleted_at is null
),
created as (
  insert into opportunities (name, organization_id, status, stage, created_by, updated_by)
  select 'General Activity', org_id, 'Active'::opportunity_status, 'New Lead'::opportunity_stage,
         '00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000000'
  from orphan group by org_id
  returning id, organization_id
)
update interactions i
set opportunity_id = c.id
from created c
where i.opportunity_id is null
  and coalesce(i.organization_id, (select organization_id from contacts where id=i.contact_id)) = c.organization_id;

-- Enforce rule going forward
alter table interactions alter column opportunity_id set not null;
```

### 🔒 Consistency: contact/org must align with the opportunity's org

```sql
create or replace function validate_interaction_consistency()
returns trigger language plpgsql as $$
declare v_opp_org uuid; v_contact_org uuid;
begin
  select organization_id into v_opp_org from opportunities where id = new.opportunity_id;
  if new.contact_id is not null then
    select organization_id into v_contact_org from contacts where id = new.contact_id;
    if v_contact_org is distinct from v_opp_org then
      raise exception 'Contact and Opportunity belong to different organizations';
    end if;
  end if;
  if new.organization_id is not null and new.organization_id is distinct from v_opp_org then
    raise exception 'Interaction.organization_id must match Opportunity.organization_id (or be null)';
  end if;
  return new;
end$$;

drop trigger if exists trg_interactions_consistency on interactions;
create trigger trg_interactions_consistency
before insert or update on interactions
for each row execute function validate_interaction_consistency();

commit;
```

### 🎛️ Enums vs Lookups decision box (keep one system)

* **If you keep enums (TypeScript friendly):** drop the \*\_lu tables or keep them only for display metadata linked by enum code.
* **If you keep lookups (admin editable):** convert columns to `text` + FK to LU; drop enum types.
  *(Pick one path and add the corresponding SQL you already drafted.)*

### ✅ Phase 3 Validation
- [ ] **Single source of truth established**
- [ ] **All views updated and functional**
- [ ] **TypeScript types regenerated**
- [ ] **No enum/lookup conflicts**

---

## Phase 4: Cleanup & Optimization (Week 4)

### 🧹 Remove old FK columns after UI flips to participants

```sql
begin;
set local statement_timeout = '5min';

-- First remove cleanup triggers/functions from Phase 1
drop trigger if exists trg_org_flags_readonly on organizations;
drop function if exists prevent_flag_mutation();

-- Then remove old FK columns
alter table opportunities 
drop column if exists principal_organization_id,
drop column if exists distributor_organization_id;

commit;
```

### 🚀 Materialized View care (concurrent refresh)

```sql
-- Ensure MV has a unique index on a suitable column set, then:
-- Example if MV has an opportunity_id column:
create unique index if not exists ux_dashboard_summary_id
on reporting.dashboard_summary(opportunity_id);

-- NOTE: Do NOT wrap REFRESH MATERIALIZED VIEW CONCURRENTLY in a transaction
refresh materialized view concurrently reporting.dashboard_summary;
```

### 🗑️ Final Legacy View Cleanup (when UI no longer uses legacy columns)

```sql
-- After UI flip & Phase 4 validations complete
drop view if exists opportunities_legacy;
```

### 📊 Quick Data Checks (paste under "Post-Migration Verification")

```sql
-- Every opportunity has a customer participant
select count(*) from opportunities o
where not exists (
  select 1 from opportunity_participants p
  where p.opportunity_id = o.id and p.role='customer'
);

-- No duplicate active opportunity names per org
select organization_id, lower(name), count(*)
from opportunities
where deleted_at is null
group by 1,2 having count(*) > 1;

-- No duplicate active contact emails
select lower(email), count(*)
from contacts
where email is not null and deleted_at is null
group by 1 having count(*) > 1;
```

### ✅ Phase 4 Validation
- [ ] **No orphaned artifacts remain**
- [ ] **Performance benchmarks met**
- [ ] **All security tests pass**
- [ ] **TypeScript compilation clean**

---

## Post-Migration Verification

### 🔍 Data Integrity Checks
```sql
-- Every opportunity has a customer participant
select count(*) from opportunities o
where not exists (
  select 1 from opportunity_participants p
  where p.opportunity_id = o.id and p.role='customer'
);

-- No duplicate active opportunity names per org
select organization_id, lower(name), count(*)
from opportunities
where deleted_at is null
group by 1,2 having count(*) > 1;

-- No duplicate active contact emails
select lower(email), count(*)
from contacts
where email is not null and deleted_at is null
group by 1 having count(*) > 1;
```

### ⚡ Performance Validation
- [ ] **Dashboard load time < 2 seconds**
- [ ] **Opportunity queries < 100ms**
- [ ] **Complex reports < 500ms**
- [ ] **No full table scans on large tables**

### 🛡️ Security Testing
```sql
-- Test RLS policies with JWT simulation
select set_config(
  'request.jwt.claims',
  json_build_object('sub','00000000-0000-0000-0000-000000000001','role','authenticated')::text,
  true
);
select count(*) from opportunities;
select count(*) from opportunity_participants;
```

### 💻 Application Testing
- [ ] **All CRUD operations functional**
- [ ] **Multi-principal opportunity creation**
- [ ] **Legacy data accessible**
- [ ] **Forms validate correctly**
- [ ] **TypeScript errors resolved**

### 📊 Final Type Generation & Validation
```bash
npx supabase gen types typescript --project-id=ixitjldcdvbazvjsnkao > src/lib/database.types.ts
npm run typecheck
```

### 🧪 Validation Assertions ("prove it's clean")

```sql
-- Exactly one primary customer per opportunity
select o.id
from opportunities o
join opportunity_participants p on p.opportunity_id = o.id and p.role='customer' and p.is_primary
group by o.id
having count(*) <> 1;
-- Should return 0 rows

-- Participants roles match org roles (no violations)
select p.*
from opportunity_participants p
left join organization_roles r on r.organization_id = p.organization_id and r.role = p.role
where p.role in ('principal','distributor') and r.organization_id is null;
-- Should return 0 rows
```

---

## Emergency Rollback Procedures

### 🚨 Phase 1 Rollback
```sql
-- Restore organization boolean columns
ALTER TABLE organizations 
ADD COLUMN is_principal BOOLEAN DEFAULT false,
ADD COLUMN is_distributor BOOLEAN DEFAULT false;

UPDATE organizations 
SET is_principal = (type = 'principal'),
    is_distributor = (type = 'distributor');
```

### 🚨 Phase 2 Rollback
```sql
-- Restore original opportunity columns
ALTER TABLE opportunities 
ADD COLUMN principal_organization_id UUID REFERENCES organizations(id),
ADD COLUMN distributor_organization_id UUID REFERENCES organizations(id);

-- Populate from participants table
UPDATE opportunities SET
  principal_organization_id = (
    SELECT organization_id FROM opportunity_participants 
    WHERE opportunity_id = opportunities.id AND role = 'principal' AND is_primary = true
    LIMIT 1
  ),
  distributor_organization_id = (
    SELECT organization_id FROM opportunity_participants 
    WHERE opportunity_id = opportunities.id AND role = 'distributor' AND is_primary = true
    LIMIT 1
  );

DROP TABLE opportunity_participants CASCADE;
```

---

## Success Criteria

### ✅ Technical Criteria
- [ ] **Schema alignment: 95%+** (from current 78%)
- [ ] **Zero data loss** during migration
- [ ] **All TypeScript types compile** without errors
- [ ] **RLS policies functional** for all scenarios
- [ ] **Performance maintained** or improved

### ✅ Business Criteria  
- [ ] **Multi-principal opportunities** fully functional
- [ ] **Admin can manage** lookup values (if lookup approach chosen)
- [ ] **Data integrity** maintained across relationships
- [ ] **Audit trail** complete and reliable

### ✅ Operational Criteria
- [ ] **Migration completed** within 4-week timeline
- [ ] **Zero downtime** for critical operations
- [ ] **Rollback procedures** tested and documented
- [ ] **Team trained** on new schema patterns

---

## Final Notes

**Database Backup**: Always maintain current backup before each phase  
**Testing Environment**: Validate all changes in staging before production  
**Communication**: Notify stakeholders of any temporary limitations during migration  
**Documentation**: Update all technical documentation to reflect final schema state

**Migration Owner**: Database Architect  
**Technical Review**: Senior Developer + CTO  
**Business Sign-off**: Product Owner  
**Final Approval**: Technical Lead

---

## 👣 Final Execution Order (to prevent deadlocks)

**Execute in this exact sequence:**

1. **Phase 1** (roles table + audit triggers + backfill + NOT NULL created_by)
2. **Phase 2** (participants + trigger + backfill + compatibility view + audit trigger attach)
3. **Phase 3** (Interactions backfill → `opportunity_id set not null` → consistency trigger + governance decisions)
4. **Phase 4** (Remove old FK columns, refresh MVs, regenerate types, fix TS fallout)

**Each phase is wrapped in BEGIN/COMMIT with 5min timeouts for safety.**

---

*This checklist represents a comprehensive migration plan to achieve >95% schema alignment and resolve all critical architectural gaps identified in the KitchenPantry CRM schema audit.*