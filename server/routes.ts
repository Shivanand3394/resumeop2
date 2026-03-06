import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import puppeteer from "puppeteer";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.resumes.list.path, async (req, res) => {
    const resumesList = await storage.getResumes();
    res.json(resumesList);
  });

  app.get(api.resumes.get.path, async (req, res) => {
    const id = req.params.id;
    const resume = await storage.getResume(id);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.json(resume);
  });

  app.post(api.resumes.create.path, async (req, res) => {
    try {
      const input = api.resumes.create.input.parse(req.body);
      const resume = await storage.createResume(input);
      res.status(201).json(resume);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.resumes.update.path, async (req, res) => {
    try {
      const id = req.params.id;
      const input = api.resumes.update.input.parse(req.body);
      const resume = await storage.updateResume(id, input);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      res.status(200).json(resume);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.resumes.delete.path, async (req, res) => {
    try {
      const id = req.params.id;
      await storage.deleteResume(id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.resumes.duplicate.path, async (req, res) => {
    try {
      const id = req.params.id;
      const resume = await storage.duplicateResume(id);
      res.status(201).json(resume);
    } catch (err) {
      if (err instanceof Error && err.message === "Resume not found") {
         return res.status(404).json({ message: err.message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/resumes/:id/export/pdf', async (req, res) => {
    try {
      const id = req.params.id;
      const resume = await storage.getResume(id);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
      const page = await browser.newPage();
      
      const protocol = req.protocol === 'http' && req.headers['x-forwarded-proto'] ? req.headers['x-forwarded-proto'] : req.protocol;
      const host = req.get('host');
      const url = `${protocol}://${host}/resumes/${id}/preview`;
      
      await page.goto(url, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      await browser.close();

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume-${id}.pdf"`
      });
      
      res.send(pdfBuffer);
    } catch (err) {
      console.error("PDF export error:", err);
      res.status(500).json({ message: "Error generating PDF" });
    }
  });

  // Job Tracker Routes
  app.get(api.jobs.list.path, async (req, res) => {
    const jobs = await storage.getJobs();
    res.json(jobs);
  });

  app.post(api.jobs.create.path, async (req, res) => {
    try {
      const input = api.jobs.create.input.parse(req.body);
      const job = await storage.createJob(input);
      res.status(201).json(job);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.jobs.update.path, async (req, res) => {
    try {
      const id = req.params.id;
      const input = api.jobs.update.input.parse(req.body);
      const job = await storage.updateJob(id, input);
      res.json(job);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.jobs.delete.path, async (req, res) => {
    try {
      const id = req.params.id;
      await storage.deleteJob(id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
