# Password Reset Security Fix - Open Redirect Vulnerability

## Overview

This document describes the security vulnerability that was fixed in the AuthContext password reset functionality and provides guidance for proper Supabase configuration.

## Vulnerability Details

### Problem
The original `resetPassword` function in `AuthContext.tsx` contained an open redirect vulnerability:

```typescript
// VULNERABLE CODE (FIXED)
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.protocol}//${window.location.host}/reset-password`
})
```

### Security Risk
- **OWASP Top 10**: A01:2021 – Broken Access Control
- **Attack Vector**: Client-side URL construction allows manipulation
- **Impact**: Phishing attacks via malicious redirect URLs
- **Scenario**: Attacker tricks user to initiate password reset on malicious domain

### Vulnerability Assessment
- **Severity**: HIGH - Critical security vulnerability
- **Exploitability**: Medium - Requires DNS manipulation or domain spoofing
- **Impact**: High - Account compromise via phishing

## Security Fix Implementation

### Primary Fix: Server-Side Configuration
The vulnerability was eliminated by removing client-side URL construction:

```typescript
// SECURE CODE (CURRENT)
const resetPassword = async (email: string) => {
  const redirectUrl = import.meta.env.VITE_PASSWORD_RESET_URL
  const { error } = (redirectUrl && redirectUrl !== 'undefined')
    ? await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl })
    : await supabase.auth.resetPasswordForEmail(email)
  return { error }
}
```

### Defense-in-Depth: Environment Variables
Optional environment variable support for explicit control:
- `VITE_PASSWORD_RESET_URL` - When set, overrides Supabase default
- When not set, relies on Supabase server-side configuration

## Supabase Configuration Requirements

### 1. Production Configuration

#### Site URL Setting
In your Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `https://crm.kjrcloud.com`
- This is used as the default redirect for password reset emails

#### Redirect URLs Setting  
Add allowed redirect URLs:
- `https://crm.kjrcloud.com/reset-password`
- `https://crm.kjrcloud.com/auth/callback` (if using OAuth)

### 2. Development Configuration

For local development, add:
- **Site URL**: `http://localhost:5173`
- **Redirect URLs**: 
  - `http://localhost:5173/reset-password`
  - `http://localhost:5173/auth/callback`

### 3. Staging Configuration

For staging environment:
- **Site URL**: Your staging domain
- **Redirect URLs**: Staging domain paths

### 4. Configuration Verification

To verify configuration:
1. Navigate to Supabase Dashboard → Authentication → Settings
2. Check Site URL matches your domain
3. Verify Redirect URLs include `/reset-password` path
4. Test password reset flow in each environment

## Testing & Validation

### Security Tests
Comprehensive test suite validates the fix:
```bash
npx vitest run src/contexts/__tests__/AuthContext.security.test.tsx
```

### Test Coverage
- ✅ No client-side URL construction
- ✅ Environment variable override functionality
- ✅ Error handling preservation
- ✅ Backward compatibility maintained

### Manual Testing
1. **Production Test**: Initiate password reset, verify email redirects to correct domain
2. **Development Test**: Test with local environment variables
3. **Error Test**: Verify error handling works correctly

## Migration Guide

### Immediate Actions Required

1. **Update Supabase Configuration**:
   - Set Site URL to production domain
   - Add redirect URLs for all environments
   - Remove any development URLs from production config

2. **Deploy Code Changes**:
   - The fix has been implemented in `AuthContext.tsx`
   - No breaking changes to existing functionality
   - Environment variable support is optional

3. **Verify Functionality**:
   - Test password reset flow in each environment
   - Confirm email links point to correct domains
   - Validate error handling works

### Environment Variables (Optional)

If you need explicit control over redirect URLs:

```env
# .env.production
VITE_PASSWORD_RESET_URL=https://crm.kjrcloud.com/reset-password

# .env.development  
VITE_PASSWORD_RESET_URL=http://localhost:5173/reset-password
```

**Note**: Only set these if you need environment-specific overrides. The default Supabase configuration is recommended for most cases.

## Security Best Practices

### 1. Never Trust Client-Side URLs
- Always validate redirects server-side
- Use allowlists instead of dynamic construction
- Implement proper URL validation

### 2. Supabase Security Configuration
- Use environment-specific projects when possible
- Regularly audit redirect URL configurations
- Monitor authentication logs for suspicious activity

### 3. Testing Strategy
- Include security tests in CI/CD pipeline
- Test password reset flow in all environments
- Validate redirect behavior regularly

## Monitoring & Maintenance

### Regular Checks
- **Monthly**: Verify Supabase redirect URL configuration
- **After Domain Changes**: Update Site URL and redirect URLs
- **Before Deployments**: Run security test suite

### Log Monitoring
Monitor for:
- Failed authentication attempts
- Unusual redirect patterns
- Configuration errors in logs

## References

- [OWASP Open Redirect Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html)
- [Supabase Auth Configuration](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui#set-up-redirect-urls)
- [Security Test Implementation](../tests/AuthContext.security.test.tsx)

---

**Security Fix Applied**: 2025-08-24  
**Vulnerability Status**: RESOLVED  
**Next Review**: 2025-11-24