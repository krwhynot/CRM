# KitchenPantry CRM

A modern CRM system built for the food service industry, specifically designed for Master Food Brokers. Built with React, TypeScript, and shadcn/ui components with a specialized agent-based architecture for CRM development.

## 🚀 Quick Start (30 seconds)
```bash
# Clone repository
git clone https://github.com/krwhynot/CRM.git
cd CRM

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see your CRM application.

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher  
- **Supabase account** (free tier works)

## 🛠️ Installation

### 1. Clone and Install
```bash
git clone https://github.com/krwhynot/CRM.git
cd CRM
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NODE_ENV=development
```

### 3. Database Setup
The database schema is automatically handled by Supabase migrations. See [Database Schema](docs/database.md) for details.

### 4. Start Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linting
npm run preview      # Preview production build
```

## 🏗️ Project Structure

This codebase contains one main application:
- **Root Vite App** (`/src/`): Primary React + TypeScript + Vite application with shadcn/ui components

```
src/
├── components/           # React components organized by function
│   ├── ui/              # shadcn/ui primitives (Button, Input, etc.)
│   ├── forms/           # Form components and builders
│   ├── data-table/      # Data table with filtering and expansion
│   ├── layout/          # Page layout and container components
│   ├── app/             # Dashboard and app-level components
│   └── dashboard/       # KPI cards, charts, and dashboard widgets
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and shared functions
├── types/               # TypeScript type definitions
docs/                    # Architecture and development documentation
```

### Component Architecture

**Simplified Component Structure (Architecture Refactor)**:
- **`/components/ui/`** - shadcn/ui primitives and basic building blocks
- **`/components/forms/`** - Complete form system with validation and entity-specific forms
- **`/components/data-table/`** - Advanced data tables with responsive filtering, sorting, and expandable rows
- **`/components/layout/`** - Page layouts, containers, and structural components
- **`/components/app/`** - Dashboard widgets, charts, and app-level UI components

**Responsive Filter System**:
- **ResponsiveFilterWrapper** - Smart filter wrapper that adapts between mobile drawer, tablet sheet, and desktop inline modes
- **FilterLayoutProvider** - Device-aware context for responsive filter layouts
- **EntityFilters** - Unified filter component with touch optimizations and responsive grid layouts

## 🗃️ Database Entities

The system is built around 5 core CRM entities:
- **Organizations** - Companies/businesses in the food service industry
- **Contacts** - Individual people within organizations  
- **Products** - Food items being sold/distributed
- **Opportunities** - Sales opportunities and deals
- **Interactions** - Communication history and touchpoints

Full schema documentation: [Database Schema](docs/database.md)

## 🛡️ Tech Stack

- **React 18** with TypeScript in strict mode
- **Vite** as build tool with `@vitejs/plugin-react`
- **shadcn/ui** component library with "new-york" style
- **Tailwind CSS** with CSS variables and "slate" base color
- **Radix UI** primitives for accessibility
- **Supabase** for database and authentication

## 🚀 Development Commands

### Root Application (Primary)
```bash
npm run dev        # Development server
npm run build      # Build for production  
npm run lint       # Lint code
npm run preview    # Preview production build
npx tsc --noEmit   # Type checking
```


## 🎯 Key Features

### ✅ Production-Ready Features
- **5 Core Entities**: Organizations, Contacts, Products, Opportunities, Interactions
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **Business Logic**: Database constraints, validation triggers
- **Responsive Filtering**: Smart adaptive filters with mobile drawer, tablet sheet, and desktop inline modes
- **Mobile-Optimized**: iPad-focused responsive design for field sales with orientation-aware behavior
- **Performance**: Sub-5ms database queries, <3s page loads
- **Search**: Full-text search with trigram indexing
- **Dashboard**: Clean minimal interface ready for customization
- **Excel Import**: Complete Excel to PostgreSQL migration functionality

### 🎯 Production Status
**MVP is production-ready** - All testing phases completed with >90% confidence
- **Live Production URL**: https://crm.kjrcloud.com
- **Testing Coverage**: Database (95%), UI/UX (88%), Auth (94%), Performance (100%)

## 📚 Documentation

### 📖 Essential Documentation
- **[Complete Documentation Index](docs/)** - Full documentation navigation
- **[User Guide](docs/USER_GUIDE.md)** - Complete Sales Manager workflows  
- **[Technical Guide](docs/TECHNICAL_GUIDE.md)** - Developer reference and API docs
- **[Contributing Guide](CONTRIBUTING.md)** - Development setup and workflow
- **[Changelog](CHANGELOG.md)** - Version history and notable changes

### 🏗️ Architecture & Development
- **[Architecture Guide](docs/architecture/overview.md)** - System design and decisions
- **[Database Schema](docs/DATABASE_SCHEMA.md)** - Complete database design
- **[Coding Rules](docs/Coding_Rules.md)** - 10 essential development rules
- **[State Management Guide](docs/STATE_MANAGEMENT_GUIDE.md)** - Client/server state patterns
- **[Responsive Filters Guide](docs/guides/responsive-filters.md)** - Complete ResponsiveFilterWrapper implementation guide

### 🚀 Production & Deployment
- **[Production Deployment Guide](docs/PRODUCTION_DEPLOYMENT_GUIDE.md)** - Complete deployment process
- **[Performance Guide](docs/guides/performance.md)** - Database and frontend optimization
- **[Testing Reports](docs/testing/)** - Comprehensive validation results

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development setup and workflow
- Code style and TypeScript standards  
- Pull request guidelines
- Testing requirements

## 🔧 Configuration Files

- `components.json` - shadcn/ui configuration (new-york style, slate theme)
- `vite.config.ts` - Vite configuration with path aliases
- `tsconfig.json` - TypeScript strict mode configuration
- `.env.example` - Environment variables template

## 📊 Specialized Architecture

This project follows a 14-agent specialized architecture with MCP tools for different development phases:
- **Weeks 1-4**: Infrastructure setup (database, auth, basic CRUD)
- **Weeks 5-8**: Advanced features (search, activity feeds, validation)  
- **Weeks 9-12**: Dashboard and analytics
- **Weeks 13-16**: Production readiness and deployment

See [Agent Architecture](docs/CRM_AGENT_ARCHITECTURE.md) for detailed information.

## 🐛 Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/krwhynot/CRM/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/krwhynot/CRM/discussions)
- **Questions**: Check [docs/](docs/) first, then create an issue

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Production Ready**: This CRM system is live and serving Master Food Brokers at [https://crm.kjrcloud.com](https://crm.kjrcloud.com)
