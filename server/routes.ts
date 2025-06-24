import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { callAITeacher, generateLessonContent, type AITeacherRequest } from "./openai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // AI Teacher API endpoints
  app.post("/api/ai-teacher", async (req, res) => {
    try {
      const request: AITeacherRequest = req.body;
      const response = await callAITeacher(request);
      res.json(response);
    } catch (error) {
      console.error("AI Teacher API error:", error);
      res.status(500).json({ error: "Failed to process AI teacher request" });
    }
  });

  app.post("/api/generate-lesson", async (req, res) => {
    try {
      const { gradeBand, lessonStep } = req.body;
      const content = await generateLessonContent(gradeBand, lessonStep);
      res.json({ content });
    } catch (error) {
      console.error("Lesson generation error:", error);
      res.status(500).json({ error: "Failed to generate lesson content" });
    }
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
