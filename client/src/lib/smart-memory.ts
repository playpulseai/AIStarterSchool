import { getUserId } from './safety-agents';

export interface StudentMemory {
  userId: string;
  lastLessonTopic?: string;
  missedTestConcepts: string[];
  preferredLearningStyle: 'visual' | 'text' | 'voice' | 'examples';
  frequentPromptMistakes: string[];
  strengthAreas: string[];
  weaknessAreas: string[];
  lastActivityDate: Date;
  totalLessonsCompleted: number;
  averageTestScore: number;
  interactionPatterns: {
    asksForExamples: boolean;
    needsEncouragement: boolean;
    prefersStepByStep: boolean;
    respondsToVisuals: boolean;
  };
  gradeBand: 'middle' | 'high';
}

export interface MemoryUpdate {
  lessonTopic?: string;
  testResults?: {
    score: number;
    missedConcepts: string[];
  };
  interactionData?: {
    askedForExamples: boolean;
    neededEncouragement: boolean;
    usedVaguePrompts: boolean;
    responseTime: number;
  };
  learningStyleIndicators?: {
    requestedVisuals: boolean;
    usedVoice: boolean;
    preferredText: boolean;
  };
}

export class SmartMemory {
  private static getDefaultMemory(userId: string, gradeBand: 'middle' | 'high'): StudentMemory {
    return {
      userId,
      missedTestConcepts: [],
      preferredLearningStyle: 'text',
      frequentPromptMistakes: [],
      strengthAreas: [],
      weaknessAreas: [],
      lastActivityDate: new Date(),
      totalLessonsCompleted: 0,
      averageTestScore: 0,
      interactionPatterns: {
        asksForExamples: false,
        needsEncouragement: false,
        prefersStepByStep: false,
        respondsToVisuals: false
      },
      gradeBand
    };
  }

  static async getStudentMemory(userId?: string, gradeBand: 'middle' | 'high' = 'middle'): Promise<StudentMemory> {
    try {
      const actualUserId = userId || getUserId();
      
      // In a real implementation, this would fetch from Firebase
      // For now, return a mock memory based on user patterns
      const stored = localStorage.getItem(`student_memory_${actualUserId}`);
      
      if (stored) {
        const memory = JSON.parse(stored);
        memory.lastActivityDate = new Date(memory.lastActivityDate);
        return memory;
      }
      
      return this.getDefaultMemory(actualUserId, gradeBand);
    } catch (error) {
      console.error('Failed to load student memory:', error);
      return this.getDefaultMemory(userId || getUserId(), gradeBand);
    }
  }

  static async updateStudentMemory(update: MemoryUpdate, userId?: string): Promise<void> {
    try {
      const actualUserId = userId || getUserId();
      const currentMemory = await this.getStudentMemory(actualUserId);
      
      // Update lesson topic
      if (update.lessonTopic) {
        currentMemory.lastLessonTopic = update.lessonTopic;
        currentMemory.totalLessonsCompleted += 1;
      }

      // Update test results
      if (update.testResults) {
        const { score, missedConcepts } = update.testResults;
        
        // Update average test score
        const totalTests = Math.max(1, Math.floor(currentMemory.totalLessonsCompleted / 5));
        currentMemory.averageTestScore = (
          (currentMemory.averageTestScore * (totalTests - 1) + score) / totalTests
        );
        
        // Add missed concepts
        missedConcepts.forEach(concept => {
          if (!currentMemory.missedTestConcepts.includes(concept)) {
            currentMemory.missedTestConcepts.push(concept);
          }
        });
        
        // Identify strength/weakness areas
        if (score >= 80) {
          if (currentMemory.lastLessonTopic && !currentMemory.strengthAreas.includes(currentMemory.lastLessonTopic)) {
            currentMemory.strengthAreas.push(currentMemory.lastLessonTopic);
          }
        } else if (score < 70) {
          if (currentMemory.lastLessonTopic && !currentMemory.weaknessAreas.includes(currentMemory.lastLessonTopic)) {
            currentMemory.weaknessAreas.push(currentMemory.lastLessonTopic);
          }
        }
      }

      // Update interaction patterns
      if (update.interactionData) {
        const { askedForExamples, neededEncouragement, usedVaguePrompts } = update.interactionData;
        
        currentMemory.interactionPatterns.asksForExamples = 
          currentMemory.interactionPatterns.asksForExamples || askedForExamples;
        currentMemory.interactionPatterns.needsEncouragement = 
          currentMemory.interactionPatterns.needsEncouragement || neededEncouragement;
        
        if (usedVaguePrompts) {
          const mistake = 'Uses vague or unclear prompts';
          if (!currentMemory.frequentPromptMistakes.includes(mistake)) {
            currentMemory.frequentPromptMistakes.push(mistake);
          }
        }
      }

      // Update learning style preferences
      if (update.learningStyleIndicators) {
        const { requestedVisuals, usedVoice, preferredText } = update.learningStyleIndicators;
        
        if (requestedVisuals) {
          currentMemory.preferredLearningStyle = 'visual';
          currentMemory.interactionPatterns.respondsToVisuals = true;
        } else if (usedVoice) {
          currentMemory.preferredLearningStyle = 'voice';
        } else if (preferredText) {
          currentMemory.preferredLearningStyle = 'text';
        }
      }

      currentMemory.lastActivityDate = new Date();

      // Save to localStorage (in real app, would save to Firebase)
      localStorage.setItem(`student_memory_${actualUserId}`, JSON.stringify(currentMemory));
      
      console.log('Student memory updated:', currentMemory);
    } catch (error) {
      console.error('Failed to update student memory:', error);
    }
  }

