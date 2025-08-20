# KitchenPantry CRM — Master Migration & Operations Checklist (MCP / Supabase, PostgreSQL)

**Owner:** Schema (Senior Database Architect)
**Environment:** Remote Supabase Postgres with **Row Level Security (RLS)**, managed via **Supabase MCP tool** (no local Supabase).
**Frontend:** React 18 + TypeScript (Vite) • **Auth:** Supabase Auth (JWT)
**Keys:**

* **Service Role** — admins/automations only; **bypasses RLS**; required for migrations, data moves, and scheduled jobs.
* **Anon** — browser clients; RLS enforced.

> This is the complete, copy-pasteable **one-document runbook** for initial setup and operations. It includes manual stage/status overrides, safe user off-boarding (RESTRICT + reassignment), interaction UPDATE sync, 24h correction window for interaction owners, soft-delete aware RLS, rollback rehearsal, and performance baselining.

---

## 🚨 Critical Risk Assessment (READ FIRST)

### **High Risk: Trigger Cascade Complexity** 
Phase 4 implements complex business logic in database triggers. Consider **MVP Alternative** below for simpler approach.

### **Medium-High Risk: RLS Performance at Scale**
Complex RLS policies may cause 2-10x performance degradation. **Load test first** with production data volumes.

### **Medium Risk: Migration Window Underestimation**
"5-10 min" is optimistic. Plan for **20-30 minutes** or split into 2 deployment windows.

## How to use this checklist

* **Pre-Migration**: Complete risk assessment and load testing (see section below)
* Execute each **Phase** with **Supabase MCP → Execute SQL**.
* Run on **staging first**, then production during **planned maintenance window**.
* Use **transactions** (`BEGIN; … COMMIT;`) for every pack; **ROLLBACK** if any error.
* **Always** run migrations with the **Service Role** connection (avoids RLS surprises).
* Store SQL in `/db/sql/` for repeatable runs and PR review.

---

## Quick map of phases

1. Extensions, Helpers, Lookups → `000_init_core.sql`
2. Organizations & Contacts → `010_orgs_contacts.sql`
3. Products & Distribution (SSoT) → `020_products_distribution.sql`
4. Opportunities, Interactions, Business Rules **(+ manual overrides & UPDATE sync)** → `030_opps_interactions_rules.sql`
5. Derived Roles & Reporting Views → `040_views_reporting.sql`
6. RLS Policies **+ Soft-Delete + Off-boarding (RESTRICT + reassignment + admin wrapper)** → `050_rls_policies_offboarding.sql`
7. Hardening: Multi-Stakeholder, FTS, Dashboard MV → `060_hardening.sql`
   7.5) **Rollback Rehearsal (staging only)**
8. Seeds (Lookups & Demo) → `070_seeds.sql`

> **Design notes:**
> • "Primary distributor" is **single source of truth**: `product_distributors.is_primary`. We **do not** keep `products.primary_distributor_org_id`.
> • Opportunity **stage/status** can be **manually overridden**; otherwise they sync from the **latest interaction**. Sync fires on **INSERT/UPDATE/DELETE**, but only when driver fields change, and manual flags prevent overrides.
> • **CRITICAL FIX**: `deleted_at` columns are added in **Phase 6** (before RLS policies), not Phase 7, to prevent migration errors.

---

## Pre-flight Risk Assessment & Load Testing

### **Critical Pre-Migration Tasks**
* [ ] **Load test with production-scale data**: 10,000+ records per table
* [ ] **RLS performance validation**: Test complex policies under realistic load  
* [ ] **Trigger execution timing**: Measure business logic performance impact
* [ ] **Connection pool strategy**: Plan for RLS bypass if needed
* [ ] **Migration window planning**: Budget 20-30 minutes, consider 2-phase deployment

