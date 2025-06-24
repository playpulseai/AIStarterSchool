import { getFirestore, collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import app from './firebase';
import { apiRequest } from './queryClient';
import { SessionLogger, getUserId } from './safety-agents';
import { SmartMemory } from './smart-memory';

const db = getFirestore(app);

export interface CurriculumTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
  totalLessons: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
}

export interface Lesson {
  id: string;
  topicId: string;
  stepNumber: number;
  title: string;
  description: string;
  task: string;
  promptSuggestion: string;
  gradeBand: 'middle' | 'high';
  estimatedTime: number; // minutes
}

export interface StudentProgress {
  userId: string;
  topicId: string;
  currentLesson: number;
  completedLessons: number[];
  testTaken: boolean;
  testScore?: number;
  badgeUnlocked: boolean;
  lastActivity: Date;
}

export interface TestQuestion {
  id: string;
  topicId: string;
  question: string;
  type: 'multiple_choice' | 'short_answer';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  gradeBand: 'middle' | 'high' | 'both';
}

export interface TestResult {
  userId: string;
  topicId: string;
  score: number;
  totalQuestions: number;
  answers: any[];
  timeSpent: number;
  passed: boolean;
  timestamp: Date;
}

// Curriculum Topics Configuration
export const CURRICULUM_TOPICS: CurriculumTopic[] = [
  {
    id: 'prompting-basics',
    title: 'Prompting Basics',
    description: 'Master the art of writing clear, effective AI prompts',
    icon: '🌱',
    totalLessons: 5,
    difficulty: 'beginner'
  },
  {
    id: 'ai-art',
    title: 'AI Art Creation',
    description: 'Create stunning artwork using AI image generation tools',
    icon: '🎨',
    totalLessons: 5,
    difficulty: 'beginner'
  },
  {
    id: 'ai-for-school',
    title: 'AI for School',
    description: 'Use AI to enhance your learning and academic work',
    icon: '📚',
    totalLessons: 5,
    difficulty: 'intermediate',
    prerequisites: ['prompting-basics']
  },
  {
    id: 'automation',
    title: 'AI Automation',
    description: 'Automate everyday tasks with AI-powered workflows',
    icon: '⚡',
    totalLessons: 5,
    difficulty: 'intermediate',
    prerequisites: ['prompting-basics']
  },
  {
    id: 'ethics',
    title: 'AI Ethics',
    description: 'Learn responsible AI usage and ethical considerations',
    icon: '⚖️',
    totalLessons: 5,
    difficulty: 'advanced',
    prerequisites: ['prompting-basics', 'ai-for-school']
  }
];

