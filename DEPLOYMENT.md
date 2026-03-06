# Cloudflare Deployment Guide

This guide walks through deploying the Resume Builder application to Cloudflare.

## Architecture Overview

After migration, the application consists of:

1. **Cloudflare Pages** - Hosts the React frontend (`client/`)
2. **Cloudflare Worker** - Provides the API (`worker/`)
3. **Cloudflare D1** - SQLite-compatible database

The original Express server remains for local development and can be retired after confirming Worker parity.

## Prerequisites

1. A Cloudflare account (sign up at [cloudflare.com](https://cloudflare.com))
2. Node.js 20+ installed locally
3. Wrangler CLI installed:
   ```powershell
   npm install -g wrangler
   ```
4. Logged into Cloudflare:
   ```powershell
   wrangler login
   ```

## Step 1: Create D1 Database

Create the D1 database that will store your resumes and job applications:

```powershell
npx wrangler d1 create resumeop2-db
```

This outputs something like:
```
{
  "id": "abc123...",
  "name": "resumeop2-db"
}
```

**Important**: Copy the database ID. You'll need it for the next step.

## Step 2: Configure Worker

Update `worker/wrangler.toml` with your D1 database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "resumeop2-db"
database_id = "YOUR_DATABASE_ID_HERE"  # Replace with your actual ID
```

## Step 3: Apply Database Schema

Run the migration to create the tables:

```powershell
npx wrangler d1 execute resumeop2-db --file=./worker/migrations/0001_initial.sql
```

You should see:
```
Executed 2 statements
```

## Step 4: Test Worker Locally

Start the Worker in local development mode:

```powershell
npm run dev:worker
```

This starts a local Worker on `http://127.0.0.1:8787` with a local D1 database.

**Test the API**:

```powershell
# Test resumes endpoint (should return empty array)
curl http://127.0.0.1:8787/api/resumes

# Test jobs endpoint
curl http://127.0.0.1:8787/api/jobs
```

Both should return `[]` (empty arrays) if the database is empty.

## Step 5: Deploy the Worker

Deploy the Worker to Cloudflare:

```powershell
npm run deploy:worker
```

After deployment, Wrangler outputs your Worker URL, something like:
```
Published resumeop2-worker (X.XX sec)
  https://resumeop2-worker.your-subdomain.workers.dev
```

**Copy this URL** - you'll need it for the frontend.

## Step 6: Configure Frontend for Production

### Option A: Set Environment Variable

Create a `.env.production` file in the `client/` directory:

```
VITE_API_BASE_URL=https://resumeop2-worker.your-subdomain.workers.dev
```

Or set it as an environment variable before building:

```powershell
$env:VITE_API_BASE_URL="https://resumeop2-worker.your-subdomain.workers.dev"
npm run build
```

### Option B: Update Vite Config

You can also hardcode the Worker URL in `vite.config.ts` (not recommended for multiple environments):

```typescript
define: {
  'import.meta.env.VITE_API_BASE_URL': JSON.stringify("https://resumeop2-worker.your-subdomain.workers.dev"),
},
```

## Step 7: Build Frontend

Build the React frontend:

```powershell
npm run build
```

This creates the production bundle in `dist/public/`.

## Step 8: Deploy to Cloudflare Pages

### Option A: Using Wrangler (Recommended)

From the `client/` directory:

```powershell
cd client
npx wrangler pages deploy dist/public --project-name=resumeop2-pages
```

Follow the prompts to create a new Pages project or deploy to existing one.

### Option B: Using Cloudflare Dashboard

1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Click "Create a project" → "Connect to Git"
3. Select your repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist/public`
   - **Root directory**: `client/`
5. Click "Save and Deploy"

## Step 9: Configure Pages Environment Variable

In the Cloudflare Pages dashboard:

1. Go to your Pages project settings
2. Navigate to "Environment variables"
3. Add:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://resumeop2-worker.your-subdomain.workers.dev`
4. Redeploy the Pages project

## Step 10: Test Production Deployment

1. Open your Pages URL (e.g., `https://resumeop2.your-subdomain.pages.dev`)
2. Create a test resume
3. Verify it appears in the list
4. Create a test job application
5. Verify everything works

## Important Notes

### PDF Export

The PDF export endpoint (`GET /api/resumes/:id/export/pdf`) is **not available** in the Worker because Workers cannot run Puppeteer. Options:

1. **Keep Express running** for PDF export (hybrid approach)
2. **Move PDF export to Cloud Run** or another service
3. **Use client-side PDF generation** (e.g., jsPDF)

### Database Migrations

If you need to modify the database schema:

1. Create a new migration file in `worker/migrations/` (e.g., `0002_add_column.sql`)
2. Apply it:
   ```powershell
   npx wrangler d1 execute resumeop2-db --file=./worker/migrations/0002_add_column.sql
   ```
3. Update the D1 storage adapter if needed

### Data Migration from SQLite

To migrate existing data from `data/resume-craft.db` to D1:

1. Export SQLite data as JSON
2. Write a script to insert into D1 using the Worker API or direct D1 access
3. Or manually export/import using Wrangler:

```powershell
# Export from SQLite (run in separate script)
# Then import to D1:
npx wrangler d1 execute resumeop2-db --command "INSERT INTO resumes ..."
```

## Verification Checklist

- [ ] D1 database created and schema applied
- [ ] Worker deploys successfully
- [ ] Worker API responds correctly (test endpoints)
- [ ] Frontend builds without errors
- [ ] Pages project configured with correct build settings
- [ ] `VITE_API_BASE_URL` set in Pages environment
- [ ] Application works end-to-end in production
- [ ] PDF export handled appropriately (stubbed or alternative)

## Troubleshooting

### Worker fails to start locally
- Ensure Wrangler is installed and you're logged in
- Check that `worker/wrangler.toml` has correct database ID
- Run `npx wrangler d1 databases` to list your D1 databases

### Pages build fails
- Check that `npm run build` works locally first
- Ensure build output directory is `dist/public`
- Verify Vite config has correct root path

### API calls fail in production
- Verify `VITE_API_BASE_URL` is set correctly in Pages
- Check Worker logs: `npx wrangler tail`
- Ensure CORS is enabled (it is by default in the Worker)
- Test Worker URL directly: `https://your-worker.workers.dev/api/resumes`

### Database errors
- Confirm migrations were applied: `npx wrangler d1 execute resumeop2-db --command="SELECT name FROM sqlite_master WHERE type='table'"`
- Check table names: should have `resumes` and `jobs`
- Verify D1 binding name in `wrangler.toml` is `DB`

## Next Steps

After confirming the Worker API works correctly:

1. Consider decommissioning the Express server (keep as backup)
2. Implement PDF export alternative (Cloud Run, external service, or client-side)
3. Add authentication if needed (Cloudflare Access, Workers Auth, etc.)
4. Set up custom domain for Worker and Pages
5. Configure monitoring and analytics
6. Set up CI/CD pipeline (GitHub Actions with Wrangler)

## Support

- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/
- D1 Documentation: https://developers.cloudflare.com/d1/
- Pages Documentation: https://developers.cloudflare.com/pages/
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler/