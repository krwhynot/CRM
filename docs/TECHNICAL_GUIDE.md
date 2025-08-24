# KitchenPantry CRM - Technical Documentation

## Architecture Overview

The KitchenPantry CRM is built with a modern, scalable architecture designed for the food service industry:

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui with Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **State Management**: TanStack Query (server) + Zustand (client)
- **Authentication**: Supabase Auth with Row Level Security
- **Deployment**: Vercel (Frontend) + Supabase (Backend)
- **Architecture**: Feature-based organization with automated safeguards
- **Performance**: Optimized caching, virtualization, and debouncing patterns

### System Requirements
- **Node.js**: 18+ 
- **npm**: 8+
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile Support**: iOS Safari, Chrome Mobile

## Database Schema

### Core Entities

#### Organizations Table
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  priority VARCHAR(5) CHECK (priority IN ('A+', 'A', 'B', 'C', 'D')),
  status VARCHAR(20) CHECK (status IN ('Prospect', 'Active', 'Inactive')),
  segment VARCHAR(100),
  is_principal BOOLEAN DEFAULT false,
  is_distributor BOOLEAN DEFAULT false,
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  country VARCHAR(50),
  notes TEXT,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Contacts Table
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  position VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  is_primary_contact BOOLEAN DEFAULT false,
  notes TEXT,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  principal_id UUID NOT NULL REFERENCES organizations(id),
  description TEXT,
  notes TEXT,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Opportunities Table
```sql
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  primary_contact_id UUID NOT NULL REFERENCES contacts(id),
  stage VARCHAR(50) CHECK (stage IN ('New Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost', 'Stalled', 'No Fit')),
  context VARCHAR(100) CHECK (context IN ('Food Show', 'Cold Call', 'Referral', 'Website', 'Email', 'Other')),
  value_estimate DECIMAL(10,2),
  notes TEXT,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Interactions Table
```sql
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id),
  contact_id UUID NOT NULL REFERENCES contacts(id),
  interaction_type VARCHAR(50) CHECK (interaction_type IN ('Email', 'Call', 'Demo', 'Meeting', 'Note', 'Follow-up')),
  interaction_date TIMESTAMP NOT NULL DEFAULT NOW(),
  subject VARCHAR(255),
  notes TEXT,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Business Logic Constraints

#### Database Triggers
- **validate_principal_type()**: Ensures only principals can have products
- **validate_priority_value_alignment()**: Maintains priority-value consistency
- **check_probability_stage_alignment**: Enforces stage progression logic
- **update_updated_at_column()**: Automatically updates timestamps

### Performance Optimizations

#### Indexes
```sql
-- Organizations indexes
CREATE INDEX idx_organizations_name ON organizations(name);
CREATE INDEX idx_organizations_is_principal ON organizations(is_principal);
CREATE INDEX idx_organizations_is_distributor ON organizations(is_distributor);
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_deleted_at ON organizations(deleted_at);

-- Contact indexes
CREATE INDEX idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_is_primary ON contacts(is_primary_contact);
CREATE INDEX idx_contacts_deleted_at ON contacts(deleted_at);

-- Product indexes
CREATE INDEX idx_products_principal_id ON products(principal_id);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_deleted_at ON products(deleted_at);

-- Opportunity indexes
CREATE INDEX idx_opportunities_organization_id ON opportunities(organization_id);
CREATE INDEX idx_opportunities_contact_id ON opportunities(primary_contact_id);
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_created_at ON opportunities(created_at);
CREATE INDEX idx_opportunities_deleted_at ON opportunities(deleted_at);

-- Interaction indexes
CREATE INDEX idx_interactions_opportunity_id ON interactions(opportunity_id);
CREATE INDEX idx_interactions_contact_id ON interactions(contact_id);
CREATE INDEX idx_interactions_date ON interactions(interaction_date);
CREATE INDEX idx_interactions_type ON interactions(interaction_type);
CREATE INDEX idx_interactions_deleted_at ON interactions(deleted_at);
```

