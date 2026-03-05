// Shared frontend types for the resume JSON structure
export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
}

export interface ResumeContent {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
}

export const defaultResumeContent: ResumeContent = {
  personalInfo: {
    fullName: "Jane Doe",
    email: "jane@example.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    website: "janedoe.com",
    summary: "Passionate software engineer with a knack for building beautiful, scalable user interfaces.",
  },
  experiences: [
    {
      id: "exp-1",
      company: "Tech Corp",
      role: "Senior Frontend Engineer",
      startDate: "Jan 2021",
      endDate: "Present",
      description: "Led the development of the core application using React and TypeScript. Improved performance by 40%.",
    }
  ],
  education: [
    {
      id: "edu-1",
      institution: "State University",
      degree: "B.S. Computer Science",
      startDate: "Sep 2016",
      endDate: "Jun 2020",
    }
  ],
  skills: [
    { id: "skill-1", name: "React" },
    { id: "skill-2", name: "TypeScript" },
    { id: "skill-3", name: "Tailwind CSS" }
  ],
};
