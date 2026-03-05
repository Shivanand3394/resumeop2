import { storage } from "./storage";

async function seed() {
  try {
    const existing = await storage.getResumes();
    if (existing.length === 0) {
      await storage.createResume({
        title: "Software Engineer Resume",
        templateId: "modern",
        contentJson: {
          personalInfo: {
            name: "Jane Doe",
            email: "jane@example.com",
            phone: "(555) 123-4567",
            location: "San Francisco, CA",
            website: "https://janedoe.com"
          },
          summary: "Experienced software engineer specializing in full-stack web development.",
          experience: [
            {
              id: "1",
              title: "Senior Developer",
              company: "Tech Corp",
              startDate: "2020",
              endDate: "Present",
              description: "Led development of core platform features."
            }
          ],
          education: [
            {
              id: "1",
              degree: "BS Computer Science",
              school: "University of Technology",
              year: "2019"
            }
          ],
          skills: ["JavaScript", "React", "Node.js", "PostgreSQL"]
        }
      });
      console.log("Database seeded!");
    } else {
      console.log("Database already has data.");
    }
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
