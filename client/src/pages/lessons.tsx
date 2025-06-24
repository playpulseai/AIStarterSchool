import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, Send, Volume2, RotateCcw, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GuardianAgent, SessionLogger, RoleValidator, getUserId, saveUserProgress } from '@/lib/safety-agents';
import { apiRequest } from '@/lib/queryClient';

const LESSON_STEPS = [
  { id: 1, title: 'Prompting Basics', icon: '🌱', description: 'Learn how to write clear instructions for AI' },
  { id: 2, title: 'AI Writing', icon: '✍️', description: 'Create stories and content with AI assistance' },
  { id: 3, title: 'AI Art Generation', icon: '🎨', description: 'Generate images and artwork using AI' },
  { id: 4, title: 'AI Productivity', icon: '🧠', description: 'Use AI to boost your everyday productivity' },
  { id: 5, title: 'Ethics & Responsibility', icon: '💼', description: 'Learn responsible AI usage and ethics' },
];

const GRADE_LEVELS = {
  'middle': { label: 'Grades 6-8', range: '6-8' },
  'high': { label: 'Grades 9-12', range: '9-12' }
};

export default function Lessons() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gradeLevel, setGradeLevel] = useState<'middle' | 'high'>('middle');
  const [currentStep, setCurrentStep] = useState(1);
  const [lessonActive, setLessonActive] = useState(false);
  const [studentResponse, setStudentResponse] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'ai' | 'student', content: string, timestamp: Date }>>([]);

  // Autonomous AI Teacher System Prompt
  const getSystemPrompt = (grade: 'middle' | 'high', step: number) => {
    const gradeRange = GRADE_LEVELS[grade].range;
    const currentLesson = LESSON_STEPS[step - 1];
    
    return `You are an Autonomous AI Teacher developed by AIStarter School.

Your mission is to teach students (Grades ${gradeRange}) how to use artificial intelligence in everyday life. You operate completely independently: delivering voice lessons, asking questions, evaluating input, and progressing students through lessons.

🧠 Focus Areas:
- Prompting basics
- AI writing, storytelling
- AI image generation
- AI productivity tools
- Ethics and responsibility

🎓 Teaching Format:
1. Greet the student: "Hi, I'm your AI teacher for today…"
2. Deliver 5-step lesson on "${currentLesson.title}"
3. Ask student to try a task
4. Wait for response → give feedback
5. Repeat or advance

🔒 Rules:
- Only respond to age-appropriate questions for grades ${gradeRange}
- Redirect inappropriate input: "Let's stay focused on AI learning."
- All interactions monitored by background agents
- Log all sessions, prompts, and test attempts

Your goal: build real AI fluency. Stay in teacher mode. Don't break character.

Current lesson: ${currentLesson.title} - ${currentLesson.description}`;
  };

  const startLesson = async () => {
    const userId = getUserId();
    const currentGradeBand = gradeLevel;
    
    // Role validation
    if (!RoleValidator.validateGradeBandAccess(currentGradeBand, currentGradeBand)) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have access to this grade level content.",
      });
      return;
    }

    setLessonActive(true);
    setConversationHistory([]);
    setLessonProgress(20);
    setIsLoading(true);

    // Log lesson start
    await SessionLogger.logLessonStart(userId, currentGradeBand, currentStep);

    try {
      // Generate initial lesson content using OpenAI
      const response = await apiRequest<{ content: string }>('/api/generate-lesson', {
        method: 'POST',
        body: JSON.stringify({
          gradeBand: currentGradeBand,
          lessonStep: currentStep
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const greeting = response.content || `Hi, I'm your AI teacher for today! 👋 

I'm here to guide you through "${LESSON_STEPS[currentStep - 1].title}" - an exciting lesson designed specifically for students in ${GRADE_LEVELS[gradeLevel].label}.

${LESSON_STEPS[currentStep - 1].description}

Let's start with a quick question: What do you think artificial intelligence is, and have you used any AI tools before? Don't worry if you're not sure - that's exactly why we're here to learn together!

Type your answer below and let's begin this amazing journey! 🚀`;

      // Filter AI output through Guardian Agent
      const filterResult = await GuardianAgent.filterOutput(greeting, userId, currentGradeBand);
      const finalGreeting = filterResult.isAllowed ? greeting : filterResult.filteredContent!;

      setAiResponse(finalGreeting);
      setConversationHistory(prev => [...prev, { 
        role: 'ai', 
        content: finalGreeting, 
        timestamp: new Date() 
      }]);

      // Log AI response
      await SessionLogger.logAiResponse(userId, currentGradeBand, currentStep, finalGreeting);
      
    } catch (error) {
      console.error('Failed to start lesson:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start lesson. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitResponse = async () => {
    if (!studentResponse.trim()) return;

    const userId = getUserId();
    const currentGradeBand = gradeLevel;
    const userMessage = studentResponse;

    // Filter user input through Guardian Agent
    const inputFilter = await GuardianAgent.filterInput(userMessage, userId, currentGradeBand);
    if (!inputFilter.isAllowed) {
      toast({
        variant: "destructive",
        title: "Content Filter",
        description: inputFilter.filteredContent,
      });
      return;
    }

    setIsLoading(true);
    setStudentResponse('');

    // Log user prompt
    await SessionLogger.logPromptSubmit(userId, currentGradeBand, currentStep, userMessage);

    // Add student response to history
    setConversationHistory(prev => [...prev, { 
      role: 'student', 
      content: userMessage, 
      timestamp: new Date() 
    }]);

    try {
      // Call OpenAI AI Teacher service
      const aiRequest = {
        message: userMessage,
        gradeBand: currentGradeBand,
        lessonStep: currentStep,
        conversationHistory: conversationHistory.map(msg => ({
          role: msg.role === 'student' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }))
      };

      const aiResult = await apiRequest<{response: string, lessonComplete: boolean, nextStep?: number}>('/api/ai-teacher', {
        method: 'POST',
        body: JSON.stringify(aiRequest),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Filter AI output through Guardian Agent
      const outputFilter = await GuardianAgent.filterOutput(aiResult.response, userId, currentGradeBand);
      const finalResponse = outputFilter.isAllowed ? aiResult.response : outputFilter.filteredContent!;

      setAiResponse(finalResponse);
      setConversationHistory(prev => [...prev, { 
        role: 'ai', 
        content: finalResponse, 
        timestamp: new Date() 
      }]);

      // Log AI response
      await SessionLogger.logAiResponse(userId, currentGradeBand, currentStep, finalResponse);
      
      // Update progress
      const newProgress = Math.min(lessonProgress + 15, 100);
      setLessonProgress(newProgress);

      // Save progress to Firebase
      if (aiResult.lessonComplete) {
        setLessonProgress(100);
        await saveUserProgress(userId, currentGradeBand, currentStep, true);
      }
      
    } catch (error) {
      console.error('Failed to get AI response:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get AI response. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextLesson = () => {
    if (currentStep < LESSON_STEPS.length) {
      setCurrentStep(prev => prev + 1);
      setLessonActive(false);
      setLessonProgress(0);
      setConversationHistory([]);
      setAiResponse('');
    }
  };

  const resetLesson = () => {
    setLessonActive(false);
    setLessonProgress(0);
    setConversationHistory([]);
    setAiResponse('');
    setStudentResponse('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            👋 Welcome back, {user?.email?.split('@')[0] || 'Student'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Ready to continue your AI learning journey?
          </p>
          
          {/* Grade Level Toggle */}
          <div className="flex space-x-4 mb-6">
            <Button
              variant={gradeLevel === 'middle' ? 'default' : 'outline'}
              onClick={() => setGradeLevel('middle')}
              className="flex items-center space-x-2"
            >
              <span>Grades 6-8</span>
            </Button>
            <Button
              variant={gradeLevel === 'high' ? 'default' : 'outline'}
              onClick={() => setGradeLevel('high')}
              className="flex items-center space-x-2"
            >
              <span>Grades 9-12</span>
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Learning Progress</h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Step {currentStep} of {LESSON_STEPS.length}
            </span>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            {LESSON_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                  index + 1 < currentStep 
                    ? 'bg-success text-success-foreground' 
                    : index + 1 === currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {index + 1 < currentStep ? <CheckCircle className="h-5 w-5" /> : step.icon}
              </div>
            ))}
          </div>
          <Progress value={(currentStep - 1) * 20 + (lessonActive ? lessonProgress * 0.2 : 0)} className="h-2" />
        </div>

        {/* Main Lesson Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">{LESSON_STEPS[currentStep - 1].icon}</span>
              <span>Lesson: {LESSON_STEPS[currentStep - 1].title} – Step {currentStep} of {LESSON_STEPS.length}</span>
            </CardTitle>
            <CardDescription>
              {LESSON_STEPS[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!lessonActive ? (
              <div className="text-center py-8">
                <Button 
                  onClick={startLesson}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Starting Lesson...
                    </div>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-5 w-5" />
                      🔊 Start Lesson
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* AI Response Display */}
                {aiResponse && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <Volume2 className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white mb-1">AI Teacher</div>
                        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{aiResponse}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Student Response Input */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Response:
                    </label>
                    <Textarea
                      placeholder="Type your answer here..."
                      value={studentResponse}
                      onChange={(e) => setStudentResponse(e.target.value)}
                      rows={4}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={submitResponse}
                      disabled={!studentResponse.trim() || isLoading}
                      className="bg-primary hover:bg-primary/90 text-white"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Thinking...
                        </div>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Response
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={resetLesson}
                      variant="outline"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset Lesson
                    </Button>
                  </div>
                </div>

                {/* Progress in current lesson */}
                {lessonProgress > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Lesson Progress
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {lessonProgress}%
                      </span>
                    </div>
                    <Progress value={lessonProgress} className="h-2" />
                    
                    {lessonProgress >= 100 && (
                      <div className="mt-4 text-center">
                        <Badge variant="default" className="bg-success text-success-foreground">
                          Lesson Complete! 🎉
                        </Badge>
                        {currentStep < LESSON_STEPS.length && (
                          <Button 
                            onClick={nextLesson}
                            className="ml-4 bg-primary hover:bg-primary/90 text-white"
                          >
                            Next Lesson →
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Conversation History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {conversationHistory.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'student' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'student' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}>
                      <div className="text-xs opacity-70 mb-1">
                        {message.role === 'student' ? 'You' : 'AI Teacher'} • {message.timestamp.toLocaleTimeString()}
                      </div>
                      <div className="text-sm">{message.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}