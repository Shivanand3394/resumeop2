import React from 'react';
import type { ResumeContent } from '@/types/resume';

export function MinimalTemplate({ content }: { content: ResumeContent }) {
  const { personalInfo, experiences, education, skills } = content;

  return (
    <div className="a4-page p-12 lg:p-16 flex flex-col font-sans">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2 uppercase">{personalInfo.fullName || 'Your Name'}</h1>
        <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.location && <span>• {personalInfo.location}</span>}
          {personalInfo.website && <span>• {personalInfo.website}</span>}
        </div>
      </header>

      {personalInfo.summary && (
        <section className="mb-8">
          <p className="text-sm leading-relaxed text-gray-800 text-center max-w-2xl mx-auto">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {experiences?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-2">Experience</h2>
          <div className="space-y-6">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                  <span className="text-xs text-gray-500 font-medium">{exp.startDate} - {exp.endDate}</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">{exp.company}</div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {education?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-2">Education</h2>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                  <div className="text-sm text-gray-600">{edu.institution}</div>
                </div>
                <span className="text-xs text-gray-500 font-medium">{edu.startDate} - {edu.endDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {skills?.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill.id} className="text-sm text-gray-800 bg-gray-50 px-3 py-1 rounded-full">
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
