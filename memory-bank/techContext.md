# Tech Context

## Technologies Used

- **Frontend:**
  - React 18
  - TypeScript
  - Vite
  - Tailwind CSS
  - Zustand
  - React Query
- **Backend:**
  - Supabase (Postgres, Auth, Storage)
- **Testing:**
  - Vitest
  - React Testing Library
  - Playwright for E2E tests

## Development Setup

1.  Clone the repository.
2.  Install dependencies with `pnpm install`.
3.  Set up Supabase environment variables in a `.env` file.
4.  Run the development server with `pnpm dev`.

## Technical Constraints

- All database interactions must go through the Supabase API.
- Row-Level Security (RLS) must be enforced for all tables.
- The application must be deployable on Vercel.
