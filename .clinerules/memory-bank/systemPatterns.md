# System Patterns

## System Architecture

The application follows a client-server architecture. The frontend is a single-page application (SPA) built with React, and the backend is powered by Supabase, which provides a Postgres database, authentication, and auto-generated APIs.

## Key Technical Decisions

- **Frontend Framework:** React with Vite for a fast development experience.
- **Styling:** Tailwind CSS for a utility-first styling approach.
- **State Management:** Zustand for lightweight and simple state management.
- **Data Fetching:** React Query for efficient data fetching, caching, and synchronization.

## Component Relationships

Components are organized by feature, with shared components in a common directory. The main components include a dashboard, contact list, organization list, and opportunity pipeline view.
