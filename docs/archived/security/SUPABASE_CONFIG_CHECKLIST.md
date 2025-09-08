# Supabase Security Configuration Checklist

## Pre-Deployment Security Checklist

### ✅ Supabase Dashboard Configuration

#### Authentication Settings
- [ ] **Site URL** set to production domain: `https://crm.kjrcloud.com`
- [ ] **Redirect URLs** include:
  - [ ] `https://crm.kjrcloud.com/reset-password`
  - [ ] `https://crm.kjrcloud.com/auth/callback` (if using OAuth)
- [ ] Remove any development/localhost URLs from production config
- [ ] Verify JWT settings and secret are secure

#### Environment-Specific Configs
- [ ] **Production**: Only production URLs in redirect list
- [ ] **Staging**: Separate project or staging-specific URLs
- [ ] **Development**: Local URLs in development project only

### ✅ Code Configuration

#### Environment Variables
- [ ] `VITE_PASSWORD_RESET_URL` set only if explicit control needed
- [ ] No hardcoded URLs in authentication code
- [ ] Environment variables properly secured (not in version control)

#### Security Validation
- [ ] Run security tests: `npx vitest run src/contexts/__tests__/AuthContext.security.test.tsx`
- [ ] All security tests passing
- [ ] No client-side URL construction in auth code

### ✅ Testing Verification

#### Functional Tests
- [ ] Password reset sends email with correct domain link
- [ ] Reset link redirects to production domain
- [ ] Error handling works properly
- [ ] No console errors during password reset flow

#### Security Tests  
- [ ] Manual test: Verify email links don't use window.location
- [ ] Confirm no redirect to unauthorized domains possible
- [ ] Test with different browsers and network conditions

### ✅ Production Deployment

#### Pre-Deploy
- [ ] Security tests pass in CI/CD
- [ ] Supabase configuration verified
- [ ] Environment variables properly set
- [ ] Code review completed and approved

#### Post-Deploy
- [ ] Test password reset flow in production
- [ ] Monitor authentication logs for errors
- [ ] Verify email delivery and correct redirect URLs
- [ ] Document configuration in team knowledge base

## Emergency Rollback Plan

If issues arise after deployment:

1. **Immediate Actions**:
   - [ ] Revert Supabase redirect URLs to previous working configuration
   - [ ] Check Supabase logs for authentication errors
   - [ ] Verify email delivery is working

2. **Investigation**:
   - [ ] Check application logs for auth-related errors
   - [ ] Test password reset flow manually
   - [ ] Verify environment variable configuration

3. **Communication**:
   - [ ] Notify users if password reset is temporarily unavailable
   - [ ] Update team on status and resolution timeline
   - [ ] Document issue and resolution for future reference

## Security Monitoring

### Ongoing Checks
- **Daily**: Monitor authentication error rates
- **Weekly**: Review Supabase auth logs for anomalies  
- **Monthly**: Verify redirect URL configuration is current
- **Quarterly**: Full security audit of authentication flow

### Alerts to Set Up
- High authentication failure rates
- Unusual redirect patterns in logs
- Configuration changes in Supabase dashboard
- Failed password reset attempts above threshold

## Emergency Contacts

- **Security Team**: [Insert contact information]
- **DevOps Team**: [Insert contact information]  
- **Supabase Support**: https://supabase.com/support

---

**Checklist Version**: 1.0  
**Last Updated**: 2025-08-24  
**Next Review**: 2025-11-24