// Curriculum Generator Agent
export class CurriculumGenerator {
  static async generateLesson(topicId: string, stepNumber: number, gradeBand: 'middle' | 'high'): Promise<Lesson> {
    const topic = CURRICULUM_TOPICS.find(t => t.id === topicId);
    if (!topic) throw new Error('Topic not found');

    try {
      const response = await apiRequest<{
        title: string;
        description: string;
        task: string;
        promptSuggestion: string;
      }>('/api/generate-curriculum-lesson', {
        method: 'POST',
        body: JSON.stringify({
          topicId,
          topicTitle: topic.title,
          stepNumber,
          gradeBand,
          totalSteps: topic.totalLessons
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const lesson: Lesson = {
        id: `${topicId}-lesson-${stepNumber}`,
        topicId,
        stepNumber,
        title: response.title,
        description: response.description,
        task: response.task,
        promptSuggestion: response.promptSuggestion,
        gradeBand,
        estimatedTime: gradeBand === 'middle' ? 15 : 20
      };

      return lesson;
    } catch (error) {
      console.error('Failed to generate lesson:', error);
      // Fallback lesson structure
      return this.getFallbackLesson(topicId, stepNumber, gradeBand);
    }
  }

  private static getFallbackLesson(topicId: string, stepNumber: number, gradeBand: 'middle' | 'high'): Lesson {
    const lessonTemplates = {
      'prompting-basics': [
        'Introduction to AI Prompts',
        'Clear and Specific Instructions',
        'Adding Context to Prompts',
        'Advanced Prompting Techniques',
        'Prompt Optimization and Testing'
      ],
      'ai-art': [
        'Introduction to AI Art Tools',
        'Basic Image Prompts',
        'Style and Composition',
        'Advanced Art Techniques',
        'Creating Art Projects'
      ],
      'ai-for-school': [
        'AI Study Assistants',
        'Research and Writing Help',
        'Problem-Solving with AI',
        'Creative Projects',
        'Academic Ethics with AI'
      ],
      'automation': [
        'Understanding Automation',
        'Simple Task Automation',
        'Workflow Creation',
        'Advanced Automation',
        'Building Your Own Tools'
      ],
      'ethics': [
        'AI and Society',
        'Bias and Fairness',
        'Privacy and Data',
        'Responsible Usage',
        'Future Considerations'
      ]
    };

    const titles = lessonTemplates[topicId as keyof typeof lessonTemplates] || ['AI Lesson'];
    
    return {
      id: `${topicId}-lesson-${stepNumber}`,
      topicId,
      stepNumber,
      title: titles[stepNumber - 1] || `Lesson ${stepNumber}`,
      description: `Learn about ${titles[stepNumber - 1]?.toLowerCase() || 'AI concepts'}`,
      task: `Complete the interactive lesson on ${titles[stepNumber - 1]?.toLowerCase()}`,
      promptSuggestion: 'Try creating a prompt related to this lesson topic',
      gradeBand,
      estimatedTime: gradeBand === 'middle' ? 15 : 20
    };
  }

  static async getAllLessons(topicId: string, gradeBand: 'middle' | 'high'): Promise<Lesson[]> {
    const lessons: Lesson[] = [];
    const topic = CURRICULUM_TOPICS.find(t => t.id === topicId);
    
    if (!topic) return lessons;

    for (let i = 1; i <= topic.totalLessons; i++) {
      const lesson = await this.generateLesson(topicId, i, gradeBand);
      lessons.push(lesson);
    }

    return lessons;
  }
}

// Student Progress Tracking
export class ProgressTracker {
  static async getStudentProgress(userId: string, topicId: string): Promise<StudentProgress | null> {
    try {
      const progressRef = collection(db, 'student_progress');
      const q = query(progressRef, where('userId', '==', userId), where('topicId', '==', topicId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return null;
      
      const data = snapshot.docs[0].data();
      return {
        userId: data.userId,
        topicId: data.topicId,
        currentLesson: data.currentLesson,
        completedLessons: data.completedLessons || [],
        testTaken: data.testTaken || false,
        testScore: data.testScore,
        badgeUnlocked: data.badgeUnlocked || false,
        lastActivity: data.lastActivity?.toDate() || new Date()
      };
    } catch (error) {
      console.error('Failed to get student progress:', error);
      return null;
    }
  }

  static async updateProgress(userId: string, topicId: string, lessonNumber: number) {
    try {
      const existing = await this.getStudentProgress(userId, topicId);
      
      if (existing) {
        const progressRef = collection(db, 'student_progress');
        const q = query(progressRef, where('userId', '==', userId), where('topicId', '==', topicId));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const docRef = snapshot.docs[0].ref;
          const completedLessons = [...new Set([...existing.completedLessons, lessonNumber])];
          
          await updateDoc(docRef, {
            currentLesson: Math.max(existing.currentLesson, lessonNumber),
            completedLessons,
            lastActivity: serverTimestamp()
          });
        }
      } else {
        await addDoc(collection(db, 'student_progress'), {
          userId,
          topicId,
          currentLesson: lessonNumber,
          completedLessons: [lessonNumber],
          testTaken: false,
          badgeUnlocked: false,
          lastActivity: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  }

  static async markTestTaken(userId: string, topicId: string, score: number, passed: boolean) {
    try {
      const progressRef = collection(db, 'student_progress');
      const q = query(progressRef, where('userId', '==', userId), where('topicId', '==', topicId));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, {
          testTaken: true,
          testScore: score,
          badgeUnlocked: passed,
          lastActivity: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Failed to mark test taken:', error);
    }
  }

  static async getAllTopicProgress(userId: string): Promise<StudentProgress[]> {
    try {
      const progressRef = collection(db, 'student_progress');
      const q = query(progressRef, where('userId', '==', userId), orderBy('lastActivity', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          userId: data.userId,
          topicId: data.topicId,
          currentLesson: data.currentLesson,
          completedLessons: data.completedLessons || [],
          testTaken: data.testTaken || false,
          testScore: data.testScore,
          badgeUnlocked: data.badgeUnlocked || false,
          lastActivity: data.lastActivity?.toDate() || new Date()
        };
      });
    } catch (error) {
      console.error('Failed to get all topic progress:', error);
      return [];
    }
  }
}

// Test Generator Agent
export class TestGenerator {
  static async generateTest(topicId: string, gradeBand: 'middle' | 'high'): Promise<TestQuestion[]> {
    try {
      const response = await apiRequest<{ questions: TestQuestion[] }>('/api/generate-test', {
        method: 'POST',
        body: JSON.stringify({
          topicId,
          gradeBand,
          questionCount: gradeBand === 'middle' ? 3 : 5
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.questions;
    } catch (error) {
      console.error('Failed to generate test:', error);
      return this.getFallbackTest(topicId, gradeBand);
    }
  }

  private static getFallbackTest(topicId: string, gradeBand: 'middle' | 'high'): TestQuestion[] {
    const fallbackQuestions: Record<string, TestQuestion[]> = {
      'prompting-basics': [
        {
          id: 'pb-1',
          topicId,
          question: 'What makes a good AI prompt?',
          type: 'multiple_choice',
          options: ['Being very short', 'Being clear and specific', 'Using big words', 'Writing in all caps'],
          correctAnswer: 1,
          explanation: 'Clear and specific prompts help AI understand exactly what you want.',
          gradeBand: 'both'
        },
        {
          id: 'pb-2',
          topicId,
          question: 'Which prompt would work better for generating a story?',
          type: 'multiple_choice',
          options: [
            'Write a story',
            'Write a 200-word adventure story about a young explorer discovering a hidden cave',
            'Story please',
            'Make it good'
          ],
          correctAnswer: 1,
          explanation: 'Specific prompts with details about length, genre, and characters produce better results.',
          gradeBand: 'both'
        }
      ]
    };

    return fallbackQuestions[topicId] || [];
  }

  static async saveTestResult(result: TestResult) {
    try {
      await addDoc(collection(db, 'test_results'), {
        userId: result.userId,
        topicId: result.topicId,
        score: result.score,
        totalQuestions: result.totalQuestions,
        answers: result.answers,
        timeSpent: result.timeSpent,
        passed: result.passed,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to save test result:', error);
    }
  }

  static gradeTest(questions: TestQuestion[], answers: any[]): { score: number; passed: boolean; results: any[] } {
    let correct = 0;
    const results = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const answer = answers[i];
      const isCorrect = question.correctAnswer === answer;
      
      if (isCorrect) correct++;
      
      results.push({
        questionId: question.id,
        question: question.question,
        userAnswer: answer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      });
    }

    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= 70; // 70% passing grade

    return { score, passed, results };
  }
}