  static generateSystemPromptInjection(memory: StudentMemory): string {
    const injections: string[] = [];
    
    // Grade band context
    injections.push(`This student is in grade band ${memory.gradeBand === 'middle' ? '6-8' : '9-12'}.`);
    
    // Last lesson context
    if (memory.lastLessonTopic) {
      injections.push(`They last studied "${memory.lastLessonTopic}".`);
    }
    
    // Learning style adaptation
    injections.push(`Their preferred learning style is ${memory.preferredLearningStyle}.`);
    
    if (memory.preferredLearningStyle === 'visual') {
      injections.push('Use visual descriptions, analogies, and suggest they imagine concepts.');
    } else if (memory.preferredLearningStyle === 'voice') {
      injections.push('Use conversational tone and suggest they read responses aloud.');
    } else if (memory.preferredLearningStyle === 'examples') {
      injections.push('Always provide concrete examples before explaining concepts.');
    }
    
    // Interaction patterns
    if (memory.interactionPatterns.asksForExamples) {
      injections.push('This student often asks for examples - provide them proactively.');
    }
    
    if (memory.interactionPatterns.needsEncouragement) {
      injections.push('This student needs encouragement - be supportive and celebrate progress.');
    }
    
    if (memory.interactionPatterns.prefersStepByStep) {
      injections.push('Break down complex tasks into clear, numbered steps.');
    }
    
    // Weakness areas to address
    if (memory.weaknessAreas.length > 0) {
      injections.push(`Areas where they struggle: ${memory.weaknessAreas.join(', ')}. Provide extra support in these areas.`);
    }
    
    // Strength areas to leverage
    if (memory.strengthAreas.length > 0) {
      injections.push(`Their strong areas: ${memory.strengthAreas.join(', ')}. Use these to build confidence.`);
    }
    
    // Missed test concepts
    if (memory.missedTestConcepts.length > 0) {
      injections.push(`Previously missed test concepts: ${memory.missedTestConcepts.slice(-3).join(', ')}. Review these when relevant.`);
    }
    
    // Prompt mistakes to help with
    if (memory.frequentPromptMistakes.length > 0) {
      injections.push(`Common prompt mistakes to help with: ${memory.frequentPromptMistakes.join(', ')}.`);
    }
    
    // Experience level
    if (memory.totalLessonsCompleted < 3) {
      injections.push('This is a new student - be extra patient and explain AI concepts clearly.');
    } else if (memory.totalLessonsCompleted > 20) {
      injections.push('This is an experienced student - you can use more advanced concepts.');
    }
    
    // Performance level
    if (memory.averageTestScore > 85) {
      injections.push('This student is high-performing - challenge them with advanced questions.');
    } else if (memory.averageTestScore < 70) {
      injections.push('This student needs more support - go slower and check understanding frequently.');
    }
    
    return injections.join(' ');
  }

  static async logLessonStart(topicId: string, gradeBand: 'middle' | 'high'): Promise<void> {
    await this.updateStudentMemory({
      lessonTopic: topicId
    });
  }

  static async logTestResult(score: number, missedConcepts: string[]): Promise<void> {
    await this.updateStudentMemory({
      testResults: {
        score,
        missedConcepts
      }
    });
  }

  static async logInteraction(data: {
    askedForExamples?: boolean;
    neededEncouragement?: boolean;
    usedVaguePrompts?: boolean;
    requestedVisuals?: boolean;
    usedVoice?: boolean;
    preferredText?: boolean;
  }): Promise<void> {
    await this.updateStudentMemory({
      interactionData: {
        askedForExamples: data.askedForExamples || false,
        neededEncouragement: data.neededEncouragement || false,
        usedVaguePrompts: data.usedVaguePrompts || false,
        responseTime: 0
      },
      learningStyleIndicators: {
        requestedVisuals: data.requestedVisuals || false,
        usedVoice: data.usedVoice || false,
        preferredText: data.preferredText || false
      }
    });
  }

  static async getMemoryInsights(userId?: string): Promise<{
    totalLessons: number;
    averageScore: number;
    strongAreas: string[];
    improvementAreas: string[];
    learningStyle: string;
    lastActivity: Date;
  }> {
    const memory = await this.getStudentMemory(userId);
    
    return {
      totalLessons: memory.totalLessonsCompleted,
      averageScore: memory.averageTestScore,
      strongAreas: memory.strengthAreas,
      improvementAreas: memory.weaknessAreas,
      learningStyle: memory.preferredLearningStyle,
      lastActivity: memory.lastActivityDate
    };
  }
}