import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { callAITeacher, generateLessonContent, generateCurriculumLesson, generateTest, type AITeacherRequest } from "./openai-service";
import { AdminService } from "./admin-service";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = "gpt-4o";

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

  // Playground AI generation endpoint
  app.post("/api/playground-generate", async (req, res) => {
    try {
      const { toolType, prompt } = req.body;
      
      let systemPrompt = "";
      switch (toolType) {
        case 'logo':
          systemPrompt = `You are a professional logo designer. Create a detailed written description of a logo design based on this request: "${prompt}". Include colors, shapes, typography style, and the overall aesthetic. Be specific and creative but keep it appropriate for students.`;
          break;
        case 'story':
          systemPrompt = `You are a creative writing assistant. Write an engaging, age-appropriate short story (300-500 words) based on this prompt: "${prompt}". Make it creative, fun, and suitable for middle/high school students.`;
          break;
        case 'chatbot':
          systemPrompt = `You are helping design a chatbot. Based on this request: "${prompt}", provide a detailed description of the chatbot including its personality, main functions, sample conversation starters, and how it would interact with users. Keep it educational and appropriate.`;
          break;
        default:
          systemPrompt = `Help the user with their creative request: "${prompt}"`;
      }

      const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.8
      });

      const response = completion.choices[0]?.message?.content || 'Unable to generate content. Please try again.';
      
      res.json({ response });
    } catch (error) {
      console.error("Playground generation error:", error);
      res.status(500).json({ error: "Failed to generate content" });
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

  // Admin API endpoints
  app.get("/api/admin/stats", async (req, res) => {
    try {
      // In a real app, you'd validate admin permissions here
      const stats = await AdminService.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Admin stats error:", error);
      res.status(500).json({ error: "Failed to get admin stats" });
    }
  });

  app.get("/api/admin/sessions", async (req, res) => {
    try {
      const queryParams = req.query;
      const sessions = await AdminService.getSessionLogs(queryParams as any);
      res.json(sessions);
    } catch (error) {
      console.error("Session logs error:", error);
      res.status(500).json({ error: "Failed to get session logs" });
    }
  });

  app.get("/api/admin/flagged", async (req, res) => {
    try {
      const queryParams = req.query;
      const flagged = await AdminService.getFlaggedContent(queryParams as any);
      res.json(flagged);
    } catch (error) {
      console.error("Flagged content error:", error);
      res.status(500).json({ error: "Failed to get flagged content" });
    }
  });

  app.post("/api/admin/clear-flag", async (req, res) => {
    try {
      const { flagId, adminEmail } = req.body;
      const result = await AdminService.clearFlag(flagId, adminEmail);
      res.json(result);
    } catch (error) {
      console.error("Clear flag error:", error);
      res.status(500).json({ error: "Failed to clear flag" });
    }
  });

  app.post("/api/admin/grant-badge", async (req, res) => {
    try {
      const { userId, topicId, adminEmail } = req.body;
      const result = await AdminService.grantBadge(userId, topicId, adminEmail);
      res.json(result);
    } catch (error) {
      console.error("Grant badge error:", error);
      res.status(500).json({ error: "Failed to grant badge" });
    }
  });

  app.get("/api/admin/memory-insights", async (req, res) => {
    try {
      const insights = await AdminService.getStudentMemoryInsights();
      res.json(insights);
    } catch (error) {
      console.error("Memory insights error:", error);
      res.status(500).json({ error: "Failed to get memory insights" });
    }
  });

  app.post("/api/admin/reset-memory", async (req, res) => {
    try {
      const { userId, adminEmail } = req.body;
      const result = await AdminService.resetStudentMemory(userId, adminEmail);
      res.json(result);
    } catch (error) {
      console.error("Reset memory error:", error);
      res.status(500).json({ error: "Failed to reset student memory" });
    }
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
