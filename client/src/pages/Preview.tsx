import { useParams } from "wouter";
import { useResume } from "@/hooks/use-resumes";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import type { ResumeContent } from "@/types/resume";

export default function Preview() {
  const { id } = useParams<{ id: string }>();
  const resumeId = parseInt(id, 10);
  const { data: resume, isLoading, isError } = useResume(resumeId);

  if (isLoading) return null; // Keep completely blank while loading for PDF exporter
  if (isError || !resume) return <div className="p-8">Resume not found</div>;

  return (
    <div className="print-only">
      <TemplateRenderer 
        templateId={resume.templateId} 
        content={resume.contentJson as ResumeContent} 
      />
    </div>
  );
}
