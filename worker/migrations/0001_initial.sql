-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  template_id TEXT NOT NULL DEFAULT 'minimal',
  content_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'applied',
  source TEXT,
  applied_date TEXT NOT NULL,
  notes TEXT,
  link TEXT,
  resume_id TEXT,
  follow_up_date TEXT,
  is_ai_extracted INTEGER DEFAULT 0,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_resume_id ON jobs(resume_id);
CREATE INDEX IF NOT EXISTS idx_jobs_applied_date ON jobs(applied_date);
CREATE INDEX IF NOT EXISTS idx_resumes_updated_at ON resumes(updated_at);