import React from 'react';
import { MinimalTemplate } from './MinimalTemplate';
import { ModernTemplate } from './ModernTemplate';
import { ClassicTemplate } from './ClassicTemplate';
import type { ResumeContent } from '@/types/resume';

interface TemplateRendererProps {
  templateId: string;
  content: ResumeContent;
}

export function TemplateRenderer({ templateId, content }: TemplateRendererProps) {
  switch (templateId) {
    case 'modern':
      return <ModernTemplate content={content} />;
    case 'classic':
      return <ClassicTemplate content={content} />;
    case 'minimal':
    default:
      return <MinimalTemplate content={content} />;
  }
}
