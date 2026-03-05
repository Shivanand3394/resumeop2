import { db } from "./db";
import {
  resumes,
  type CreateResumeRequest,
  type UpdateResumeRequest,
  type ResumeResponse,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getResumes(): Promise<ResumeResponse[]>;
  getResume(id: number): Promise<ResumeResponse | undefined>;
  createResume(resume: CreateResumeRequest): Promise<ResumeResponse>;
  updateResume(id: number, updates: UpdateResumeRequest): Promise<ResumeResponse>;
  deleteResume(id: number): Promise<void>;
  duplicateResume(id: number): Promise<ResumeResponse>;
}

export class DatabaseStorage implements IStorage {
  async getResumes(): Promise<ResumeResponse[]> {
    return await db.select().from(resumes);
  }

  async getResume(id: number): Promise<ResumeResponse | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume;
  }

  async createResume(insertResume: CreateResumeRequest): Promise<ResumeResponse> {
    const [resume] = await db.insert(resumes).values(insertResume).returning();
    return resume;
  }

  async updateResume(id: number, updates: UpdateResumeRequest): Promise<ResumeResponse> {
    const [resume] = await db
      .update(resumes)
      .set(updates)
      .where(eq(resumes.id, id))
      .returning();
    return resume;
  }

  async deleteResume(id: number): Promise<void> {
    await db.delete(resumes).where(eq(resumes.id, id));
  }

  async duplicateResume(id: number): Promise<ResumeResponse> {
    const original = await this.getResume(id);
    if (!original) throw new Error("Resume not found");

    const { id: _, updatedAt: __, ...dataToCopy } = original;
    const [duplicated] = await db
      .insert(resumes)
      .values({ ...dataToCopy, title: `${original.title} (Copy)` })
      .returning();
    return duplicated;
  }
}

export const storage = new DatabaseStorage();
