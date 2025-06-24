import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import app from './firebase';

const db = getFirestore(app);

// Profanity and inappropriate content filter
const BLOCKED_WORDS = [
  'hack', 'hacking', 'password', 'bypass', 'exploit', 'attack', 'virus', 'malware',
  'violence', 'violent', 'kill', 'murder', 'bomb', 'weapon', 'fight',
  // Add more as needed - keeping it basic for demo
];

const OFF_TOPIC_KEYWORDS = [
  'game', 'gaming', 'movie', 'tv show', 'celebrity', 'dating', 'relationship',
  'politics', 'religion', 'sports', 'music', 'food', 'shopping'
];

export interface SafetyResult {
  isAllowed: boolean;
  reason?: string;
  filteredContent?: string;
}

export interface SessionLog {
  userId: string;
  gradeBand: string;
  lessonStep: number;
  action: 'lesson_start' | 'prompt_submit' | 'ai_response' | 'test_start' | 'test_complete';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// 1. Guardian Agent - Input/Output Filter
export class GuardianAgent {
  static async filterInput(content: string, userId: string, gradeBand: string): Promise<SafetyResult> {
    const lowerContent = content.toLowerCase();
    
    // Check for blocked words
    for (const word of BLOCKED_WORDS) {
      if (lowerContent.includes(word)) {
        await this.logViolation(userId, gradeBand, content, `Blocked word: ${word}`);
        return {
          isAllowed: false,
          reason: 'inappropriate_content',
          filteredContent: "Let's keep it safe and focused. Please try a different question related to AI."
        };
      }
    }
    
    // Check for off-topic content
    let offTopicCount = 0;
    for (const keyword of OFF_TOPIC_KEYWORDS) {
      if (lowerContent.includes(keyword)) {
        offTopicCount++;
      }
    }
    
    if (offTopicCount >= 2) {
      await this.logViolation(userId, gradeBand, content, 'Off-topic content');
      return {
        isAllowed: false,
        reason: 'off_topic',
        filteredContent: "Let's keep it safe and focused. Please try a different question related to AI."
      };
    }
    
    // Check length limits
    if (content.length > 1000) {
      await this.logViolation(userId, gradeBand, content, 'Content too long');
      return {
        isAllowed: false,
        reason: 'too_long',
        filteredContent: "Please keep your message shorter and more focused on AI topics."
      };
    }
    
    return { isAllowed: true };
  }
  
  static async filterOutput(content: string, userId: string, gradeBand: string): Promise<SafetyResult> {
    const lowerContent = content.toLowerCase();
    
    // Check for inappropriate AI responses
    for (const word of BLOCKED_WORDS) {
      if (lowerContent.includes(word)) {
        await this.logViolation(userId, gradeBand, content, `AI output blocked word: ${word}`);
        return {
          isAllowed: false,
          reason: 'inappropriate_ai_output',
          filteredContent: "I'm here to help you learn about AI in a safe and appropriate way. Let me try a different approach to answer your question."
        };
      }
    }
    
    return { isAllowed: true };
  }
  
  private static async logViolation(userId: string, gradeBand: string, content: string, reason: string) {
    try {
      await addDoc(collection(db, 'safety_violations'), {
        userId,
        gradeBand,
        content: content.substring(0, 500), // Limit stored content
        reason,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to log safety violation:', error);
    }
  }
}

// 2. Session Logger Agent - Activity Tracker
export class SessionLogger {
  static async logSession(log: SessionLog) {
    try {
      await addDoc(collection(db, 'session_logs', log.userId, 'sessions'), {
        gradeBand: log.gradeBand,
        lessonStep: log.lessonStep,
        action: log.action,
        content: log.content.substring(0, 1000), // Limit content size
        timestamp: serverTimestamp(),
        metadata: log.metadata || {}
      });
    } catch (error) {
      console.error('Failed to log session:', error);
    }
  }
  
  static async logLessonStart(userId: string, gradeBand: string, lessonStep: number) {
    await this.logSession({
      userId,
      gradeBand,
      lessonStep,
      action: 'lesson_start',
      content: `Started lesson step ${lessonStep}`,
      timestamp: new Date()
    });
  }
  
  static async logPromptSubmit(userId: string, gradeBand: string, lessonStep: number, prompt: string) {
    await this.logSession({
      userId,
      gradeBand,
      lessonStep,
      action: 'prompt_submit',
      content: prompt,
      timestamp: new Date()
    });
  }
  
  static async logAiResponse(userId: string, gradeBand: string, lessonStep: number, response: string) {
    await this.logSession({
      userId,
      gradeBand,
      lessonStep,
      action: 'ai_response',
      content: response,
      timestamp: new Date()
    });
  }
  
  static async logTestStart(userId: string, gradeBand: string) {
    await this.logSession({
      userId,
      gradeBand,
      lessonStep: 0,
      action: 'test_start',
      content: 'AI knowledge test started',
      timestamp: new Date()
    });
  }
  
  static async logTestComplete(userId: string, gradeBand: string, score: number, answers: any[]) {
    await this.logSession({
      userId,
      gradeBand,
      lessonStep: 0,
      action: 'test_complete',
      content: `Test completed with score: ${score}%`,
      timestamp: new Date(),
      metadata: { score, totalAnswers: answers.length }
    });
  }
}

// 3. Role Validator Agent - Access Control
export class RoleValidator {
  static validateGradeBandAccess(userGradeBand: string, requestedGradeBand: string): boolean {
    // Middle school students (6-8) cannot access high school content (9-12)
    if (userGradeBand === 'middle' && requestedGradeBand === 'high') {
      return false;
    }
    return true;
  }
  
  static validateAdminAccess(userEmail: string): boolean {
    const adminEmails = [
      'admin@aistarter.school',
      'teacher@aistarter.school',
      'support@aistarter.school'
    ];
    return adminEmails.includes(userEmail);
  }
  
  static getGradeBandFromGrade(grade: string): 'middle' | 'high' {
    const gradeNum = parseInt(grade);
    return gradeNum <= 8 ? 'middle' : 'high';
  }
  
  static validateLessonAccess(userGradeBand: string, lessonId: string): boolean {
    // Some lessons might be restricted by grade band
    const highSchoolOnlyLessons = ['advanced-ml', 'neural-networks', 'ai-ethics-advanced'];
    
    if (userGradeBand === 'middle' && highSchoolOnlyLessons.includes(lessonId)) {
      return false;
    }
    
    return true;
  }
}

// Utility function to get user ID safely
export function getUserId(): string {
  // In a real app, this would get the authenticated user ID
  // For now, we'll use a session-based approach
  let userId = sessionStorage.getItem('tempUserId');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('tempUserId', userId);
  }
  return userId;
}

// Progress tracking in Firebase
export async function saveUserProgress(userId: string, gradeBand: string, lessonStep: number, completed: boolean) {
  try {
    await addDoc(collection(db, 'user_progress'), {
      userId,
      gradeBand,
      lessonStep,
      completed,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
}