# KitchenPantry CRM - Development Requirements Document

**Version:** 1.0  
**Date:** January 2025  
**Target:** Development Team (1-2 developers)  
**Timeline:** 3-6 months MVP launch

---

## 1. Project Overview

### 1.1 Purpose
Build a relationship-focused CRM web application for Sales Managers to track principal-distributor-customer relationships in the food service industry.

### 1.2 Success Criteria
- **MVP Launch:** 3-6 months
- **Initial Users:** 5-10 Sales Managers
- **Platform:** Web application (mobile-responsive)
- **Core Function:** CRUD operations + simple reporting dashboard

---

## 2. User Requirements

### 2.1 Single User Type
- **Sales Manager** (also called Account Manager)
- Full access to assigned principals and their data
- No complex role management required

### 2.2 User Scale
- Initial deployment: 5-10 Sales Managers
- Each manages 8-12 principals on average
- Concurrent usage: 3-5 users during business hours

---

## 3. Core Entities & Data Model

### 3.1 Organizations
**Purpose:** Companies (customers, principals, distributors)
```
- name (required)
- priority (A+, A, B, C, D)
- status (Prospect, Active, Inactive)
- segment (industry category)
- is_principal (boolean)
- is_distributor (boolean)
- address fields
- notes
```

### 3.2 Contacts
**Purpose:** People within organizations
```
- first_name, last_name (required)
- organization_id (required)
- position, email, phone
- is_primary_contact (boolean)
- notes
```

### 3.3 Products
**Purpose:** Items owned by principals
```
- name (required)
- principal_id (required)
```

### 3.4 Opportunities
**Purpose:** Sales pipeline tracking (first interaction)
```
- name (required)
- organization_id, primary_contact_id (required)
- stage (New Lead → Closed Won/Stalled/No Fit)
- context (Food Show, Cold Call, Referral)
- notes
```

### 3.5 Interactions
**Purpose:** Follow-up activities after opportunity creation
```
- opportunity_id, contact_id (required)
- interaction_type (Email, Call, Demo, etc.)
- interaction_date
- notes
```

---

## 4. Required Features

### 4.1 CRUD Operations
**Organizations:**
- Create, read, update, delete organizations
- Filter by principal/distributor status
- Search by name or segment

**Contacts:**
- Create, read, update, delete contacts
- Link to organizations
- Mark primary contact per organization

**Products:**
- Create, read, update, delete products
- Associate with principals only

**Opportunities:**
- Create, read, update, delete opportunities
- Multi-step form (organization → products → details)
- Stage progression tracking

**Interactions:**
- Create, read, update, delete interactions
- Link to opportunities and contacts
- Chronological activity feed

### 4.2 Simple Reporting Dashboard
**Principal Overview Cards:**
- Principal name and status
- Number of opportunities
- Number of interactions
- Last activity date

**Basic Metrics:**
- Total principals by status
- Opportunities by stage
- Recent activity summary

**Activity Feed:**
- Recent opportunities and interactions
- Filterable by date range
- Sortable by activity type

---

## 5. Technical Requirements

### 5.1 Technology Stack
- **Frontend:** React 18 + TypeScript + Vite
- **UI Components:** shadcn/ui + Radix UI + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **Forms:** React Hook Form + Yup validation
- **State Management:** TanStack React Query
- **Routing:** React Router DOM

### 5.2 Database Design
- PostgreSQL with Supabase
- ENUM types for dropdowns
- Foreign key relationships
- Basic indexing for performance

### 5.3 Authentication
- **Basic login/logout only**
- Supabase Auth integration
- Session management
- No complex user management

### 5.4 Performance Targets
- Page load time: < 3 seconds
- Database queries: < 500ms
- Support 10 concurrent users

---

## 6. User Interface Requirements

### 6.1 Layout
- Responsive web design (desktop + mobile browser ipad ideal)
- Navigation sidebar with main sections
- Clean, professional appearance

### 6.2 Core Pages
1. **Dashboard** - Principal overview cards + metrics
2. **Organizations** - List/grid view with search/filter
3. **Contacts** - List view with organization links
4. **Opportunities** - Pipeline view with stage columns
5. **Products** - Simple list grouped by principal

### 6.3 Forms
- Multi-step opportunity creation
- Inline editing for quick updates
- Validation for required fields
- Auto-save for long forms

---

## 7. Development Phases

### Phase 1 (Weeks 1-4): Foundation
- Database schema setup
- Basic authentication
- Core entity CRUD operations
- Simple list/detail views

### Phase 2 (Weeks 5-8): Features
- Multi-step opportunity forms
- Interaction logging
- Basic search and filtering
- Principal-product relationships

### Phase 3 (Weeks 9-12): Dashboard
- Principal overview cards
- Simple metrics calculation
- Activity feed
- Basic reporting

### Phase 4 (Weeks 13-16): Polish
- UI/UX improvements
- Performance optimization
- Testing and bug fixes
- Deployment preparation

---

## 8. Out of Scope (Future Phases)

### 8.1 Excluded from MVP
- Voice integration
- Photo capture
- Push notifications
- Full offline functionality
- Email integration
- Scheduled reports
- Advanced analytics
- Mobile native app

### 8.2 Future Considerations
- Mobile app development
- Advanced reporting
- Integration capabilities
- User management features

---

## 9. Success Metrics

### 9.1 Technical Metrics
- Zero critical bugs at launch
- < 3 second page load times
- 99% uptime during business hours

### 9.2 User Metrics
- 5-10 Sales Managers onboarded
- Daily active usage by 80% of users
- Positive feedback on core workflows

---

## 10. Development Team Guidance

### 10.1 Team Size
- 1-2 developers maximum
- Full-stack capabilities preferred
- React + TypeScript + Supabase experience helpful

### 10.2 Development Approach
- Start with database schema
- Build core CRUD first
- Add dashboard features last
- Focus on simplicity over complexity

### 10.3 Key Decisions
- Use existing Supabase project structure
- Leverage React 18 + TypeScript patterns
- Implement responsive design from start
- Keep security model simple

**📋 PROJECT STATUS: MVP COMPLETED ✅**
- All phases (1-4) successfully completed
- Production deployment live and validated
- Performance benchmarks exceeded
- 95%+ confidence across all testing categories