### **Standard Pre-Flight Tasks**
* [ ] Verify **Service Role** connection in MCP; never expose it client-side.
* [ ] Create/reset a **staging** project with production-sized dataset.
* [ ] Add `/db/sql/` to the repo; plan **20–30 min** prod window (not 5-10 min).
* [ ] Confirm frontend **does not** reference `products.primary_distributor_org_id`.
* [ ] Add UI toggles on Opportunity for **Manual stage** / **Manual status** (`stage_manual` / `status_manual`).
* [ ] Confirm **backup / PITR** for production.
* [ ] **Capture pre-migration performance baselines** (save to `/db/baselines/pre-migration-YYYY-MM-DD.sql`):
  ```sql
  -- Performance baseline queries - run with Service Role
  \timing on
  
  -- Baseline 1: Organization access patterns
  EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
  SELECT COUNT(*) FROM organizations WHERE owner_user_id IS NOT NULL;
  
  -- Baseline 2: Opportunity joins (future RLS-heavy query)
  EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
  SELECT o.*, org.name as org_name 
  FROM opportunities o 
  JOIN organizations org ON o.organization_id = org.organization_id 
  LIMIT 100;
  
  -- Baseline 3: Interaction aggregation (trigger-heavy pattern)
  EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
  SELECT opportunity_id, COUNT(*), MAX(interaction_date)
  FROM interactions 
  GROUP BY opportunity_id 
  LIMIT 100;
  
  -- Save execution times and buffer hit ratios for post-migration comparison
  ```

---

## Phase 1 — Extensions, helpers, lookups (`000_init_core.sql`)

**Execute:** Copy and paste `/db/sql/000_init_core.sql` into **Supabase MCP → Execute SQL**

**What it does:** 
- Creates `citext` extension for case-insensitive emails
- Adds `set_updated_at()` trigger function
- Creates lookup tables: `state_lu`, `stage_lu`, `status_lu`, `interaction_type_lu`, `source_lu`, `loss_reason_lu`
- **Circuit Breaker**: Creates `migration_control` table for phase tracking and rollback points

**Accept**
* [ ] `SELECT * FROM stage_lu LIMIT 0;` returns 0 rows (table exists, empty)
* [ ] No errors; transaction committed

**Rollback:** Drop lookup tables (staging only) - idempotent via `IF NOT EXISTS`

---

## Phase 2 — Organizations & Contacts (`010_orgs_contacts.sql`)

**Execute:** Copy and paste `/db/sql/010_orgs_contacts.sql` into **Supabase MCP → Execute SQL**

**What it does:**
- Creates `organizations` with unique name constraint, nullable `owner_user_id`
- Creates `contacts` with generated `full_name`, FK to organizations
- Adds proper indexes: `organizations_state_idx`, `organizations_owner_idx`
- Sets up `updated_at` triggers

**Accept**
* [ ] Insert `ACME` then `acme` → second fails (unique constraint)
* [ ] Contact without `organization_id` → fails (FK violation)

**Rollback:** Drop tables (staging only)

---

## Phase 3 — Products & Distribution (SSoT) (`020_products_distribution.sql`)

**Execute:** Copy and paste `/db/sql/020_products_distribution.sql` into **Supabase MCP → Execute SQL**

**What it does:**
- Creates `products` table (belongs to principal orgs, optional SKU)
- Creates `product_distributors` join table with single primary enforcement
- Adds partial unique index: `UNIQUE(product_id) WHERE is_primary`
- Includes optional legacy column migration (commented out - uncomment if needed)

**Accept**
* [ ] Two primaries for one product → fails (constraint violation)
* [ ] Join table present and writable

**Rollback:** Delete join rows; re-add legacy column if reverting (staging only)

---

## Phase 4 — Opportunities, Interactions, Business Rules (+ manual overrides & UPDATE sync) (`030_opps_interactions_rules.sql`)

**🚨 HIGH RISK: Complex Trigger Cascades**

**Execute:** Copy and paste `/db/sql/030_opps_interactions_rules.sql` into **Supabase MCP → Execute SQL**

**What it does:**
- Creates `opportunities` and `interactions` tables with all constraints
- Adds manual override flags: `stage_manual`, `status_manual` 
- Implements sync triggers to update opportunity stage/status from latest interaction
- Adds driver-edit protection (24h correction window for interaction owners)
- Includes **performance monitoring** in trigger functions

**⚠️ MVP ALTERNATIVE - Simpler Approach:**
```sql
-- Instead of complex triggers, use computed view for stage/status
CREATE OR REPLACE VIEW opportunities_enriched AS
SELECT 
  o.*,
  COALESCE(o.stage_manual_override, li.stage) as effective_stage,
  COALESCE(o.status_manual_override, li.status) as effective_status
FROM opportunities o
LEFT JOIN LATERAL (
  SELECT stage, status 
  FROM interactions 
  WHERE opportunity_id = o.opportunity_id 
  ORDER BY interaction_date DESC 
  LIMIT 1
) li ON true;
```
**Trade-off**: View approach is simpler but requires application-layer updates to use `opportunities_enriched` instead of base table.

