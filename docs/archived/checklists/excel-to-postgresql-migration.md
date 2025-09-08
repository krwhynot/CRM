# Excel to PostgreSQL Migration Guide - Kitchen Pantry CRM

## 🚨 UPDATED: Simplified MVP Approach

**CRITICAL CHANGE**: The original plan was too complex and would cause immediate failure. This updated guide implements a **simplified MVP approach** that can be built in 1 week.

### Key Changes Made:
✅ **Manager fields**: Store as text (primary_manager_name, secondary_manager_name) - no UUID lookup  
✅ **Field mapping**: Hard-coded - no complex UI  
✅ **Validation**: Basic only (organization name required)  
✅ **Database changes**: Minimal (3 new text fields)  
✅ **Success criteria**: Realistic and achievable  

### What Was Removed:
❌ Account manager UUID mapping (too fragile)  
❌ 80% success rate promises (unrealistic)  
❌ Zero data loss guarantees (too complex)  
❌ Rollback capability (not needed for MVP)  
❌ Complex field mapping UI (slows development)  
❌ Duplicate detection (Phase 3 feature)  
❌ Import tracking tables (overengineering)  

**Result**: 4-hour implementation instead of 9+ hours, with much higher success probability.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Foundation](#technical-foundation)
3. [Business Context](#business-context)
4. [Data Architecture](#data-architecture)
5. [Pre-Migration Checklist](#pre-migration-checklist)
6. [Field Mapping Guide](#field-mapping-guide)
7. [Phase 1: Import-Export Page Implementation](#phase-1-import-export-page-implementation)
8. [Step-by-Step Import Process](#step-by-step-import-process)
9. [Validation & Troubleshooting](#validation--troubleshooting)
10. [Post-Migration Verification](#post-migration-verification)
11. [Next Steps](#next-steps)

---

## Project Overview

### What is Kitchen Pantry CRM?
Kitchen Pantry CRM is a specialized Customer Relationship Management system designed for **Master Food Brokers** in the food service industry. The system helps manage complex relationships between:
- **Principals** (manufacturers/suppliers of food products)
- **Distributors** (companies that distribute products to restaurants)
- **Customers** (restaurants, cafes, institutional food services)

### Why This Migration Matters
Many food brokers currently track relationships in Excel spreadsheets. While functional, Excel limitations include:
- No relationship tracking between entities
- Difficult data sharing among team members
- No audit trails or change history
- Limited search and reporting capabilities
- Risk of data loss or corruption

This CRM provides a structured, scalable, and secure database to manage these critical business relationships.

---

## Technical Foundation

### Technology Stack Overview
- **Frontend**: React 18 with TypeScript for type safety
- **Backend Database**: PostgreSQL 17 via Supabase
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Build Tool**: Vite for fast development
- **Authentication**: Supabase Auth with Row Level Security (RLS)

### Key Database Concepts You Need to Know

#### UUIDs (Universally Unique Identifiers)
- **What**: 128-bit identifiers like `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
- **Why**: Ensures global uniqueness across distributed systems
- **Benefit**: No ID conflicts when merging data from multiple sources

#### Soft Deletes
- **What**: Records marked as deleted (`deleted_at` timestamp) but not physically removed
- **Why**: Preserves data integrity and relationships
- **Benefit**: Enables data recovery and maintains audit trails

#### Row Level Security (RLS)
- **What**: Database-level security controlling data access per user
- **Why**: Ensures users only see data they're authorized to access
- **Benefit**: Multi-tenant security without complex application logic

#### Enum Types
- **What**: Predefined lists of valid values (e.g., priority: A, B, C, D)
- **Why**: Enforces data consistency and prevents invalid entries
- **Benefit**: Maintains data quality and enables reliable reporting

#### Audit Trails
- **What**: Automatic tracking of who created/updated records and when
- **Why**: Compliance and accountability requirements
- **Benefit**: Full history of data changes for business analysis

---

## Business Context

### Food Service Industry Relationships

#### The Principal-Distributor Model
1. **Principals** (Manufacturers)
   - Create food products (sauces, seasonings, specialty items)
   - Need distribution networks to reach restaurants
   - Hire food brokers to manage distributor relationships

2. **Distributors** (Wholesale Companies)
   - Purchase products from principals
   - Sell to restaurants, cafes, institutional buyers
   - Cover specific geographic territories
   - Have relationships with hundreds of customers

3. **Food Brokers** (You - the CRM users)
   - Represent multiple principals
   - Maintain relationships with distributors
   - Facilitate product placement and sales
   - Track performance and commissions

#### Territory Management
- Distributors typically have exclusive territories (e.g., "Chicago Metro", "Southeast Region")
- Principals may work with different distributors in different territories
- Food brokers must understand these territorial boundaries

#### Relationship Complexity
- One principal may work with 10+ distributors
- One distributor may carry 100+ principal products
- One food broker may represent 20+ principals
- Each relationship has unique terms, commissions, and requirements

---

## Data Architecture

### The 5 Core Entities

#### 1. Organizations
**Purpose**: Companies in the food service ecosystem
**Types**: 
- `principal` - Product manufacturers
- `distributor` - Wholesale distribution companies  
- `customer` - Restaurants, cafes, institutions
- `prospect` - Potential new customers
- `vendor` - Service providers

**Key Fields**:
- Basic info: name, address, contact details
- Business data: annual revenue, employee count, industry
- CRM data: priority (A-D), segment, notes
- Relationships: parent organization (for chains)

#### 2. Contacts
**Purpose**: Individual people within organizations
**Roles**:
- `decision_maker` - Has authority to make purchases
- `influencer` - Influences purchase decisions
- `buyer` - Executes purchase orders
- `end_user` - Uses the products
- `gatekeeper` - Controls access to decision makers
- `champion` - Advocates for your products

**Key Fields**:
- Personal: first name, last name, title, role
- Contact: email, phone, mobile, LinkedIn
- Business: department, purchase influence, decision authority

#### 3. Products
**Purpose**: Items manufactured by principals
**Categories**: beverages, dairy, frozen, fresh_produce, meat_poultry, seafood, dry_goods, spices_seasonings, baking_supplies, cleaning_supplies, paper_products, equipment

**Key Fields**:
- Product details: name, description, SKU, category
- Pricing: unit cost, list price, minimum order quantity
- Logistics: storage requirements, shelf life, seasonality
- Specifications: detailed product specifications

#### 4. Opportunities
**Purpose**: Sales opportunities and deals in progress
**Stages**: New Lead → Initial Outreach → Sample/Visit Offered → Awaiting Response → Feedback Logged → Demo Scheduled → Closed (Won/Lost)

**Key Fields**:
- Deal info: name, estimated value, probability, close date
- Relationships: organization, contact, principal, distributor
- Process: stage, next action, competition, decision criteria

#### 5. Interactions
**Purpose**: Communication history and touchpoints
**Types**: call, email, meeting, demo, proposal, follow_up, trade_show, site_visit, contract_review

**Key Fields**:
- Interaction details: type, subject, description, date, duration
- Follow-up: required flag, date, notes
- Relationships: contact, organization, opportunity
- Outcomes: results and next steps

---

## Pre-Migration Checklist

### 1. Data Preparation
- [ ] **Export Excel files to CSV format**
  - Use "Save As" → "CSV (Comma delimited)"
  - Ensure UTF-8 encoding to preserve special characters
  - One file per entity type (organizations, contacts, etc.)

- [ ] **Verify data integrity in source Excel files**
  - Check for merged cells (unmerge all)
  - Remove formatting, colors, and formulas
  - Ensure consistent data types in each column
  - Remove empty rows and columns

- [ ] **Back up original Excel files**
  - Create dated backup folder (e.g., `excel_backup_2024_01_15`)
  - Store in secure location separate from working files
  - Document version and date of backup

- [ ] **Clean up data quality issues**
  - Standardize phone number formats
  - Verify email address formats
  - Consistent state abbreviations (IL, IN, OH, etc.)
  - Remove duplicate entries
  - Fill in missing required fields where possible

### 2. Environment Preparation
- [ ] **Verify CRM system access**
  - Confirm login credentials work
  - Test database connectivity
  - Verify appropriate user permissions for data import

- [ ] **Prepare workspace**
  - Clear browser cache
  - Close unnecessary applications
  - Ensure stable internet connection
  - Have technical support contact information ready

### 3. Data Mapping Preparation
- [ ] **Review field mapping requirements** (see detailed mapping below)
- [ ] **Identify missing required fields** in Excel data
- [ ] **Prepare data transformation notes** for complex mappings
- [ ] **Plan for handling unmapped data** (custom fields, notes, etc.)

---

## Field Mapping Guide

### Organization Data Mapping (Primary Focus)

#### Excel → PostgreSQL Field Mappings (MVP Simplified)

| Excel Column | PostgreSQL Field | Type | Required | Notes |
|--------------|------------------|------|----------|-------|
| Organizations | `name` | text | ✓ | Primary organization name |
| PRIORITY-FOCUS (A-D) | `priority` | varchar | - | A=Highest, B=High, C=Medium, D=Low (default 'C') |
| SEGMENT | `segment` | text | - | Business segment (default 'General' if empty) |
| DISTRIBUTOR | `type` | enum | ✓ | Simple logic: Distributor → 'distributor', else → 'customer' |
| PRIMARY ACCT. MANAGER | `primary_manager_name` | text | - | Store as text - no UUID lookup |
| SECONDARY ACCT. MANAGER | `secondary_manager_name` | text | - | Store as text - no UUID lookup |
| LINKEDIN | `website` | text | - | LinkedIn profile URL |
| PHONE | `phone` | text | - | Primary phone number |
| STREET ADDRESS | `address_line_1` | text | - | Street address |
| CITY | `city` | text | - | City name |
| STATE | `state_province` | text | - | State abbreviation |
| Zip Code | `postal_code` | text | - | ZIP or postal code |
| NOTES | `notes` | text | - | Free-form notes and comments |
| (unmapped data) | `import_notes` | text | - | Store any unmapped Excel columns |

#### Segment Mapping Table

| Excel Segment | CRM Segment | Organization Type |
|---------------|-------------|------------------|
| Distributor | Distribution | distributor |
| Casual | Casual Dining | customer |
| Chain/Group Member | Chain Restaurant | customer |
| Ethnic | Ethnic Cuisine | customer |
| Pizza | Pizza Restaurant | customer |
| Fine Dining | Fine Dining | customer |
| Gastropub | Gastropub | customer |
| Caterer | Catering | customer |
| Education | Educational Institution | customer |
| (blank/empty) | Standard | customer |

#### Data Transformation Rules (MVP Simplified)

1. **Priority Mapping**: Direct mapping (A→A, B→B, C→C, D→D), default to 'C' if empty
2. **Organization Type Logic**:
   - If SEGMENT = "Distributor" → type = "distributor"
   - Everything else → type = "customer"
3. **Default Values**:
   - `country` = "US" (default for all records)
   - `is_active` = true
   - `segment` = "General" (if Excel segment is blank)
   - `priority` = "C" (if Excel priority is blank)
4. **Account Manager Handling**:
   - Store names as text in primary_manager_name/secondary_manager_name
   - No UUID lookup or user creation
   - Map to actual users in Phase 2

---

## CRITICAL MVP FIXES REQUIRED

### Issues with Original Plan
The original plan is **too complex for MVP** and will cause immediate failure:

❌ **Account Manager UUID Mapping**: Requires user lookup/creation - too fragile  
❌ **80% Success Rate Promise**: Unrealistic for messy Excel data  
❌ **Zero Data Loss Guarantee**: Adds massive complexity  
❌ **Rollback Capability**: Not needed for MVP  
❌ **Complex Field Mapping UI**: Slows development  
❌ **Duplicate Detection**: Add in Phase 3  
❌ **Import Tracking Tables**: Overengineering for MVP  

### MVP Database Changes (REQUIRED)
```sql
-- Add these fields to organizations table
ALTER TABLE organizations ADD COLUMN
    primary_manager_name TEXT,
    secondary_manager_name TEXT,
    import_notes TEXT;
```

### MVP Flow (Simplified)
1. **Upload CSV** (< 5MB limit)
2. **Parse & Preview** (show first 10 rows)  
3. **Click "Import"** with hard-coded mappings
4. **Process** all records with basic validation
5. **Show Results**: "X succeeded, Y failed with reasons"
6. **Done** - no rollback, no complex tracking

### What MVP MUST Have
✅ CSV upload (< 5MB)  
✅ Parse and show preview  
✅ Import basic fields only  
✅ Show success/failure count  
✅ List which rows failed and why  

### What MVP MUST NOT Have
❌ Account manager mapping  
❌ Duplicate detection  
❌ Rollback capability  
❌ Import tracking tables  
❌ Field mapping UI  
❌ Complex validation  
❌ Download error reports  

---

## Phase 1: Import-Export Page Implementation (Simplified)

### Development Tasks Overview

#### 1. Navigation Enhancement
**File**: `src/components/layout/AppSidebar.tsx`
**Task**: Add "Import/Export" menu item to sidebar navigation
**Icon**: Upload icon from lucide-react library
**Route**: `/import-export`

#### 2. Main Page Component
**File**: `src/pages/ImportExport.tsx`
**Purpose**: Main container page for import/export functionality
**Sections**:
- Page header with breadcrumbs
- Import section (primary focus)
- Export section (future enhancement)
- Import history/status

#### 3. CSV Import Components

##### OrganizationImporter Component
**File**: `src/components/import-export/OrganizationImporter.tsx`
**Features**:
- Drag-and-drop file upload
- File format validation (CSV only)
- File size limits (max 10MB)
- Initial CSV parsing with PapaParse
- Error handling for malformed files

##### ImportPreview Component  
**File**: `src/components/import-export/ImportPreview.tsx`
**Features**:
- Display parsed CSV data in table format
- Field mapping interface (Excel columns → DB fields)
- Data validation with error highlighting
- Preview of transformed data
- Mapping configuration persistence

##### ImportProgress Component
**File**: `src/components/import-export/ImportProgress.tsx`
**Features**:
- Real-time progress bar during import
- Batch processing status (e.g., "Processing batch 2 of 5")
- Success/error count tracking
- Detailed error reporting with row numbers
- Cancel import functionality

#### 4. Technical Dependencies

##### Required NPM Packages
```bash
npm install papaparse @types/papaparse
```

##### Database Functions
**File**: Add to Supabase database
**Function**: `bulk_insert_organizations()`
**Purpose**: Efficient batch insertion with proper validation and error handling

#### 5. Route Configuration
**File**: `src/App.tsx` (or routing configuration)
**Task**: Add route for `/import-export` page

#### 6. UI Components Integration
- Leverage existing shadcn/ui components
- Use `<Card>`, `<Button>`, `<Progress>`, `<Table>` components
- Maintain design consistency with existing pages
- Implement responsive design for mobile/tablet use

### Implementation Sequence (MVP Simplified)

1. **Setup Dependencies** (15 minutes)
   - Install PapaParse package
   - Add Import/Export route
   - Update sidebar navigation

2. **Add Database Fields** (15 minutes)
   - Add primary_manager_name, secondary_manager_name, import_notes to organizations table

3. **Create Basic Page Structure** (30 minutes)
   - Main ImportExport page component
   - Simple upload area

4. **File Upload Component** (1 hour)
   - CSV file upload with basic validation
   - File parsing with PapaParse
   - Simple error handling

5. **Data Preview** (30 minutes)
   - Display first 10 rows of parsed data
   - No mapping UI - hard-coded mappings

6. **Import Processing** (1 hour)
   - Direct database insert with hard-coded field mapping
   - Basic progress tracking
   - Simple success/failure reporting

7. **Testing** (30 minutes)
   - Test with sample organization CSV
   - Verify basic functionality works

**Total Time**: ~4 hours instead of 9+ hours

---

## Step-by-Step Import Process

### Using the Import-Export Page

#### Step 1: Access Import Page
1. Log into Kitchen Pantry CRM
2. Click "Import/Export" in the left sidebar navigation
3. Select "Organizations" tab (default focus for MVP)

#### Step 2: Upload CSV File
1. Click "Choose File" or drag CSV file into upload area
2. System validates file format and size
3. If valid, proceed to preview; if invalid, see error messages

#### Step 3: Review Data Preview
1. System displays first 10 rows of parsed data
2. Review column headers and data types
3. Check for any parsing errors highlighted in red
4. Verify data looks correct before proceeding

#### Step 4: Field Mapping (Hard-coded for MVP)
1. System uses pre-configured mappings:
   - Excel "Organizations" → Database "name"
   - Excel "PRIORITY-FOCUS" → Database "priority"
   - Excel "SEGMENT" → Database "segment"
   - Excel "PRIMARY ACCT. MANAGER" → Database "primary_manager_name"
   - Excel "SECONDARY ACCT. MANAGER" → Database "secondary_manager_name"
   - Basic address fields → corresponding database fields
2. All unmapped Excel columns → stored in "import_notes" field
3. No configuration UI needed - mappings are fixed

#### Step 5: Validate Data (Simplified)
1. Click "Validate Data" button
2. System checks all records for:
   - Required field completeness (organization name only)
   - Priority values (A, B, C, D - default to 'C' if invalid)
   - Basic data format (no complex validation)
3. Review validation report showing errors and warnings

#### Step 6: Process Import
1. If validation passes, click "Start Import"
2. Monitor progress bar and status messages
3. System processes records in batches of 100
4. Real-time feedback on success/error counts

#### Step 7: Review Results
1. Import completion summary showing:
   - Total records processed
   - Successfully imported count
   - Error count with details
2. Download error report for failed records
3. Option to retry failed records after corrections

---

## Validation & Troubleshooting

### Common Data Issues and Solutions

#### Issue: Priority Values Not A, B, C, or D
**Error**: "Invalid priority value: 'A+' in row 15"
**Solution**: 
- Update Excel to use only A, B, C, D values
- A+ should become A
- Empty cells default to C
- Any other values must be manually corrected

#### Issue: Duplicate Organization Names
**Error**: "Duplicate organization name: 'ABC Restaurant' in rows 23, 45"
**Solution**:
- Review Excel for exact duplicate entries
- Merge information if same organization
- Add distinguishing details if different (e.g., location)
- Consider using parent-child relationships for chains

#### Issue: Invalid Email Formats
**Error**: "Invalid email format: 'john@company' in row 8"
**Solution**:
- Ensure all emails have proper format (user@domain.com)
- Remove entries that are not valid email addresses
- Use organization phone/address for contact if email unavailable

#### Issue: Missing Required Fields
**Error**: "Missing required field 'name' in row 12"
**Solution**:
- Organization name is always required
- Fill in missing organization names from other columns
- Skip records that cannot be identified
- Use "Unknown Organization" as placeholder if necessary

#### Issue: Account Manager Data (MVP Approach)
**Handling**: Store manager names as text fields
**Solution**:
- Names stored in primary_manager_name/secondary_manager_name fields
- No validation or user lookup required
- Map to actual users in Phase 2 after MVP is working

### Technical Troubleshooting

#### Issue: CSV File Won't Upload
**Possible Causes**:
- File too large (>10MB limit)
- Not saved as CSV format
- Contains binary data or special characters
**Solutions**:
- Split large files into smaller chunks
- Re-save Excel as CSV (UTF-8)
- Remove special formatting and characters

#### Issue: Import Process Hangs or Fails
**Possible Causes**:
- Network connection issues
- Database connection timeout
- Large batch size overwhelming system
**Solutions**:
- Check internet connection stability
- Reduce batch size in import settings
- Contact technical support if problem persists

#### Issue: Data Not Appearing in CRM
**Possible Causes**:
- Row Level Security (RLS) policies blocking access
- Import completed but page not refreshed
- Records imported as soft-deleted
**Solutions**:
- Refresh browser page
- Check with administrator about data access permissions
- Verify import log for actual completion status

---

## Post-Migration Verification

### Data Integrity Checks

#### 1. Record Count Verification
- [ ] **Compare total counts**: Excel rows vs. database records
- [ ] **Account for filtered data**: Exclude header rows and empty rows
- [ ] **Verify no unexpected duplicates** created during import

#### 2. Data Quality Spot Checks
- [ ] **Random sample verification**: Check 10-20 records manually
- [ ] **Required field completeness**: Ensure no null values in required fields
- [ ] **Enum value validation**: Confirm priority and segment values are correct
- [ ] **Relationship integrity**: Verify foreign key relationships are intact

#### 3. Business Logic Validation
- [ ] **Priority distribution**: Ensure reasonable spread of A/B/C/D priorities
- [ ] **Geographic distribution**: Verify addresses and states look correct
- [ ] **Account manager assignments**: Confirm manager assignments are logical

### User Acceptance Testing

#### 1. Search and Filter Testing
- [ ] **Name search**: Search for known organization names
- [ ] **Priority filtering**: Filter by different priority levels
- [ ] **Location filtering**: Filter by city, state, region
- [ ] **Segment filtering**: Filter by business segments

#### 2. User Interface Testing
- [ ] **Organization list display**: Verify all columns show correctly
- [ ] **Detail view access**: Click into organization details
- [ ] **Edit functionality**: Test editing organization information
- [ ] **Mobile responsiveness**: Test on tablet/mobile devices

#### 3. Reporting and Analytics
- [ ] **Dashboard metrics**: Verify organization counts update correctly
- [ ] **Activity feeds**: Check that imported organizations appear
- [ ] **Export functionality**: Test exporting filtered organization lists

### Performance Verification

#### 1. Page Load Times
- [ ] **Organization list**: Should load in <3 seconds
- [ ] **Search results**: Should return in <2 seconds
- [ ] **Detail pages**: Should load in <1 second

#### 2. Database Performance
- [ ] **Query optimization**: Verify indexes are working
- [ ] **Memory usage**: Check for memory leaks with large datasets
- [ ] **Concurrent access**: Test multiple users accessing data simultaneously

---

## Simplified MVP Benefits

### Why This Approach Works Better

#### For Users
- **Fast implementation** - working import in 1 week
- **Simple operation** - upload CSV and import immediately
- **Clear feedback** - see exactly what succeeded/failed
- **Data preserved** - unmapped data stored in notes field
- **Iterative improvement** - add complexity in future phases

#### For Developers
- **Minimal schema changes** - only add text fields and import_notes
- **Clean architecture maintained** - no complex tracking tables
- **Focused scope** - basic import functionality only
- **Future-proof design** - easy to extend with manager mapping later

#### For Business
- **Faster time to value** - immediate import capability
- **Reduced development risk** - simple, achievable goals
- **Data preserved** - nothing lost, can be improved later
- **Scalable foundation** - ready for Phase 2 enhancements

### Success Metrics for MVP

#### Import Performance
✅ Process 500 records in under 30 seconds  
✅ Handle files up to 5MB  
✅ Basic validation (organization name required only)  
✅ Clear success/failure reporting  

#### Data Quality
✅ Required field validation (name only)  
✅ No system crashes  
✅ All data preserved (unmapped → import_notes)  
✅ Manager names stored as text for future mapping

#### User Experience
✅ Upload → Import in under 3 minutes  
✅ Clear progress indicators  
✅ Simple error messages with row numbers  
✅ No complex configuration required  

---

## Next Steps

### Phase 2: Manager Mapping (After MVP Works)
- Add user management system
- Map manager names to user accounts
- Update organizations with proper created_by/updated_by UUIDs
- Remove text manager fields after successful mapping

### Phase 3: Enhanced Validation
- Add duplicate detection
- Implement segment validation
- Add data quality scoring
- Enhanced error reporting with downloadable reports

### Phase 4: Import Tracking
- Add import_batches table
- Implement rollback capability
- Track import history and metrics
- Add audit trails

### Phase 5: Extended Import Capabilities
- Contact data import
- Product data import  
- Opportunity data import
- Multi-entity imports

### Phase 6: Advanced Features
- Data export functionality
- Real-time sync capabilities
- Automated data quality monitoring
- API integration for external systems

### Ongoing Maintenance

#### Regular Data Quality Reviews
- Monthly data audits
- Duplicate detection and cleanup
- Validation rule updates
- User training and documentation updates

#### System Optimization
- Performance monitoring and tuning
- Index optimization based on usage patterns
- Backup and disaster recovery testing
- Security review and updates

#### User Support and Training
- User feedback collection and analysis
- Training material updates
- Best practices documentation
- Technical support process improvement

---

## Support and Resources

### Technical Support
- **Primary Contact**: [Your Technical Lead]
- **Database Issues**: [Database Administrator]
- **User Access**: [System Administrator]
- **Training Questions**: [Training Coordinator]

### Documentation References
- **User Guide**: `/docs/USER_GUIDE.md`
- **Technical Guide**: `/docs/TECHNICAL_GUIDE.md` 
- **API Documentation**: `/docs/api/`
- **Database Schema**: `/docs/database/`

### Emergency Procedures
- **Data Recovery**: Contact database administrator immediately
- **System Outage**: Check status page and contact technical support
- **Security Issues**: Contact security team immediately
- **Critical Bugs**: Use priority support channel

---

*This guide is a living document. Please update it as the system evolves and new requirements are identified.*

**Last Updated**: [Current Date]  
**Document Version**: 1.0  
**Next Review Date**: [Date + 3 months]