#### Search Optimization
```sql
-- Trigram extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN indexes for full-text search
CREATE INDEX idx_organizations_name_gin ON organizations USING gin(name gin_trgm_ops);
CREATE INDEX idx_contacts_name_gin ON contacts USING gin((first_name || ' ' || last_name) gin_trgm_ops);
```

## Security Implementation

### Row Level Security (RLS)
All tables have RLS enabled with policies for authenticated users:

```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Users can access their assigned data" ON organizations
  FOR ALL USING (auth.uid() IS NOT NULL);
```

### Authentication Security
- **JWT tokens**: Automatic refresh with Supabase
- **Session management**: Persistent across browser refreshes
- **Route protection**: All CRM routes require authentication
- **Password requirements**: Enforced by Supabase Auth

## API Endpoints

### Supabase REST API
The system uses Supabase's auto-generated REST API:

```typescript
// Organizations
GET    /rest/v1/organizations
POST   /rest/v1/organizations
PATCH  /rest/v1/organizations?id=eq.{id}
DELETE /rest/v1/organizations?id=eq.{id}

// Contacts  
GET    /rest/v1/contacts
POST   /rest/v1/contacts
PATCH  /rest/v1/contacts?id=eq.{id}
DELETE /rest/v1/contacts?id=eq.{id}

// Products
GET    /rest/v1/products
POST   /rest/v1/products
PATCH  /rest/v1/products?id=eq.{id}
DELETE /rest/v1/products?id=eq.{id}

// Opportunities
GET    /rest/v1/opportunities
POST   /rest/v1/opportunities
PATCH  /rest/v1/opportunities?id=eq.{id}
DELETE /rest/v1/opportunities?id=eq.{id}

// Interactions
GET    /rest/v1/interactions
POST   /rest/v1/interactions
PATCH  /rest/v1/interactions?id=eq.{id}
DELETE /rest/v1/interactions?id=eq.{id}
```

### Custom Hooks
```typescript
// Data fetching hooks
useOrganizations() - Fetch all organizations
useContacts() - Fetch all contacts
useProducts() - Fetch all products
useOpportunities() - Fetch all opportunities
useInteractions() - Fetch all interactions

// Mutation hooks
useCreateOrganization() - Create new organization
useUpdateOrganization() - Update organization
useDeleteOrganization() - Soft delete organization
```

## Component Architecture

### Directory Structure
```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard components
│   ├── organizations/   # Organization management
│   ├── contacts/        # Contact management
│   ├── products/        # Product management
│   ├── opportunities/   # Opportunity management
│   ├── interactions/    # Interaction logging
│   └── layout/          # Layout components
├── contexts/            # React contexts
├── hooks/               # Custom hooks
├── lib/                 # Utilities and configurations
├── pages/               # Page components
└── types/               # TypeScript type definitions
```

### Key Components

#### Authentication System
```typescript
// AuthContext.tsx - Authentication state management
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

// ProtectedRoute.tsx - Route protection
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
```

#### Data Management
```typescript
// Custom hooks with React Query
export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .is('deleted_at', null)
        .order('name')
      
      if (error) throw error
      return data
    }
  })
}
```

## Development Workflow

### Local Development Setup
```bash
# Clone repository
git clone <repository-url>
cd CRM

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build Process
```bash
# TypeScript type checking
npx tsc --noEmit

# ESLint validation
npm run lint

# Production build
npm run build

# Preview production build
npm run preview
```

## Deployment Guide

### Production Environment Setup

1. **Supabase Production Project**
   - Create production Supabase project
   - Apply database migrations
   - Configure RLS policies
   - Set up authentication providers

2. **Frontend Deployment (Vercel)**
   ```bash
   # Deploy to Vercel
   vercel --prod
   
   # Set environment variables in Vercel dashboard:
   VITE_SUPABASE_URL=<production_url>
   VITE_SUPABASE_ANON_KEY=<production_key>
   ```

3. **Domain Configuration**
   - Configure custom domain in Vercel
   - Set up SSL certificate (automatic)
   - Configure DNS records

### CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Performance Optimization

### Performance Tools & Utilities

The CRM includes comprehensive performance optimization tools:

#### Query Optimizations (`/src/lib/query-optimizations.ts`)
```typescript
// Optimized query client for CRM workload
const queryClient = createOptimizedQueryClient()

