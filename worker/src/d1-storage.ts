import type { InsertResume, InsertJob } from "@shared/schema";
import type { ResumeResponse, JobResponse } from "@shared/routes";

interface D1Database {
  prepare(sql: string): D1Statement;
  exec(sql: string): Promise<D1Result>;
  batch(statements: D1Statement[]): Promise<D1Result[]>;
}

interface D1Statement {
  bind(...params: any[]): D1Statement;
  run(): Promise<D1Result>;
  all(): Promise<D1Result>;
  first(): Promise<any | null>;
}

interface D1Result {
  success?: boolean;
  meta?: {
    last_row_id?: number;
    rows_affected?: number;
  };
  results?: any[];
}

function mapResumeRow(row: any): ResumeResponse {
  const rawContent = row.contentJson ?? row.content_json ?? {};
  const parsedContent =
    typeof rawContent === "string"
      ? JSON.parse(rawContent)
      : rawContent;

  return {
    id: row.id,
    title: row.title,
    templateId: row.templateId ?? row.template_id ?? "minimal",
    contentJson: parsedContent,
    createdAt: row.createdAt ?? row.created_at,
    updatedAt: row.updatedAt ?? row.updated_at,
  };
}

function mapJobRow(row: any): JobResponse {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    status: row.status,
    source: row.source,
    appliedDate: row.appliedDate ?? row.applied_date,
    notes: row.notes,
    link: row.link,
    resumeId: row.resumeId ?? row.resume_id,
    followUpDate: row.followUpDate ?? row.follow_up_date,
    isAiExtracted: Boolean(row.isAiExtracted ?? row.is_ai_extracted),
  };
}

export class D1Storage {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async getResumes(): Promise<ResumeResponse[]> {
    const result = await this.db
      .prepare("SELECT id, title, template_id AS templateId, content_json AS contentJson, created_at AS createdAt, updated_at AS updatedAt FROM resumes ORDER BY updated_at DESC")
      .all();

    return (result.results ?? []).map(mapResumeRow);
  }

  async getResume(id: string): Promise<ResumeResponse | undefined> {
    const result = await this.db
      .prepare("SELECT id, title, template_id AS templateId, content_json AS contentJson, created_at AS createdAt, updated_at AS updatedAt FROM resumes WHERE id = ?")
      .bind(id)
      .all();

    const row = (result.results ?? [])[0];
    return row ? mapResumeRow(row) : undefined;
  }

  async createResume(insertResume: InsertResume): Promise<ResumeResponse> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const contentJson = JSON.stringify(insertResume.contentJson);

    await this.db
      .prepare("INSERT INTO resumes (id, title, template_id, content_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(id, insertResume.title, insertResume.templateId || "minimal", contentJson, now, now)
      .run();

    return {
      id,
      title: insertResume.title,
      templateId: insertResume.templateId || "minimal",
      contentJson: insertResume.contentJson,
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateResume(id: string, updates: Partial<InsertResume>): Promise<ResumeResponse | undefined> {
    const existing = await this.getResume(id);
    if (!existing) return undefined;

    const now = new Date().toISOString();
    const title = updates.title ?? existing.title;
    const templateId = updates.templateId ?? existing.templateId;
    const contentJson = JSON.stringify(updates.contentJson ?? existing.contentJson);

    await this.db
      .prepare("UPDATE resumes SET title = ?, template_id = ?, content_json = ?, updated_at = ? WHERE id = ?")
      .bind(title, templateId, contentJson, now, id)
      .run();

    return this.getResume(id);
  }

  async deleteResume(id: string): Promise<void> {
    await this.db.prepare("DELETE FROM resumes WHERE id = ?").bind(id).run();
  }

  async duplicateResume(id: string): Promise<ResumeResponse> {
    const original = await this.getResume(id);
    if (!original) {
      throw new Error("Resume not found");
    }

    const newId = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.db
      .prepare("INSERT INTO resumes (id, title, template_id, content_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(
        newId,
        `${original.title} (Copy)`,
        original.templateId,
        JSON.stringify(original.contentJson),
        now,
        now
      )
      .run();

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
    const result = await this.db
      .prepare("SELECT id, company, role, status, source, applied_date AS appliedDate, notes, link, resume_id AS resumeId, follow_up_date AS followUpDate, is_ai_extracted AS isAiExtracted FROM jobs ORDER BY applied_date DESC")
      .all();

    return (result.results ?? []).map(mapJobRow);
  }

  async createJob(insertJob: InsertJob): Promise<JobResponse> {
    const id = crypto.randomUUID();

    await this.db
      .prepare("INSERT INTO jobs (id, company, role, status, source, applied_date, notes, link, resume_id, follow_up_date, is_ai_extracted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(
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
        insertJob.isAiExtracted ? 1 : 0
      )
      .run();

    return {
      id,
      company: insertJob.company,
      role: insertJob.role,
      status: insertJob.status || "applied",
      source: insertJob.source ?? null,
      appliedDate: insertJob.appliedDate,
      notes: insertJob.notes ?? null,
      link: insertJob.link ?? null,
      resumeId: insertJob.resumeId ?? null,
      followUpDate: insertJob.followUpDate ?? null,
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

    await this.db
      .prepare("UPDATE jobs SET company = ?, role = ?, status = ?, source = ?, applied_date = ?, notes = ?, link = ?, resume_id = ?, follow_up_date = ?, is_ai_extracted = ? WHERE id = ?")
      .bind(
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
      )
      .run();

    return this.getJob(id);
  }

  async deleteJob(id: string): Promise<void> {
    await this.db.prepare("DELETE FROM jobs WHERE id = ?").bind(id).run();
  }

  private async getJob(id: string): Promise<JobResponse | undefined> {
    const result = await this.db
      .prepare("SELECT id, company, role, status, source, applied_date AS appliedDate, notes, link, resume_id AS resumeId, follow_up_date AS followUpDate, is_ai_extracted AS isAiExtracted FROM jobs WHERE id = ?")
      .bind(id)
      .all();

    const row = (result.results ?? [])[0];
    return row ? mapJobRow(row) : undefined;
  }
}
