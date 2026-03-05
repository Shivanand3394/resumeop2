import React from 'react';
import type { ResumeContent } from '@/types/resume';

export function ClassicTemplate({ content }: { content: ResumeContent }) {
  const { personalInfo, experiences, education, skills } = content;

  return (
    <div className="a4-page p-12 font-serif text-gray-900">
      <header className="mb-8 text-center border-b-2 border-black pb-6">
        <h1 className="text-4xl font-bold mb-3 tracking-wide">{personalInfo.fullName || 'Your Name'}</h1>
        <div className="flex justify-center gap-3 text-sm font-sans">
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.phone && <span>| {personalInfo.phone}</span>}
          {personalInfo.email && <span>| {personalInfo.email}</span>}
          {personalInfo.website && <span>| {personalInfo.website}</span>}
        </div>
      </header>

      {personalInfo.summary && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase tracking-wider mb-2">Professional Summary</h2>
          <p className="text-sm leading-relaxed font-sans">{personalInfo.summary}</p>
        </section>
      )}

      {experiences?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase tracking-wider mb-3 border-b border-gray-300 pb-1">Experience</h2>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between font-bold text-base">
                  <span>{exp.company}, {exp.role}</span>
                  <span className="font-normal font-sans text-sm">{exp.startDate} - {exp.endDate}</span>
                </div>
                <p className="text-sm leading-relaxed mt-2 font-sans whitespace-pre-wrap">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {education?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase tracking-wider mb-3 border-b border-gray-300 pb-1">Education</h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold">{edu.institution}</span> — <span className="italic">{edu.degree}</span>
                </div>
                <span className="font-sans text-sm">{edu.startDate} - {edu.endDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {skills?.length > 0 && (
        <section>
          <h2 className="text-lg font-bold uppercase tracking-wider mb-3 border-b border-gray-300 pb-1">Skills</h2>
          <p className="text-sm font-sans leading-relaxed">
            {skills.map(s => s.name).join(' • ')}
          </p>
        </section>
      )}
    </div>
  );
}