**Accept**
* [ ] Opp without product **and** principal → fails (constraint violation)
* [ ] Inserting or updating interaction updates opp stage/status **unless** manual flags are true
* [ ] Interaction driver edits: opp owner anytime; interaction owner within 24h; others blocked
* [ ] UI toggles for **Manual stage** / **Manual status** function correctly
* [ ] **Performance test**: Trigger execution <50ms per interaction insert

**Rollback:** Drop triggers/functions (emergency only); Drop tables (staging only)

---

## Phase 5 — Derived roles & reporting views (`040_views_reporting.sql`)

**Execute:** Copy and paste `/db/sql/040_views_reporting.sql` into **Supabase MCP → Execute SQL**

**What it does:**
- Creates `v_org_roles` view (derives principal/distributor/customer/prospect from data)
- Creates `reporting.latest_interaction` view (DISTINCT ON by opportunity)
- Creates `reporting.pipeline_full` view (comprehensive join with all related data)
- Creates `reporting.org_principal_summary` view (rollup statistics)

**Accept**
* [ ] `SELECT * FROM reporting.pipeline_full LIMIT 1;` returns rows and reflects new interactions

**Rollback:** `DROP VIEW` (safe operation)

---

## Phase 6 — RLS Policies + Soft-Delete + Off-boarding (RESTRICT + reassignment + admin wrapper) (`050_rls_policies_offboarding.sql`)

**🚨 MEDIUM-HIGH RISK: RLS Performance at Scale**

**Execute:** Copy and paste `/db/sql/050_rls_policies_offboarding.sql` into **Supabase MCP → Execute SQL**

**What it does:**
- **CRITICAL**: Adds `deleted_at` columns to all tables (BEFORE creating RLS policies)
- Enables RLS on all tables with soft-delete aware policies
- Creates user ownership policies: opportunities (own), interactions (own or opp owner), organizations (scoped)
- Adds foreign key constraints to `auth.users` with `ON DELETE RESTRICT`
- Creates `reassign_user_data()` function (service role) and `admin_reassign_user_data()` wrapper
- Adds performance indexes for RLS queries

**⚠️ CRITICAL PERFORMANCE INDEXES - Add BEFORE enabling RLS:**
```sql
-- Essential composite indexes for RLS performance
CREATE INDEX CONCURRENTLY idx_opportunities_owner_deleted 
ON opportunities(owner_user_id, deleted_at) 
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_interactions_composite 
ON interactions(opportunity_id, interaction_date DESC, deleted_at) 
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_organizations_owner_deleted
ON organizations(owner_user_id, deleted_at)
WHERE deleted_at IS NULL;

-- RLS Query Performance Monitor
CREATE OR REPLACE FUNCTION log_slow_rls_queries() 
RETURNS event_trigger AS $$
BEGIN
  IF current_setting('log_min_duration_statement', true)::int > 100 THEN
    RAISE WARNING 'Slow RLS query detected - consider query optimization';
  END IF;
END;
$$ LANGUAGE plpgsql;
```

**Pre-execution check:** Run orphan checks to verify clean user references (queries in SQL file)

**Accept**

* [ ] User A cannot see/edit User B's opps/interactions.
* [ ] Shared/system orgs (`owner_user_id IS NULL`) visible to all; others scoped.
* [ ] Deleting a user with owned data → **blocked**; after `admin_reassign_user_data(from, to)` → deletion succeeds.
* [ ] **RLS Performance Check**: Query with user context completes in <200ms (P95 target):
  ```sql
  -- Test with actual user token (not service role)  
  SET ROLE authenticated;
  SET request.jwt.claims TO '{"sub": "test-user-uuid"}';
  
  \timing on
  SELECT COUNT(*) FROM organizations; -- Should use RLS policy
  SELECT o.*, org.name FROM opportunities o 
  JOIN organizations org ON o.organization_id = org.organization_id 
  LIMIT 10; -- Should complete quickly with proper indexes
  
  -- Verify query plans use indexes, not sequential scans
  EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM opportunities WHERE owner_user_id = 'test-user-uuid';
  
  -- Monitor RLS overhead: queries should show <50ms RLS penalty
  ```
* [ ] **Fallback Strategy**: Document Service Role connection for RLS bypass in emergencies

**Rollback**

* [ ] Temporarily disable RLS (emergency only).
* [ ] Drop FKs / functions (staging only).

---

## Phase 7 — Hardening: Multi-Stakeholder, FTS, Dashboard MV (`060_hardening.sql`)

