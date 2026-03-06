import { D1Storage } from "./d1-storage";
import { api } from "./shared/routes";

// Cloudflare Worker environment types
interface Env {
  DB: D1Database;
}

interface D1Database {
  prepare(sql: string): D1Statement;
  exec(sql: string): D1Result;
  batch(sqls: string[]): D1Result[];
}

interface D1Statement {
  bind(...params: any[]): D1Statement;
  run(): D1Result;
  all(): any[];
  first(): any | undefined;
}

interface D1Result {
  success: boolean;
  meta: {
    last_row_id?: number;
    rows_affected?: number;
  };
  results?: any[];
}

// Helper to build CORS headers
function getCorsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// Helper to send JSON response
function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...getCorsHeaders(),
    },
  });
}

// Helper to send no content response
function noContentResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

// Helper to send error response
function errorResponse(message: string, status: number = 500): Response {
  return jsonResponse({ message }, status);
}

// Handle preflight CORS requests
function handleOptions(): Response {
  return new Response(null, {
    headers: getCorsHeaders(),
  });
}

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: any
  ): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    // Handle CORS preflight
    if (method === "OPTIONS") {
      return handleOptions();
    }

    // Initialize storage with D1 database
    const storage = new D1Storage(env.DB);

    // Helper to parse JSON body
    async function parseBody<T>(): Promise<T | undefined> {
      if (method === "GET" || method === "DELETE") return undefined;
      try {
        return await request.json();
      } catch {
        return undefined;
      }
    }

    // ============ RESUME ROUTES ============

    // GET /api/resumes - List all resumes
    if (
      method === "GET" &&
      url.pathname === api.resumes.list.path
    ) {
      try {
        const resumes = await storage.getResumes();
        return jsonResponse(resumes);
      } catch (err) {
        console.error("Error fetching resumes:", err);
        return errorResponse("Internal server error");
      }
    }

    // GET /api/resumes/:id - Get single resume
    const matchGetResume = url.pathname.match(/^\/api\/resumes\/([^/]+)$/);
    if (method === "GET" && matchGetResume) {
      try {
        const id = matchGetResume[1];
        const resume = await storage.getResume(id);
        if (!resume) {
          return errorResponse("Resume not found", 404);
        }
        return jsonResponse(resume);
      } catch (err) {
        console.error("Error fetching resume:", err);
        return errorResponse("Internal server error");
      }
    }

    // POST /api/resumes - Create resume
    if (
      method === "POST" &&
      url.pathname === api.resumes.create.path
    ) {
      try {
        const body = await parseBody<any>();
        if (!body) {
          return errorResponse("Invalid request body", 400);
        }

        // Validate required fields
        if (!body.title || !body.contentJson) {
          return errorResponse("Validation error: title and contentJson are required", 400);
        }

        const resume = await storage.createResume(body);
        return jsonResponse(resume, 201);
      } catch (err) {
        console.error("Error creating resume:", err);
        return errorResponse("Internal server error");
      }
    }

    // PATCH /api/resumes/:id - Update resume
    const matchUpdateResume = url.pathname.match(/^\/api\/resumes\/([^/]+)$/);
    if (method === "PATCH" && matchUpdateResume) {
      try {
        const id = matchUpdateResume[1];
        const body = await parseBody<any>();
        if (!body) {
          return errorResponse("Invalid request body", 400);
        }

        const resume = await storage.updateResume(id, body);
        if (!resume) {
          return errorResponse("Resume not found", 404);
        }
        return jsonResponse(resume);
      } catch (err) {
        console.error("Error updating resume:", err);
        return errorResponse("Internal server error");
      }
    }

    // DELETE /api/resumes/:id - Delete resume
    const matchDeleteResume = url.pathname.match(/^\/api\/resumes\/([^/]+)$/);
    if (method === "DELETE" && matchDeleteResume) {
      try {
        const id = matchDeleteResume[1];
        await storage.deleteResume(id);
        return noContentResponse();
      } catch (err) {
        console.error("Error deleting resume:", err);
        return errorResponse("Internal server error");
      }
    }

    // POST /api/resumes/:id/duplicate - Duplicate resume
    const matchDuplicateResume = url.pathname.match(/^\/api\/resumes\/([^/]+)\/duplicate$/);
    if (method === "POST" && matchDuplicateResume) {
      try {
        const id = matchDuplicateResume[1];
        const resume = await storage.duplicateResume(id);
        return jsonResponse(resume, 201);
      } catch (err) {
        if (err instanceof Error && err.message === "Resume not found") {
          return errorResponse(err.message, 404);
        }
        console.error("Error duplicating resume:", err);
        return errorResponse("Internal server error");
      }
    }

    // ============ JOB TRACKER ROUTES ============

    // GET /api/jobs - List all jobs
    if (
      method === "GET" &&
      url.pathname === api.jobs.list.path
    ) {
      try {
        const jobs = await storage.getJobs();
        return jsonResponse(jobs);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        return errorResponse("Internal server error");
      }
    }

    // POST /api/jobs - Create job
    if (
      method === "POST" &&
      url.pathname === api.jobs.create.path
    ) {
      try {
        const body = await parseBody<any>();
        if (!body) {
          return errorResponse("Invalid request body", 400);
        }

        // Validate required fields
        if (!body.company || !body.role || !body.appliedDate) {
          return errorResponse("Validation error: company, role, and appliedDate are required", 400);
        }

        const job = await storage.createJob(body);
        return jsonResponse(job, 201);
      } catch (err) {
        console.error("Error creating job:", err);
        return errorResponse("Internal server error");
      }
    }

    // PATCH /api/jobs/:id - Update job
    const matchUpdateJob = url.pathname.match(/^\/api\/jobs\/([^/]+)$/);
    if (method === "PATCH" && matchUpdateJob) {
      try {
        const id = matchUpdateJob[1];
        const body = await parseBody<any>();
        if (!body) {
          return errorResponse("Invalid request body", 400);
        }

        const job = await storage.updateJob(id, body);
        if (!job) {
          return errorResponse("Job not found", 404);
        }
        return jsonResponse(job);
      } catch (err) {
        console.error("Error updating job:", err);
        return errorResponse("Internal server error");
      }
    }

    // DELETE /api/jobs/:id - Delete job
    const matchDeleteJob = url.pathname.match(/^\/api\/jobs\/([^/]+)$/);
    if (method === "DELETE" && matchDeleteJob) {
      try {
        const id = matchDeleteJob[1];
        await storage.deleteJob(id);
        return noContentResponse();
      } catch (err) {
        console.error("Error deleting job:", err);
        return errorResponse("Internal server error");
      }
    }

    // ============ PDF EXPORT STUB ============
    // Workers cannot run Puppeteer - this endpoint is stubbed
    if (
      method === "GET" &&
      url.pathname.match(/^\/api\/resumes\/[^/]+\/export\/pdf$/)
    ) {
      return errorResponse(
        "PDF export is not available in Cloudflare Workers. Please use the local Express server for PDF export or deploy this feature to Cloud Run.",
        501
      );
    }

    // If no route matched
    return errorResponse("Not found", 404);
  },
};