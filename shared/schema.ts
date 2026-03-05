import { sqliteTable, text, customType } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// SQLite doesn't have a native JSON type, so we use a custom type to handle it as text
const jsonb = <TData>(name: string) => 
  customType<{ data: TData; driverData: string }>({
    dataType() {
      return "text";
    },
    toDriver(value: TData): string {
      return JSON.stringify(value);
    },
    fromDriver(value: string): TData {
      return JSON.parse(value);
    },
  })(name);

export const resumes = sqliteTable("resumes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  templateId: text("template_id").notNull().default("minimal"),
  contentJson: jsonb<any>("content_json").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumes.$inferSelect;

export type CreateResumeRequest = InsertResume;
export type UpdateResumeRequest = Partial<InsertResume>;

export type ResumeResponse = Resume;
export type ResumesListResponse = Resume[];