**⚠️ CONSIDER FOR FUTURE: MVP Deferral Candidates**

**Execute:** Copy and paste `/db/sql/060_hardening.sql` into **Supabase MCP → Execute SQL**

**What it does:**
- Creates `opportunity_contacts` join table (multi-stakeholder support)
- Adds full-text search: `search_tsv` columns + GIN indexes + optimized triggers  
- Creates materialized view `reporting.dashboard_summary` with required UNIQUE index
- Creates `refresh_dashboard_view()` function (SECURITY DEFINER) for authenticated users
- Note: `deleted_at` columns already added in Phase 6

**🎯 MVP Simplifications (defer these features):**
- **Full-text search**: Use simple `ILIKE` queries instead of GIN indexes
- **Multi-stakeholder contacts**: Start with single contact per opportunity
- **Materialized views**: Use application-layer caching (Redis) for dashboard data

**Accept**
* [ ] Stakeholder links work with PK deduplication
* [ ] `SELECT public.refresh_dashboard_view();` succeeds; MV readable during refresh  
* [ ] FTS queries work: `SELECT * FROM organizations WHERE search_tsv @@ to_tsquery('acme');`
* [ ] **Dashboard Performance**: MV refresh completes in <10 seconds

**Rollback:** Drop `opportunity_contacts`, FTS columns/indexes, MV and refresh function (module-wise revert)

---

## Phase 7.5 — **Rollback rehearsal (staging only)**

**⚠️ UPDATED TIME ESTIMATES:**
* [ ] Execute rollback for Phase 7 → 1 in reverse; verify clean state. **Expect: 10-15 minutes**
* [ ] Re-run phases 1 → 8 end-to-end. **Expect: 25-35 minutes with load**
* [ ] Document issues and time-to-recover.
* [ ] **Performance regression test**: Compare baseline vs post-migration query times

---

## Phase 8 — Seeds (Lookups & demo) (`070_seeds.sql`)

**Execute:** Copy and paste `/db/sql/070_seeds.sql` into **Supabase MCP → Execute SQL**

**What it does:**
- Seeds lookup tables: `stage_lu`, `status_lu`, `interaction_type_lu`, `source_lu`, `loss_reason_lu`
- Uses `ON CONFLICT DO NOTHING` for idempotent execution
- Optional demo data (minimal principal/distributor/customer pipeline for smoke tests)

**Accept**
* [ ] Kanban columns render with proper stage names
* [ ] Forms show lookup dropdown options
* [ ] `reporting.pipeline_full` returns rows if demo data included

**Rollback:** `TRUNCATE … RESTART IDENTITY` (staging/dev only)

---

## Post-migration (all envs)

* [ ] **Generate TypeScript types** from remote DB (MCP types action or CI Supabase CLI) → `src/types/supabase.ts`.
* [ ] **Manual smoke tests** as a normal user (no service role).
* [ ] **Performance baseline:** capture execution times for `reporting.pipeline_full` and dashboard MV endpoints; set alerts for p95 > **500 ms**.
* [ ] **Alerting:** on two consecutive failures of `refresh_dashboard_view()`, page on-call.
* [ ] Point UI data hooks to:

  * `reporting.pipeline_full` (opp list/kanban)
  * `v_org_roles` (org badges)
  * `opportunity_contacts` (stakeholders)
  * Respect `stage_manual` / `status_manual` in forms and display.

---

## 📊 Risk Priority Matrix

| Issue | Impact | Probability | Mitigation Effort | Action |
|-------|--------|-------------|------------------|--------|
| Trigger cascade failures | HIGH | MEDIUM | HIGH | Simplify to computed columns |
| RLS performance degradation | HIGH | HIGH | MEDIUM | Add indexes + monitoring |
| Migration window overrun | MEDIUM | HIGH | LOW | Split into 2 windows |
| MV refresh blocking reads | LOW | MEDIUM | LOW | Use caching layer |
| User deletion edge cases | HIGH | LOW | MEDIUM | Test thoroughly |

## Risk & mitigation

* **RLS blocks migration** → Always run packs with **Service Role**.
* **Concurrent writes during schema change** → Use temporary block trigger or short table lock in Phase 3; schedule a window.
* **Stage/status surprises** → Manual flags + UPDATE-aware sync + 24h correction window prevent accidental overrides.
* **User deletion** → `ON DELETE RESTRICT` + `admin_reassign_user_data()` eliminates leaks and mass deletes.
* **FTS overhead** → Limit tsvector triggers to specific columns.
* **MV refresh lock** → Use **CONCURRENTLY** with **UNIQUE index**; schedule off-peak.
* **Migration time overrun** → Budget **30+ minutes**, consider blue-green deployment with Supabase branching.

