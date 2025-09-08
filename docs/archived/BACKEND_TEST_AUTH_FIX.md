# Backend Test Authentication Fix

## Problem

Backend tests were failing with PostgreSQL error 42501 "insufficient privilege" because:
1. Tests were using anonymous key instead of service role key
2. RLS policies require `auth.uid()` which is null for unauthenticated requests
3. Helper functions `user_is_admin()` and `user_has_org_access()` had authentication dependencies

## Solutions Implemented

### 1. Enhanced Test Configuration

**File**: `tests/backend/setup/test-setup.ts`

- Added support for `SUPABASE_SERVICE_ROLE_KEY` environment variable
- Created dual client setup: service role for backend tests, anon for RLS testing
- Added intelligent authentication handling based on available keys
- Improved error messaging and troubleshooting guidance

### 2. Service Role Key Usage

When `SUPABASE_SERVICE_ROLE_KEY` is available:
- Bypasses all RLS policies automatically
- Skips authentication as service role has full access
- Logs service role usage for transparency

When only anonymous key is available:
- Falls back to existing authentication flow
- Provides clear guidance on obtaining service role key
- Uses mock authentication for graceful degradation

### 3. Environment Configuration

**Updated**: `.env.example`

Added documentation for `SUPABASE_SERVICE_ROLE_KEY`:
```bash
# Backend Testing Configuration (Recommended for database tests)
# Get service role key from: Supabase Dashboard > Settings > API > service_role
# This bypasses RLS policies for backend testing
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## How to Fix Authentication Issues

### Option A: Use Service Role Key (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project → Settings → API
3. Copy the "service_role secret" key
4. Add to `.env.local`:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
5. Set environment: `NODE_ENV=test npm run test:backend`

### Option B: Create Test Users (Alternative)

1. Create users in Supabase Auth:
   - `test@kitchenpantrycrm.com` / `TestPassword123!`
   - `admin@kitchenpantrycrm.com` / `AdminPassword123!`
2. Tests will authenticate these users automatically

## Test Environment Detection

The system automatically detects the appropriate authentication method:

```typescript
const useServiceRole = TEST_SUPABASE_SERVICE_ROLE_KEY && process.env.NODE_ENV === 'test'
```

**Service Role Mode**: Bypasses RLS, full database access
**Anonymous Mode**: Respects RLS policies, requires authentication

## Database RLS Functions

Current helper functions in database:
- `user_is_admin()`: Checks JWT claims for service_role or admin role  
- `user_has_org_access(org_id)`: Currently returns `true` (MVP placeholder)

**Production Recommendation**: Implement proper role-based access control in these functions.

## Security Notes

⚠️ **Important**: Service role key has full database access
- Never expose in client-side code
- Use only in secure server environments and tests
- Add to `.env.local`, not version control
- Rotate keys regularly in production

## Validation

Run tests to verify fixes:
```bash
# With service role key
NODE_ENV=test npm run test:backend

# Check authentication method in logs
npm run test:backend 2>&1 | grep -E "(Using service role|Using anonymous)"
```

Expected output:
- `🔑 Using service role key for backend tests (bypasses RLS)`
- Tests should pass without 42501 errors

## Error Codes Reference

- **42501**: Insufficient privilege (fixed by service role key)
- **PGRST116**: No rows returned (expected for some test scenarios)
- **23502**: NOT NULL constraint violation (data validation, not auth)
- **22P02**: Invalid enum value (data validation, not auth)