# Resume Craft

Modern resume builder with real-time preview, job tracking, and persistent storage.

## Features

- **Dashboard**: Manage multiple resumes with ease.
- **Modern Editor**: Live preview with multiple professional templates.
- **Job Tracker**: Track applications, status, and associated resumes.
- **Persistence**: Hybrid storage using SQLite (backend) and localStorage (local drafts).
- **Export**: Print-friendly layouts ready for PDF generation.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Initialize the database:
   ```bash
   mkdir -p data
   npm run db:push
   npm run seed # Optional: seed with sample data
   ```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`.

## Architecture

- **Frontend**: React, Tailwind CSS, Shadcn UI, TanStack Query, Wouter.
- **Backend**: Express, Drizzle ORM, SQLite.
- **Contracts**: Shared Zod schemas in `shared/` for type-safe API boundaries.

## Migration Readiness

This project is structured for easy migration to Cloudflare Pages + Workers + D1:
- Explicit API contracts in `shared/routes.ts`.
- Decoupled storage layer in `server/storage.ts`.
- Minimal Node-specific dependencies in frontend code.
