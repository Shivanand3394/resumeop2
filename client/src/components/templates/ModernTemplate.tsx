import React from 'react';
import type { ResumeContent } from '@/types/resume';

export function ModernTemplate({ content }: { content: ResumeContent }) {
  const { personalInfo, experiences, education, skills } = content;

  return (
    <div className="a4-page flex overflow-hidden font-sans">
      {/* Left Sidebar */}
      <aside className="w-[35%] bg-slate-900 text-white p-8 flex flex-col">
        <h1 className="text-3xl font-bold mb-2 break-words leading-tight">{personalInfo.fullName || 'Your Name'}</h1>
        
        <div className="mt-8 space-y-6">
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Contact</h2>
            <div className="space-y-2 text-sm text-slate-300">
              {personalInfo.email && <div className="break-all">{personalInfo.email}</div>}
              {personalInfo.phone && <div>{personalInfo.phone}</div>}
              {personalInfo.location && <div>{personalInfo.location}</div>}
              {personalInfo.website && <div className="break-all">{personalInfo.website}</div>}
            </div>
          </section>

          {skills?.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 mt-8">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill.id} className="text-xs bg-slate-800 text-slate-200 px-2 py-1 rounded">
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {education?.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 mt-8">Education</h2>
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="font-semibold text-sm text-white">{edu.degree}</div>
                    <div className="text-xs text-slate-400 mt-1">{edu.institution}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{edu.startDate} - {edu.endDate}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="w-[65%] p-8 bg-white">
        {personalInfo.summary && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-3 border-b-2 border-slate-100 pb-2">Profile</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {personalInfo.summary}
            </p>
          </section>
        )}

        {experiences?.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b-2 border-slate-100 pb-2">Experience</h2>
            <div className="space-y-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="relative pl-4 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-slate-300 before:rounded-full">
                  <h3 className="font-bold text-slate-900 text-base">{exp.role}</h3>
                  <div className="flex justify-between items-center mt-1 mb-2">
                    <span className="text-sm font-medium text-blue-600">{exp.company}</span>
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
