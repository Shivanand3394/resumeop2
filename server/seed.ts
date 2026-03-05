import { storage } from "./storage";

async function seed() {
  try {
    const existing = await storage.getResumes();
    if (existing.length === 0) {
      await storage.createResume({
        title: "Modern Resume",
        templateId: "modern",
        contentJson: {
          personalInfo: {
            fullName: "Jane Doe",
            email: "jane@example.com",
            phone: "(555) 123-4567",
            location: "San Francisco, CA",
            website: "https://janedoe.com",
            summary: "Experienced software engineer specializing in full-stack web development."
          },
          experience: [
            {
              id: "1",
              role: "Senior Developer",
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
              institution: "University of Technology",
              startDate: "2015",
              endDate: "2019"
            }
          ],
          skills: [{ id: "1", name: "JavaScript" }, { id: "2", name: "React" }]
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