---

## Common errors & fixes

* `cannot refresh materialized view concurrently` → Add **UNIQUE** index `rds_owner_stage_uq`.
* `permission denied for relation …` → You forgot Service Role for migration; or RLS policy is too strict.
* Driver edit blocked → Expected; opp owner or interaction owner within 24h required.
* Duplicate org names on import → Normalize and `UPSERT` with lowercased name.
* Stage gating failure on interaction → Ensure opp has `product_id` when gated stages require it.
* **Slow RLS queries at scale** → Consider Security Definer function pattern (see scaling notes below).

## RLS Performance Scaling Pattern (Future Use)

When organizations reach 10,000+ opportunities, replace complex RLS policies with Security Definer functions:

```sql
-- High-performance alternative for large datasets
CREATE OR REPLACE FUNCTION my_accessible_organizations() 
RETURNS SETOF uuid 
SECURITY DEFINER 
LANGUAGE sql AS $$
  -- Complex logic executed once per session, not per row
  SELECT organization_id FROM organizations 
  WHERE owner_user_id IS NULL OR owner_user_id = auth.uid()
  UNION
  SELECT DISTINCT o.organization_id 
  FROM opportunities o 
  WHERE o.owner_user_id = auth.uid() AND o.deleted_at IS NULL;
$$;

-- Simplified RLS policy using the function
DROP POLICY IF EXISTS org_select_scoped ON organizations;
CREATE POLICY org_select_scoped_fast ON organizations
FOR SELECT USING (
  deleted_at IS NULL 
  AND organization_id IN (SELECT * FROM my_accessible_organizations())
);

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION my_accessible_organizations() TO authenticated;
```

---

## Verification matrix (RLS, overrides, updates)

* User **A** creates org/contact/opp; **visible** to A only.
* User **B** cannot see A’s data (unless org `owner_user_id IS NULL`).
* Interactions visible to opp owner **or** interaction owner; **driver edits** allowed for opp owner anytime, interaction owner within 24h.
* Toggle `stage_manual=true` → new/updated interactions **do not** change `stage`.
* Run `admin_reassign_user_data(A,B)` → A’s records become B’s; deletion of A now succeeds.

---

## File layout in repo

```
/db/
  sql/
    000_init_core.sql              # Extensions, helpers, lookups
    010_orgs_contacts.sql          # Organizations & contacts + indexes
    020_products_distribution.sql  # Products & distributor join table
    030_opps_interactions_rules.sql # Opportunities & interactions + business rules
    040_views_reporting.sql        # Derived roles & reporting views
    050_rls_policies_offboarding.sql # RLS + soft-delete + user management
    060_hardening.sql              # Multi-stakeholder + FTS + dashboard MV
    070_seeds.sql                  # Lookup seeds + optional demo data
  baselines/
    pre-migration-YYYY-MM-DD.sql   # Performance baseline queries & results
src/types/
  supabase.ts                      # Generated TypeScript types
```

---

## ✅ Recommended Immediate Actions

### **Do First (Before Migration)**
* [ ] **Load test with 10,000+ records** per table using production data patterns
* [ ] Add the **critical performance indexes** mentioned in Phase 6 
* [ ] Create **fallback connection pool** for RLS bypass during emergencies
* [ ] Document **trigger execution order** and test individual trigger performance
* [ ] Test **rollback procedures** on full production data copy

### **Do During Migration**  
* [ ] **Circuit Breaker Pattern**: Track each phase in `migration_control` table
  ```sql
  -- Before each phase
  INSERT INTO migration_control (phase_number, status, started_at) 
  VALUES (1, 'running', NOW());
  
  -- After each phase success
  UPDATE migration_control SET status = 'complete', completed_at = NOW() 
  WHERE phase_number = 1;
  ```
* [ ] Run `EXPLAIN ANALYZE` after each phase to verify index usage
* [ ] Monitor `pg_stat_statements` for slow queries (>200ms)
* [ ] Keep Service Role connection count low (<5 concurrent)
* [ ] Verify row counts after each phase match expectations
* [ ] **Migration Log**: Keep spreadsheet open tracking Phase | Start | End | Duration | Issues

