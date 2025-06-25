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
    
    console.log('URL params:', { topicId, lesson, grade });
    
    if (topicId && lesson && grade) {
      // Map legacy topic IDs to current ones
      const topicIdMap: Record<string, string> = {
        'ai-prompting': 'prompting-basics',
        'ai-automation': 'automation',
        'ai-ethics': 'ethics'
      };
      
      const actualTopicId = topicIdMap[topicId] || topicId;
      const topic = CURRICULUM_TOPICS.find(t => t.id === actualTopicId);
      console.log('Found topic:', topic, 'for ID:', actualTopicId);
      
      if (topic) {
        setCurrentTopic(topic);
        setLessonNumber(parseInt(lesson));
        setGradeLevel(grade);
        loadLessonContent(topic, parseInt(lesson), grade);
      } else {
        console.error('Topic not found:', topicId, 'mapped to:', actualTopicId);
        setIsLoading(false);
      }
    } else {
      console.log('Missing URL parameters, setting loading to false');
      setIsLoading(false);
    }
  }, []);

  const loadLessonContent = async (topic: CurriculumTopic, lessonNum: number, grade: 'middle' | 'high') => {
    console.log('loadLessonContent called', { topic: topic.id, lessonNum, grade });
    
    try {
      setIsLoading(true);
      
      console.log('Generating lesson content...');
      // Generate lesson content
      const lesson = await CurriculumGenerator.generateLesson(topic.id, lessonNum, grade);
      console.log('Lesson generated:', lesson);
      setCurrentLesson(lesson);
      
      console.log('Fetching student memory...');
      // Fetch student memory from Firebase
      const userId = getUserId();
      const memory = await SmartMemory.getStudentMemory(userId, grade);
      console.log('Memory fetched:', memory);
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
      console.log('Lesson content loaded successfully');
      
    } catch (error) {
      console.error('Failed to load lesson content:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load lesson content. Please try again.",
      });
    } finally {
      console.log('Setting isLoading to false in loadLessonContent');
      setIsLoading(false);
    }
  };

  const startLesson = async () => {
    console.log('startLesson called', { currentTopic, currentLesson });
    
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
    
    console.log('Starting lesson', { userId, currentGradeBand, lessonNumber });
    
    setLessonActive(true);
    setConversationHistory([]);
    setLessonProgress(20);
    setIsLoading(true);

    try {
      // Log lesson start
      await SessionLogger.logLessonStart(userId, currentGradeBand, lessonNumber);

      // Create personalized AI teacher greeting
      const memoryContext = studentMemory ? SmartMemory.generateSystemPromptInjection(studentMemory) : '';
      
      const greeting = `Hi! I'm your AI teacher for today!

${personalizedMessage}

Today we're diving into "${currentLesson.title}" - ${currentLesson.description}

**What you'll learn:**
${currentLesson.description}

**Your task:**
${currentLesson.task}

**Suggested approach:**
Try this: "${currentLesson.promptSuggestion}"

Let's start with a quick question: What do you already know about ${currentTopic.title.toLowerCase()}? Have you tried anything like this before?

Type your answer below and let's begin this exciting lesson!`;

      console.log('Generated greeting, filtering through Guardian Agent');

      // Filter AI output through Guardian Agent
      const filterResult = await GuardianAgent.filterOutput(greeting, userId, currentGradeBand);
      const finalGreeting = filterResult.isAllowed ? greeting : filterResult.filteredContent!;

      console.log('Setting AI response and conversation history');

      setAiResponse(finalGreeting);
      setConversationHistory([{ 
        role: 'ai', 
        content: finalGreeting, 
        timestamp: new Date() 
      }]);

      // Log AI response
      await SessionLogger.logAiResponse(userId, currentGradeBand, lessonNumber, finalGreeting);
      
      console.log('Lesson started successfully');
      
    } catch (error) {
      console.error('Failed to start lesson:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start lesson. Please try again.",
      });
    } finally {
      console.log('Setting isLoading to false');
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

  // Show loading state if lesson content is not yet loaded
  if (isLoading && !currentTopic) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-4"></div>
              <span className="text-lg">Loading lesson content...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no topic is loaded
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Loading Lesson Content...
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Preparing your personalized AI lesson experience
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentTopic || !currentLesson) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Lesson Content Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please select a lesson from the curriculum page.
            </p>
            <Button onClick={goBackToCurriculum}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Curriculum
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="outline" 
              onClick={goBackToCurriculum}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Curriculum
            </Button>
            <Badge variant="outline" className="text-sm">
              {gradeLevel === 'middle' ? 'Grades 6-8' : 'Grades 9-12'}
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {currentTopic.icon} {currentTopic.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Lesson {lessonNumber} of {currentTopic.totalLessons}: {currentLesson.title}
          </p>
          
          {personalizedMessage && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-blue-800 dark:text-blue-200">{personalizedMessage}</p>
            </div>
          )}
        </div>

        {/* Lesson Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Lesson Progress
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {lessonProgress}%
            </span>
          </div>
          <Progress value={lessonProgress} className="h-2" />
        </div>

        {/* Main Lesson Card */}
        <Card className="mb-8" ref={chatContainerRef}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">{currentTopic.icon}</span>
              <span>{currentLesson.title}</span>
            </CardTitle>
            <CardDescription>
              {currentLesson.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!lessonActive ? (
              <div className="space-y-6">
                {/* Lesson Content Overview */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">What you'll learn:</h4>
                    <p className="text-gray-600 dark:text-gray-400">{currentLesson.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Your task:</h4>
                    <p className="text-gray-600 dark:text-gray-400">{currentLesson.task}</p>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Try this prompt:</h4>
                    <p className="text-blue-800 dark:text-blue-200 font-mono text-sm bg-white dark:bg-blue-900/50 p-2 rounded">
                      {currentLesson.promptSuggestion}
                    </p>
                  </div>
                  
                  <div className="text-center py-4">
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
                          Start Learning
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Chat History */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {conversationHistory.map((msg, index) => (
                    <div key={index} className={`${
                      msg.role === 'ai' 
                        ? 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800' 
                        : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    } rounded-lg p-4`}>
                      <div className="flex items-start space-x-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.role === 'ai' ? 'bg-primary text-white' : 'bg-gray-500 text-white'
                        }`}>
                          {msg.role === 'ai' ? <Volume2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white mb-1">
                            {msg.role === 'ai' ? 'AI Teacher' : 'You'}
                          </div>
                          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{msg.content}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Current AI Response */}
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
                </div>

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
                      onKeyDown={handleKeyDown}
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
                          AI is thinking...
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

                {/* Quiz Section */}
                {showQuiz && (
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h4 className="font-semibold mb-4 text-yellow-900 dark:text-yellow-100">
                      Quick Check: Test Your Understanding
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-yellow-800 dark:text-yellow-200 mb-2">
                          What's the most important thing you learned in this lesson?
                        </p>
                        <Textarea
                          placeholder="Share what you learned..."
                          rows={3}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <p className="text-yellow-800 dark:text-yellow-200 mb-2">
                          How would you use this knowledge in a real situation?
                        </p>
                        <Textarea
                          placeholder="Describe a practical application..."
                          rows={3}
                          className="w-full"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm">Submit Quiz</Button>
                        <Button variant="outline" size="sm" onClick={() => setShowQuiz(false)}>
                          Skip Quiz
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

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
                        <Badge variant="default" className="bg-green-500 text-white">
                          Lesson Complete!
                        </Badge>
                        {lessonNumber < currentTopic.totalLessons ? (
                          <Button 
                            onClick={nextLesson}
                            className="ml-4 bg-primary hover:bg-primary/90 text-white"
                          >
                            Next Lesson →
                          </Button>
                        ) : (
                          <Button 
                            onClick={goBackToCurriculum}
                            className="ml-4 bg-primary hover:bg-primary/90 text-white"
                          >
                            Back to Curriculum
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