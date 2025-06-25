import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, Send, Volume2, RotateCcw, CheckCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GuardianAgent, SessionLogger, RoleValidator, getUserId, saveUserProgress } from '@/lib/safety-agents';
import { SmartMemory } from '@/lib/smart-memory';
import { apiRequest } from '@/lib/queryClient';
import { CurriculumGenerator, CURRICULUM_TOPICS, type CurriculumTopic, type Lesson } from '@/lib/curriculum-engine';
import { useLocation } from 'wouter';

export default function Lessons() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [gradeLevel, setGradeLevel] = useState<'middle' | 'high'>('middle');
  const [currentTopic, setCurrentTopic] = useState<CurriculumTopic | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [lessonNumber, setLessonNumber] = useState(1);
  const [lessonActive, setLessonActive] = useState(false);
  const [studentResponse, setStudentResponse] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'ai' | 'student', content: string, timestamp: Date }>>([]);
  const [studentMemory, setStudentMemory] = useState<any>(null);
  const [personalizedMessage, setPersonalizedMessage] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<Array<{ question: string; answer: string }>>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Parse URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const topicId = urlParams.get('topic');
    const lesson = urlParams.get('lesson');
    const grade = urlParams.get('grade') as 'middle' | 'high';
    
    if (topicId && lesson && grade) {
      const topic = CURRICULUM_TOPICS.find(t => t.id === topicId);
      if (topic) {
        setCurrentTopic(topic);
        setLessonNumber(parseInt(lesson));
        setGradeLevel(grade);
        loadLessonContent(topic, parseInt(lesson), grade);
      }
    }
  }, []);

  const loadLessonContent = async (topic: CurriculumTopic, lessonNum: number, grade: 'middle' | 'high') => {
    try {
      setIsLoading(true);
      
      // Generate lesson content
      const lesson = await CurriculumGenerator.generateLesson(topic.id, lessonNum, grade);
      setCurrentLesson(lesson);
      
      // Fetch student memory from Firebase
      const userId = getUserId();
      const memory = await SmartMemory.getStudentMemory(userId, grade);
      setStudentMemory(memory);
      
      // Generate personalized message
      let personalizedMsg = '';
      if (memory.lastLessonTopic && memory.lastLessonTopic !== topic.id) {
        const lastTopicTitle = CURRICULUM_TOPICS.find(t => t.id === memory.lastLessonTopic)?.title || memory.lastLessonTopic;
        personalizedMsg = `Welcome back! Last time you studied ${lastTopicTitle}. Let's build on that knowledge.`;
      } else if (memory.totalLessonsCompleted > 0) {
        personalizedMsg = `Great to see you continuing your AI learning journey! You've completed ${memory.totalLessonsCompleted} lessons so far.`;
      } else {
        personalizedMsg = 'Welcome to your first AI lesson! Let\'s begin your learning journey.';
      }
      setPersonalizedMessage(personalizedMsg);
      
    } catch (error) {
      console.error('Failed to load lesson content:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load lesson content. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startLesson = async () => {
    if (!currentTopic || !currentLesson) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No lesson content loaded. Please return to curriculum.",
      });
      return;
    }

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
    await SessionLogger.logLessonStart(userId, currentGradeBand, lessonNumber);

    try {
      // Create personalized AI teacher greeting
      const memoryContext = studentMemory ? SmartMemory.generateSystemPromptInjection(studentMemory) : '';
      
      const greeting = `Hi! I'm your AI teacher for today! 👋 

${personalizedMessage}

Today we're diving into "${currentLesson.title}" - ${currentLesson.description}

**What you'll learn:**
${currentLesson.description}

**Your task:**
${currentLesson.task}

**Suggested approach:**
Try this: "${currentLesson.promptSuggestion}"

Let's start with a quick question: What do you already know about ${currentTopic.title.toLowerCase()}? Have you tried anything like this before?

Type your answer below and let's begin this exciting lesson! 🚀`;

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
      await SessionLogger.logAiResponse(userId, currentGradeBand, lessonNumber, finalGreeting);
      
      // Auto-scroll to chat
      setTimeout(() => {
        chatContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
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
    if (!studentResponse.trim() || !currentTopic || !currentLesson) return;

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
    await SessionLogger.logPromptSubmit(userId, currentGradeBand, lessonNumber, userMessage);

    // Add student response to history
    const updatedHistory = [...conversationHistory, { 
      role: 'student' as const, 
      content: userMessage, 
      timestamp: new Date() 
    }];
    setConversationHistory(updatedHistory);

    try {
      // Call OpenAI AI Teacher service with memory context
      const memoryContext = studentMemory ? SmartMemory.generateSystemPromptInjection(studentMemory) : '';
      
      const aiRequest = {
        message: userMessage,
        gradeBand: currentGradeBand,
        lessonStep: lessonNumber,
        conversationHistory: updatedHistory.map(msg => ({
          role: msg.role === 'student' ? 'user' as const : 'assistant' as const,
          content: msg.content
        })),
        memoryContext,
        studentMemory
      };

      const response = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(aiRequest)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const aiResult = await response.json();

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
      await SessionLogger.logAiResponse(userId, currentGradeBand, lessonNumber, finalResponse);
      
      // Update progress
      const newProgress = Math.min(lessonProgress + 15, 100);
      setLessonProgress(newProgress);

      // Save progress to Firebase and update memory
      if (aiResult.lessonComplete || newProgress >= 100) {
        setLessonProgress(100);
        await saveUserProgress(userId, currentGradeBand, lessonNumber, true);
        
        // Update student memory
        await SmartMemory.updateStudentMemory({
          lessonTopic: currentTopic.id,
          interactionData: {
            askedForExamples: userMessage.toLowerCase().includes('example'),
            neededEncouragement: false,
            usedVaguePrompts: userMessage.length < 20,
            responseTime: 0
          }
        }, userId);
        
        setShowQuiz(true);
      }

      // Auto-scroll to latest message
      setTimeout(() => {
        chatContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
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
    if (currentTopic && lessonNumber < currentTopic.totalLessons) {
      const nextLessonNum = lessonNumber + 1;
      setLocation(`/lessons?topic=${currentTopic.id}&lesson=${nextLessonNum}&grade=${gradeLevel}`);
      window.location.reload();
    }
  };

  const resetLesson = () => {
    setLessonActive(false);
    setLessonProgress(0);
    setConversationHistory([]);
    setAiResponse('');
    setStudentResponse('');
    setShowQuiz(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitResponse();
    }
  };

  const goBackToCurriculum = () => {
    setLocation('/curriculum');
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