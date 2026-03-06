import { z } from "zod";
import { eq } from "drizzle-orm";
import { resumes, jobs, type InsertResume, type InsertJob } from "@shared/schema";
import { type ResumeResponse, type JobResponse } from "@shared/routes";

// D1 database type from Cloudflare Workers environment
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

// Helper to convert D1 results to proper format
function mapResumeRow(row: any): ResumeResponse {
  return {
    id: row.id,
    title: row.title,
    templateId: row.template_id,
    contentJson: JSON.parse(row.content_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapJobRow(row: any): JobResponse {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    status: row.status,
    source: row.source,
    appliedDate: row.applied_date,
    notes: row.notes,
    link: row.link,
    resumeId: row.resume_id,
    followUpDate: row.follow_up_date,
    isAiExtracted: Boolean(row.is_ai_extracted),
  };
}

export class D1Storage {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async getResumes(): Promise<ResumeResponse[]> {
    const result = this.db.prepare("SELECT * FROM resumes").all();
    return result.map(mapResumeRow);
  }

  async getResume(id: string): Promise<ResumeResponse | undefined> {
    const row = this.db.prepare("SELECT * FROM resumes WHERE id = ?").bind(id).first();
    return row ? mapResumeRow(row) : undefined;
  }

  async createResume(insertResume: InsertResume): Promise<ResumeResponse> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const contentJson = JSON.stringify(insertResume.contentJson);

    this.db.prepare(
      "INSERT INTO resumes (id, title, template_id, content_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(id, insertResume.title, insertResume.templateId || "minimal", contentJson, now, now).run();

    return {
      id,
      title: insertResume.title,
      templateId: insertResume.templateId || "minimal",
      contentJson: insertResume.contentJson,
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateResume(id: string, updates: any): Promise<ResumeResponse | undefined> {
    const existing = await this.getResume(id);
    if (!existing) return undefined;

    const now = new Date().toISOString();

    const title = updates.title ?? existing.title;
    const templateId = updates.templateId ?? existing.templateId;
    const contentJson = updates.contentJson ? JSON.stringify(updates.contentJson) : JSON.stringify(existing.contentJson);

    this.db.prepare(
      "UPDATE resumes SET title = ?, template_id = ?, content_json = ?, updated_at = ? WHERE id = ?"
    ).bind(title, templateId, contentJson, now, id).run();

    return this.getResume(id);
  }

  async deleteResume(id: string): Promise<void> {
    this.db.prepare("DELETE FROM resumes WHERE id = ?").bind(id).run();
  }

  async duplicateResume(id: string): Promise<ResumeResponse> {
    const original = await this.getResume(id);
    if (!original) throw new Error("Resume not found");

    const newId = crypto.randomUUID();
    const now = new Date().toISOString();

    this.db.prepare(
      "INSERT INTO resumes (id, title, template_id, content_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(
      newId,
      `${original.title} (Copy)`,
      original.templateId,
      JSON.stringify(original.contentJson),
      now,
      now
    ).run();

    return {
      id: newId,
      title: `${original.title} (Copy)`,
      templateId: original.templateId,
      contentJson: original.contentJson,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getJobs(): Promise<JobResponse[]> {
    const result = this.db.prepare("SELECT * FROM jobs").all();
    return result.map(mapJobRow);
  }

  async createJob(insertJob: InsertJob): Promise<JobResponse> {
    const id = crypto.randomUUID();

    this.db.prepare(
      "INSERT INTO jobs (id, company, role, status, source, applied_date, notes, link, resume_id, follow_up_date, is_ai_extracted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      id,
      insertJob.company,
      insertJob.role,
      insertJob.status || "applied",
      insertJob.source ?? null,
      insertJob.appliedDate,
      insertJob.notes ?? null,
      insertJob.link ?? null,
      insertJob.resumeId ?? null,
      insertJob.followUpDate ?? null,
      Boolean(insertJob.isAiExtracted) ? 1 : 0
    ).run();

    return {
      id,
      company: insertJob.company,
      role: insertJob.role,
      status: insertJob.status || "applied",
      source: insertJob.source,
      appliedDate: insertJob.appliedDate,
      notes: insertJob.notes,
      link: insertJob.link,
      resumeId: insertJob.resumeId,
      followUpDate: insertJob.followUpDate,
      isAiExtracted: Boolean(insertJob.isAiExtracted),
    };
  }

  async updateJob(id: string, updates: Partial<InsertJob>): Promise<JobResponse | undefined> {
    const existing = await this.getJob(id);
    if (!existing) return undefined;

    const company = updates.company ?? existing.company;
    const role = updates.role ?? existing.role;
    const status = updates.status ?? existing.status;
    const source = updates.source ?? existing.source;
    const appliedDate = updates.appliedDate ?? existing.appliedDate;
    const notes = updates.notes ?? existing.notes;
    const link = updates.link ?? existing.link;
    const resumeId = updates.resumeId ?? existing.resumeId;
    const followUpDate = updates.followUpDate ?? existing.followUpDate;
    const isAiExtracted = updates.isAiExtracted !== undefined ? updates.isAiExtracted : existing.isAiExtracted;

    this.db.prepare(
      "UPDATE jobs SET company = ?, role = ?, status = ?, source = ?, applied_date = ?, notes = ?, link = ?, resume_id = ?, follow_up_date = ?, is_ai_extracted = ? WHERE id = ?"
    ).bind(
      company,
      role,
      status,
      source,
      appliedDate,
      notes,
      link,
      resumeId,
      followUpDate,
      isAiExtracted ? 1 : 0,
      id
    ).run();

    return this.getJob(id);
  }

  async deleteJob(id: string): Promise<void> {
    this.db.prepare("DELETE FROM jobs WHERE id = ?").bind(id).run();
  }

  private async getJob(id: string): Promise<JobResponse | undefined> {
    const row = this.db.prepare("SELECT * FROM jobs WHERE id = ?").bind(id).first();
    return row ? mapJobRow(row) : undefined;
  }
}