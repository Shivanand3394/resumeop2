import { z } from "zod";
import { insertResumeSchema, insertJobSchema, type Resume, type Job } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  resumes: {
    list: {
      method: 'GET' as const,
      path: '/api/resumes' as const,
      responses: {
        200: z.array(z.custom<Resume>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/resumes/:id' as const,
      responses: {
        200: z.custom<Resume>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/resumes' as const,
      input: insertResumeSchema,
      responses: {
        201: z.custom<Resume>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/resumes/:id' as const,
      input: insertResumeSchema.partial(),
      responses: {
        200: z.custom<Resume>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/resumes/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    duplicate: {
      method: 'POST' as const,
      path: '/api/resumes/:id/duplicate' as const,
      responses: {
        201: z.custom<Resume>(),
        404: errorSchemas.notFound,
      },
    }
  },
  jobs: {
    list: {
      method: 'GET' as const,
      path: '/api/jobs' as const,
      responses: {
        200: z.array(z.custom<Job>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/jobs' as const,
      input: insertJobSchema,
      responses: {
        201: z.custom<Job>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/jobs/:id' as const,
      input: insertJobSchema.partial(),
      responses: {
        200: z.custom<Job>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/jobs/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ResumeResponse = Resume;
export type JobResponse = Job;
export type CreateResumeInput = z.infer<typeof insertResumeSchema>;
export type UpdateResumeInput = Partial<CreateResumeInput>;
export type CreateJobInput = z.infer<typeof insertJobSchema>;
export type UpdateJobInput = Partial<CreateJobInput>;