### **Do After Migration**
* [ ] Set up automatic `VACUUM` schedule for soft-deleted tables
* [ ] Enable `pg_stat_statements` extension for ongoing performance monitoring  
* [ ] Create performance regression tests with baseline comparisons
* [ ] Monitor connection pool saturation and RLS query performance

## 🎯 Success Metrics (Define Before Migration)

* **P95 query time**: <200ms (not 500ms)
* **RLS overhead**: <50ms per query  
* **Migration execution time**: 20-30 minutes total (not 5-10 minutes)
* **Rollback time**: <5 minutes from any phase
* **Zero data loss tolerance**: All phases must be atomic

---

## SQL Pack Contents

The complete, ready-to-execute SQL for all 8 phases is available in the user's message above. Each SQL pack includes:

- **Idempotent DDL**: All statements use `IF NOT EXISTS`, `OR REPLACE`, `ON CONFLICT DO NOTHING`  
- **Transactional**: Each pack wrapped in `BEGIN/COMMIT` for atomic execution
- **Service Role Compatible**: No RLS interference during migration execution  
- **Performance Optimized**: Includes all monitoring, indexes, and optimizations
- **Critical Fix Applied**: `deleted_at` columns added in Phase 6 before RLS policies

**Usage:** Copy each SQL pack from the user's message into `/db/sql/` directory, then execute via **Supabase MCP → Execute SQL** in order.

---

## 🎯 MVP vs Full Feature Tradeoffs

### **Ship First (Essential MVP)**
- **Core tables**: Organizations, contacts, opportunities (Phases 1-3)
- **Basic RLS**: Owner-based policies only (simplified Phase 6) 
- **Simple status tracking**: Manual flags without complex triggers (simplified Phase 4)
- **Standard indexes**: Performance-critical indexes only

### **Defer for v2 (Complex Features)**
- **Full-text search**: Use simple `ILIKE` queries initially
- **Multi-stakeholder contacts**: Start with single contact per opportunity
- **Complex manual overrides**: Use simple boolean flags
- **Materialized views**: Use application-layer caching (Redis)
- **Trigger cascades**: Replace with computed views or application logic

### **Alternative Simpler Architecture**
```sql
-- Universal permissions table instead of complex RLS policies
CREATE TABLE user_permissions (
  user_id uuid,
  resource_type text,  
  resource_id uuid,
  permission text,
  PRIMARY KEY (user_id, resource_type, resource_id, permission)
);

-- Single RLS policy for all tables
CREATE POLICY universal_access ON opportunities
USING (
  EXISTS (
    SELECT 1 FROM user_permissions
    WHERE user_id = auth.uid()
    AND resource_type = 'opportunity'  
    AND resource_id = opportunities.opportunity_id
  )
);
```

**Recommendation**: Start with **Phases 1-3 + simplified Phase 6** in production. Validate performance, then add complexity based on actual usage patterns.

---

## Final sign-off checklist

### **Day Before Migration**
* [ ] Run full migration on staging with production data volume (10,000+ records)
* [ ] Document actual timing for each phase in migration log
* [ ] Prepare rollback scripts in separate terminal windows
* [ ] Test Service Role connection limits (keep under 5 concurrent)
* [ ] Clear Supabase query cache: `SELECT pg_stat_reset();`

### **Pre-Production Validation**
* [ ] All phases executed on **staging**; acceptance checks green
* [ ] Rollback rehearsal (Phase 7.5) completed successfully - **Budget 15+ minutes**
* [ ] Types regenerated; UI builds cleanly
* [ ] RLS verified with 2+ users (owner vs non-owner) 
* [ ] Manual stage/status overrides & UPDATE sync tested (no accidental resets)
* [ ] MV refresh works and is scheduled
* [ ] **Performance benchmarks**: All success metrics achieved (P95 <200ms)

### **Production Execution**
* [ ] Production migration executed with **Service Role** during **30+ minute window**
* [ ] **Circuit breaker monitoring**: All phases marked 'complete' in `migration_control`
* [ ] Post-deploy smoke tests green (CRUD + reporting)
* [ ] **Fallback plan** documented and tested

### **Post-Migration (Week 1)**
* [ ] **Success metrics tracking**: P95 queries <200ms, zero integrity issues, support tickets <5
* [ ] Monitor `migration_control` table for any 'failed' statuses
* [ ] **Team celebration**: Acknowledge successful pragmatic execution! 🚀