// Batch operations for related data
const results = useBatchOptimizedQueries([
  { queryKey: ['organizations'], queryFn: fetchOrganizations },
  { queryKey: ['contacts'], queryFn: fetchContacts }
])

// Smart prefetching for workflows
const { prefetchRelatedData } = usePrefetchRelatedData()
prefetchRelatedData('organization', organizationId)
```

#### Component Optimizations (`/src/lib/performance-optimizations.ts`)
```typescript
// Virtual scrolling for large datasets
const { visibleItems } = useVirtualScrolling(items, 50, 400)

// Debounced search with caching
const { results } = useCachedSearch(searchFunction, query)

// Optimized form submissions
const { handleSubmit, isSubmitting } = useOptimizedFormSubmit(submitFn)
```

#### Performance Analysis
```bash
# Run performance analysis
npm run optimize:performance

# Bundle analysis
npm run analyze

# Performance validation
npm run validate:performance
```

### State Management Optimization

#### Server State (TanStack Query)
- Aggressive caching (5min stale time, 30min cache time)
- Request deduplication and batching
- Background refetching optimization
- Optimistic updates with rollback

#### Client State (Zustand)  
- Granular subscriptions prevent unnecessary re-renders
- Lightweight state management for UI preferences
- Local state persistence where appropriate

## Performance Monitoring

### Key Metrics to Monitor
- **Page Load Time**: Target <3 seconds
- **Database Query Performance**: Target <500ms
- **API Response Times**: Target <200ms
- **Error Rates**: Target <1%
- **User Session Duration**: Monitor engagement

### Monitoring Tools
- **Vercel Analytics**: Page performance and user metrics
- **Supabase Dashboard**: Database performance and queries
- **Sentry** (optional): Error tracking and performance monitoring

## Maintenance & Operations

### Database Maintenance
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('postgres'));

-- Analyze query performance
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Update table statistics
ANALYZE organizations;
ANALYZE contacts;
ANALYZE products;
ANALYZE opportunities;
ANALYZE interactions;
```

### Backup Procedures
- **Automated Backups**: Supabase handles automatic daily backups
- **Manual Backup**: Use Supabase dashboard or CLI
- **Point-in-time Recovery**: Available through Supabase

### User Management
```sql
-- Create new user (via Supabase Auth dashboard)
-- Assign user to organization (if implementing multi-tenancy)
-- Revoke access (disable user in Supabase Auth)
```

### Security Audits
- Regular review of RLS policies
- Monitor authentication logs
- Update dependencies monthly
- Review API access patterns

## Troubleshooting

### Common Issues

**Authentication Problems**
- Check Supabase project URL and anon key
- Verify RLS policies allow user access
- Clear browser cache and cookies

**Database Performance Issues**  
- Check query execution plans
- Verify indexes are being used
- Monitor connection pool usage

**Build/Deployment Failures**
- Verify all environment variables are set
- Check TypeScript compilation errors
- Ensure all dependencies are installed
- Run `npm run validate` before deployment

**Mobile/Responsive Issues**
- Test on actual devices
- Use browser dev tools to simulate viewports
- Check touch target sizes (minimum 44px)

**Architecture Issues**
- Run `npm run lint:architecture` to validate structure
- Check component organization in feature directories
- Verify state management patterns (TanStack Query vs Zustand)
- Use development assistant: `npm run dev:assist analyze`

### Debug Mode
```typescript
// Enable React Query devtools in development
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Add debug logging for Supabase
const supabase = createClient(url, key, {
  auth: {
    debug: process.env.NODE_ENV === 'development'
  }
})
```

## Support & Maintenance Contacts

- **Technical Issues**: System Administrator
- **User Training**: Sales Manager Lead
- **Database Issues**: Database Administrator
- **Deployment Issues**: DevOps Team

---

*This technical guide provides comprehensive information for developers and administrators maintaining the KitchenPantry CRM system.*