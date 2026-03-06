# Cloudflare Worker API

This directory contains the Cloudflare Worker implementation of the Resume Builder API.

## Architecture

- **Entry Point**: `src/index.ts` - Main Worker handler
- **Storage**: `src/d1-storage.ts` - D1 database adapter implementing the same interface as Express storage
- **Shared Types**: `src/shared/` - Worker-compatible schema and route definitions
- **Migrations**: `migrations/` - SQL schema migrations for D1

## Key Features

- Implements all resume and job tracker APIs
- Uses Cloudflare D1 database (SQLite-compatible)
- CORS-enabled for frontend access
- PDF export stub (Workers cannot run Puppeteer)

## Local Development

### Prerequisites

1. Install Wrangler: `npm install -g wrangler` or use `npx wrangler`
2. Create a Cloudflare account and login: `wrangler login`

### Setup

1. Create a D1 database:
   ```powershell
   npx wrangler d1 create resumeop2-db
   ```
   Copy the database ID and update `wrangler.toml`.

2. Apply migrations:
   ```powershell
   npx wrangler d1 execute resumeop2-db --file=./migrations/0001_initial.sql
   ```

3. Start local development:
   ```powershell
   npm run dev:worker
   ```

   This starts the Worker locally on `http://127.0.0.1:8787` with a local D1 database.

### Environment Variables

- `VITE_API_BASE_URL` (frontend): Set to Worker URL when deploying (e.g., `https://resumeop2-worker.your-subdomain.workers.dev`)

## Deployment

1. Create D1 database on Cloudflare (if not already)
2. Update `wrangler.toml` with the database ID
3. Deploy:
   ```powershell
   npm run deploy:worker
   ```

## API Endpoints

All endpoints match the original Express API:

- `GET /api/resumes` - List all resumes
- `GET /api/resumes/:id` - Get resume by ID
- `POST /api/resumes` - Create resume
- `PATCH /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume
- `POST /api/resumes/:id/duplicate` - Duplicate resume
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create job
- `PATCH /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/resumes/:id/export/pdf` - **STUBBED** - Not available in Workers

## Migration from Express

The frontend API client (`client/src/lib/api-client.ts`) supports environment-based switching:

- **Local dev**: `VITE_API_BASE_URL=""` (empty) → uses relative paths to Express server at `http://127.0.0.1:5000`
- **Production**: `VITE_API_BASE_URL="https://your-worker.workers.dev"` → uses Worker API

## Notes

- The Worker uses `crypto.randomUUID()` for ID generation (Cloudflare Workers API)
- D1 uses prepared statements with `?` placeholders
- All timestamps are ISO 8601 strings
- JSON data is stored as TEXT in D1 (same as SQLite)
- CORS headers are included for cross-origin requests
- The PDF export endpoint returns 501 Not Implemented in Worker mode