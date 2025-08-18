# KitchenPantry CRM Documentation

Welcome to the comprehensive documentation for KitchenPantry CRM. This system is built specifically for Master Food Brokers in the food service industry.

## 📚 Documentation Navigation

### 🚀 Getting Started
New developer onboarding - start here:
- **[Main README](../README.md)** - Project overview and 30-second quick start
- **[Setup Guide](getting-started/setup.md)** - Complete development environment setup
- **[First Contribution](getting-started/first-contribution.md)** - Step-by-step contribution guide
- **[Troubleshooting](getting-started/troubleshooting.md)** - Common setup issues and solutions

### 📖 Essential Guides
Core documentation for daily development:
- **[Contributing Guide](../CONTRIBUTING.md)** - Development workflow and standards
- **[Development Workflow](guides/development-workflow.md)** - Quality gates and Git workflow
- **[Form Development](guides/form-development.md)** - React Hook Form patterns and optimization
- **[Performance Guide](guides/performance.md)** - Database and frontend optimization

### 👥 User Documentation
For sales managers and end users:
- **[User Guide](USER_GUIDE.md)** - Complete workflows for sales managers
- **[Feature Overview](USER_GUIDE.md#core-workflows)** - Organization, contact, and opportunity management

### 🏗️ Architecture
System design and technical decisions:
- **[Architecture Overview](architecture/overview.md)** - High-level system architecture
- **[Implementation Details](architecture/implementation.md)** - Technical implementation patterns
- **[Architecture Decisions](architecture/decisions.md)** - Key architectural decision records (ADR)
- **[Database Schema](DATABASE_SCHEMA.md)** - Complete database design

### 🔧 Technical Reference
For developers and system administrators:
- **[Technical Guide](TECHNICAL_GUIDE.md)** - Comprehensive API and technical reference
- **[Coding Rules](Coding_Rules.md)** - 10 essential development rules
- **[MCP Tool Reference](MCP_TOOL_REFERENCE_GUIDE.md)** - MCP tools and usage patterns

### 🚀 Deployment & Production
Live system documentation:
- **[Production Deployment](PRODUCTION_DEPLOYMENT_GUIDE.md)** - Complete deployment process
- **[Monitoring Setup](deployment/monitoring.md)** - Production monitoring and alerts
- **[Architecture Summary](architecture/ARCHITECTURE_SUMMARY.md)** - Production architecture overview

### 📊 Testing & Quality
Quality assurance and testing documentation:
- **[Quality Gates](QUALITY_GATES_DOCUMENTATION.md)** - Development quality standards
- **[Testing Reports](testing/)** - Comprehensive test results and reports

### 🚀 Production & Deployment
Live system documentation:
- **[Production Deployment](PRODUCTION_DEPLOYMENT_GUIDE.md)** - Complete deployment process
- **[Monitoring Setup](deployment/monitoring.md)** - Production monitoring and alerts
- **[Production Status](../README.md#production-urls)** - Live URLs and status

### 📝 Templates & Examples
Reusable code and documentation templates:
- **[Code Examples](examples/)** - Complete component examples
- **[Query Templates](templates/mcp-query-templates.md)** - MCP query patterns
- **[Form Templates](templates/optimized-form-templates.md)** - Optimized form patterns

### ✅ Checklists
Completed implementation checklists:
- **[Excel Migration Checklist](checklists/excel-to-postgresql-migration.md)** - ✅ Complete
- **[Contact Form Conversion](checklists/Contact_Form_Vue_to_React_Conversion_Checklist.md)** - ✅ Complete
- **[MVP Implementation](checklists/KitchenPantry_CRM_MVP_Implementation_Checklist.md)** - ✅ Complete

### 🆘 Troubleshooting
Common issues and solutions:
- **[Setup Troubleshooting](getting-started/troubleshooting.md)** - Development setup issues
- **[General Troubleshooting](../README.md#troubleshooting)** - Top 5 common issues
- **[Organization Creation Issues](troubleshooting/ORGANIZATION_CREATION_TROUBLESHOOTING.md)** - Specific CRM issues

## 📊 Project Status

### ✅ Completed Features
- **5 Core CRM Entities** - Organizations, Contacts, Products, Opportunities, Interactions
- **Authentication System** - Supabase Auth with RLS
- **Real-time Dashboard** - Principal cards and activity feeds
- **Excel Import** - CSV upload functionality
- **Production Deployment** - Live at https://crm.kjrcloud.com
- **Mobile Optimization** - iPad-first responsive design

### 🎯 Key Metrics
- **Testing Confidence**: 95%+ across all major features
- **Database Performance**: Sub-5ms query response times
- **Mobile Performance**: Optimized for iPad field sales teams
- **Production Uptime**: 99.9% availability target

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **State Management**: React Query + Context API
- **Deployment**: Vercel (Frontend) + Supabase (Backend)
- **Testing**: Playwright + Manual UAT
- **Architecture**: 14-agent specialized development system

## 📞 Quick Links

- **Live Application**: https://crm.kjrcloud.com
- **GitHub Repository**: https://github.com/krwhynot/CRM
- **Supabase Dashboard**: Project ID `ixitjldcdvbazvjsnkao`

---

*This documentation is continuously updated to reflect the current state of the KitchenPantry CRM system.*