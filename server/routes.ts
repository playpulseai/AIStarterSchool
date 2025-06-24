import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { callAITeacher, generateLessonContent, generateCurriculumLesson, generateTest, type AITeacherRequest } from "./openai-service";

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

  app.post("/api/generate-curriculum-lesson", async (req, res) => {
    try {
      const { topicId, topicTitle, stepNumber, gradeBand, totalSteps } = req.body;
      const lesson = await generateCurriculumLesson(topicId, topicTitle, stepNumber, gradeBand, totalSteps);
      res.json(lesson);
    } catch (error) {
      console.error("Curriculum lesson generation error:", error);
      res.status(500).json({ error: "Failed to generate curriculum lesson" });
    }
  });

  app.post("/api/generate-test", async (req, res) => {
    try {
      const { topicId, gradeBand, questionCount } = req.body;
      const test = await generateTest(topicId, gradeBand, questionCount);
      res.json(test);
    } catch (error) {
      console.error("Test generation error:", error);
      res.status(500).json({ error: "Failed to generate test" });
    }
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
