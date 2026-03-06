# Resume Craft

Modern resume builder with real-time preview, job tracking, and persistent storage.

## Architecture Audit & Status

| Feature | Status | Proof |
|---------|--------|-------|
| Clean API Layer | COMPLETE | `client/src/lib/api-client.ts` centralizes all fetch logic; `shared/routes.ts` defines contracts. |
| Job Tracker Foundation | COMPLETE | Real persistence in `jobs` table; UI in `client/src/pages/JobTracker.tsx`. |
| UX/Design Refinement | COMPLETE | Professional spacing, typography, and premium empty states in `Dashboard.tsx` and `JobTracker.tsx`. |
| Autosave Hardening | COMPLETE | Debounced 800ms saves to both `localStorage` and remote SQLite in `Editor.tsx`. |
| Local/Remote Sync | COMPLETE | Timestamp-based reconciliation in `Editor.tsx` ensures the latest version is always used. |
| Migration Readiness | COMPLETE | Decoupled storage in `server/storage.ts`; typed contracts in `shared/routes.ts`; no Node-specific browser code. |
| Template Registry | COMPLETE | `TEMPLATE_REGISTRY` in `TemplateRenderer.tsx` centralizes template management. |

## Critical Migration Blockers (to Cloudflare)

1. **Puppeteer (PDF Export)**: Puppeteer requires a full browser environment. Must move to a specialized service (e.g., Cloud Run or a PDF generation API) as Workers don't support it.
2. **FileSystem (SQLite)**: SQLite file at `/data/resume-craft.db` won't work on Cloudflare's read-only filesystem. Must migrate to **Cloudflare D1**.
3. **Environment**: Ensure `DATABASE_URL` and other secrets are migrated to Cloudflare Secrets/Bindings.

## Project Structure

- **API Layer**: `client/src/lib/api-client.ts`, `shared/routes.ts`
- **Editor**: `client/src/pages/Editor.tsx`
- **Job Tracker**: `client/src/pages/JobTracker.tsx`, `client/src/hooks/use-jobs.ts`
- **Templates**: `client/src/components/templates/`
- **Backend**: `server/storage.ts`, `server/db.ts`, `server/routes.ts`

## Getting Started

```powershell
# Install dependencies
npm install

# Initialize database
mkdir -p data
npm run db:push -- --force

# Seed sample data
npx tsx server/seed.ts

# Start development
npm run dev
```
