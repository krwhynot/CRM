# Production Monitoring Setup

## Overview
This document outlines the comprehensive monitoring strategy for the KitchenPantry CRM application deployed on Vercel with Supabase backend.

## Health Check Endpoint
- **URL**: `https://your-domain.vercel.app/health.json`
- **Purpose**: Application health status and metadata
- **Update Frequency**: On each deployment

## Vercel Analytics Integration

### Core Web Vitals Monitoring
```javascript
// Already integrated via Vercel platform
// Metrics tracked:
// - Largest Contentful Paint (LCP)
// - First Input Delay (FID) 
// - Cumulative Layout Shift (CLS)
// - First Contentful Paint (FCP)
// - Time to First Byte (TTFB)
```

### Real User Monitoring (RUM)
- **Data Collection**: Automatic via Vercel
- **Dashboard**: Available in Vercel Dashboard → Analytics
- **Retention**: 90 days on Pro plan

## Supabase Monitoring

### Database Health
- **Connection Pool**: Monitor active connections
- **Query Performance**: Track slow queries (>100ms)
- **Error Rates**: Monitor auth and API failures
- **Storage Usage**: Track database and file storage

### API Monitoring
```javascript
// Monitor these key metrics:
// - Authentication success rate
// - CRUD operation latency
// - Database connection errors
// - Rate limiting hits
```

## Performance Benchmarks

### Target Metrics
- **Page Load Time**: <3 seconds (75th percentile)
- **Largest Contentful Paint**: <2.5 seconds
- **First Input Delay**: <100ms
- **Cumulative Layout Shift**: <0.1
- **Time to Interactive**: <5 seconds

### Bundle Size Monitoring
- **Current Size**: 87.37KB gzipped
- **Alert Threshold**: >100KB gzipped
- **Monitor**: dist/assets/*.js file sizes

## Error Tracking

### Frontend Error Monitoring
```javascript
// Custom error boundary implementation
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send to monitoring service
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Send to monitoring service
});
```

### API Error Monitoring
- **Supabase Errors**: Monitor via dashboard
- **Network Errors**: Track 4xx/5xx responses
- **Authentication Failures**: Track auth rejections

## Uptime Monitoring

### External Monitoring Setup
Recommended services:
1. **Pingdom**: HTTP/HTTPS monitoring
2. **UptimeRobot**: Free tier available
3. **StatusCake**: Global monitoring

### Monitor URLs
- **Homepage**: `https://your-domain.vercel.app/`
- **Health Check**: `https://your-domain.vercel.app/health.json`
- **Auth Endpoint**: `https://your-domain.vercel.app/auth/login`

## Security Monitoring

### Security Headers Validation
Monitor these headers via SecurityHeaders.com:
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

### SSL Certificate Monitoring
- **Auto-renewal**: Handled by Vercel
- **Expiration Alerts**: Set up external monitoring
- **HSTS**: Validate header presence

## Database Monitoring

### Key Metrics to Track
```sql
-- Connection monitoring
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE state = 'active';

-- Slow query monitoring
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE mean_time > 100 
ORDER BY mean_time DESC;

-- Table size monitoring
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public';
```

### Supabase Dashboard Alerts
Set up alerts for:
- Database CPU usage >80%
- Connection count >80% of limit
- Storage usage >80% of quota
- API error rate >5%

## Application-Specific Monitoring

### Business Metrics
- **User Sessions**: Track active user count
- **CRUD Operations**: Monitor form submissions
- **Search Performance**: Track search query times
- **Data Growth**: Monitor record counts per entity

### Custom Metrics Collection
```javascript
// Track business events
const trackEvent = (event, data) => {
  // Send to analytics
  console.log('Business Event:', event, data);
};

// Usage examples:
trackEvent('organization_created', { type: 'principal' });
trackEvent('search_performed', { entity: 'contacts', results: 25 });
```

## Alert Configuration

### Critical Alerts (Immediate Response)
- Application down (5xx errors)
- Database connection failures
- Authentication system down
- SSL certificate issues

### Warning Alerts (24h Response)
- High error rates (>2%)
- Slow response times (>5s)
- High resource usage (>80%)
- Bundle size increase (>10%)

### Info Alerts (Weekly Review)
- Performance degradation trends
- Usage pattern changes
- Security header changes
- Dependency vulnerabilities

## Dashboard Setup

### Vercel Dashboard
- **Analytics**: Monitor Core Web Vitals
- **Functions**: Track serverless function performance
- **Deployments**: Monitor build and deploy times
- **Domains**: SSL and DNS status

### Supabase Dashboard
- **Database**: Connection and performance metrics
- **Auth**: User sessions and auth metrics
- **Storage**: File upload and storage metrics
- **API**: Request volume and error rates

### Custom Dashboard
Consider setting up a custom monitoring dashboard using:
- **Grafana**: For advanced metrics visualization
- **DataDog**: For comprehensive APM
- **New Relic**: For full-stack monitoring

## Incident Response

### Response Procedures
1. **Detection**: Automated alerts + manual checks
2. **Assessment**: Determine impact and severity
3. **Response**: Execute appropriate response plan
4. **Recovery**: Restore service functionality
5. **Post-Mortem**: Document and improve

### Escalation Matrix
- **Level 1**: Development team (immediate)
- **Level 2**: DevOps/Infrastructure team (30 min)
- **Level 3**: Management notification (2 hours)

## Maintenance Windows

### Scheduled Maintenance
- **Supabase**: Announced via dashboard
- **Vercel**: Minimal downtime deployments
- **Dependencies**: Update during low-usage periods

### Emergency Procedures
- **Rollback**: Use Vercel deployment history
- **Database**: Supabase automatic backups
- **DNS**: Cloudflare or domain provider

## Reporting

### Daily Reports
- Uptime percentage
- Average response times
- Error counts and types
- Security scan results

### Weekly Reports
- Performance trend analysis
- User activity patterns
- Resource usage trends
- Security vulnerability scans

### Monthly Reports
- Comprehensive performance review
- Capacity planning analysis
- Security audit results
- Business metrics analysis

---

**Generated by Claude Code - CRM Deployment Orchestrator**
**Date**: 2025-08-17
**Status**: Production Monitoring Ready ✅