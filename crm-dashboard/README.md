# CRM Dashboard (Next.js) - EXPERIMENTAL

**⚠️ Status: EXPERIMENTAL / NOT IN ACTIVE USE**

This is an experimental Next.js dashboard implementation that was created during early development exploration. The **primary CRM application** is built with **React + Vite** and is located in the root directory (`/src/`).

## Current Project Status

- **Main CRM**: Located in root directory (`/src/`) using React 18 + TypeScript + Vite ✅
- **This Dashboard**: Experimental Next.js implementation (not actively maintained) ⚠️

## Main CRM Application

The production-ready CRM is the **Vite + React application** in the root directory with:
- React 18 + TypeScript + Vite
- shadcn/ui + Radix UI + Tailwind CSS  
- Supabase PostgreSQL + Auth
- TanStack React Query for state management
- Production deployment live and validated

## Next.js Dashboard (This Directory)

This experimental dashboard was bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) for evaluation purposes.

### Running This Experimental Dashboard

```bash
cd crm-dashboard
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the experimental dashboard.

### Note

Development efforts are focused on the main React + Vite application. This Next.js dashboard serves as a reference implementation and is not maintained for production use.

## For Active Development

Work on the main CRM application in the root directory:

```bash
# From project root
npm run dev     # Starts the main React + Vite CRM application
npm run build   # Builds for production
npm run lint    # Runs linting
```
