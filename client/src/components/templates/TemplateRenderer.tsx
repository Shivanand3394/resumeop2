import React from 'react';
import { MinimalTemplate } from './MinimalTemplate';
import { ModernTemplate } from './ModernTemplate';
import { ClassicTemplate } from './ClassicTemplate';
import type { ResumeContent } from '@/types/resume';

export const TEMPLATE_REGISTRY = {
  minimal: {
    name: 'Minimal',
    component: MinimalTemplate,
    description: 'A clean, simple layout for any profession.'
  },
  modern: {
    name: 'Modern',
    component: ModernTemplate,
    description: 'A contemporary design with a focus on hierarchy.'
  },
  classic: {
    name: 'Classic',
    component: ClassicTemplate,
    description: 'A traditional layout for formal industries.'
  }
} as const;

export type TemplateId = keyof typeof TEMPLATE_REGISTRY;

interface TemplateRendererProps {
  templateId: string;
  content: ResumeContent;
}

export function TemplateRenderer({ templateId, content }: TemplateRendererProps) {
  const template = TEMPLATE_REGISTRY[templateId as TemplateId] || TEMPLATE_REGISTRY.minimal;
  const Component = template.component;
  return <Component content={content} />;
}
