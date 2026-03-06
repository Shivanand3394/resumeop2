import { z } from "zod";

// Define types for Cloudflare Workers (without Drizzle dependency)

export type InsertResume = {
  title: string;
  templateId?: string;
  contentJson: any;
};

export type Resume = {
  id: string;
  title: string;
  templateId: string;
  contentJson: any;
  createdAt: string;
  updatedAt: string;
};

export type InsertJob = {
  company: string;
  role: string;
  status?: string;
  source?: string | null;
  appliedDate: string;
  notes?: string | null;
  link?: string | null;
  resumeId?: string | null;
  followUpDate?: string | null;
  isAiExtracted?: boolean;
};

export type Job = {
  id: string;
  company: string;
  role: string;
  status: string;
  source?: string | null;
  appliedDate: string;
  notes?: string | null;
  link?: string | null;
  resumeId?: string | null;
  followUpDate?: string | null;
  isAiExtracted: boolean;
};

export type ResumeResponse = Resume;
export type JobResponse = Job;

export const insertResumeSchema = z.object({
  title: z.string().min(1),
  templateId: z.string().optional(),
  contentJson: z.any(),
});

export const insertJobSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  status: z.string().optional(),
  source: z.string().optional().nullable(),
  appliedDate: z.string(),
  notes: z.string().optional().nullable(),
  link: z.string().optional().nullable(),
  resumeId: z.string().optional().nullable(),
  followUpDate: z.string().optional().nullable(),
  isAiExtracted: z.boolean().optional(),
});