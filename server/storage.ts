import { db } from "./db";
import {
  resumes,
  type CreateResumeRequest,
  type UpdateResumeRequest,
  type ResumeResponse,
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export interface IStorage {
  getResumes(): Promise<ResumeResponse[]>;
  getResume(id: string): Promise<ResumeResponse | undefined>;
  createResume(resume: CreateResumeRequest): Promise<ResumeResponse>;
  updateResume(id: string, updates: UpdateResumeRequest): Promise<ResumeResponse>;
  deleteResume(id: string): Promise<void>;
  duplicateResume(id: string): Promise<ResumeResponse>;
}

export class DatabaseStorage implements IStorage {
  async getResumes(): Promise<ResumeResponse[]> {
    return db.select().from(resumes).all();
  }

  async getResume(id: string): Promise<ResumeResponse | undefined> {
    const [resume] = db.select().from(resumes).where(eq(resumes.id, id)).all();
    return resume;
  }

  async createResume(insertResume: CreateResumeRequest): Promise<ResumeResponse> {
    const now = new Date().toISOString();
    const id = uuidv4();
    const [resume] = db.insert(resumes).values({
      ...insertResume,
      id,
      createdAt: now,
      updatedAt: now,
    }).returning().all();
    return resume;
  }

  async updateResume(id: string, updates: UpdateResumeRequest): Promise<ResumeResponse> {
    const now = new Date().toISOString();
    const [resume] = db
      .update(resumes)
      .set({ ...updates, updatedAt: now })
      .where(eq(resumes.id, id))
      .returning()
      .all();
    return resume;
  }

  async deleteResume(id: string): Promise<void> {
    db.delete(resumes).where(eq(resumes.id, id)).run();
  }

  async duplicateResume(id: string): Promise<ResumeResponse> {
    const original = await this.getResume(id);
    if (!original) throw new Error("Resume not found");

    const now = new Date().toISOString();
    const newId = uuidv4();
    const { id: _, createdAt: __, updatedAt: ___, ...dataToCopy } = original;
    const [duplicated] = db
      .insert(resumes)
      .values({ 
        ...dataToCopy, 
        id: newId,
        title: `${original.title} (Copy)`,
        createdAt: now,
        updatedAt: now
      })
      .returning()
      .all();
    return duplicated;
  }
}

export const storage = new DatabaseStorage();
