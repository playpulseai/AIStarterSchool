import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PlayCircle, Trophy, Clock, CheckCircle, Lock, BookOpen, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  CURRICULUM_TOPICS, 
  CurriculumGenerator, 
  ProgressTracker, 
  TestGenerator,
  type CurriculumTopic,
  type Lesson,
  type StudentProgress,
  type TestQuestion
} from '@/lib/curriculum-engine';
import { SessionLogger, RoleValidator, getUserId } from '@/lib/safety-agents';
import { SmartMemory } from '@/lib/smart-memory';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

export default function Curriculum() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTopic, setSelectedTopic] = useState<CurriculumTopic | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progressData, setProgressData] = useState<StudentProgress[]>([]);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [currentTestQuestion, setCurrentTestQuestion] = useState(0);
  const [testAnswers, setTestAnswers] = useState<number[]>([]);
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);
  const [showTestResults, setShowTestResults] = useState(false);
  const [testScore, setTestScore] = useState(0);
  const [gradeBand, setGradeBand] = useState<'middle' | 'high'>('middle');
  const [studentMemory, setStudentMemory] = useState<any>(null);
  const [personalizedMessage, setPersonalizedMessage] = useState('');
  const [promptActivity, setPromptActivity] = useState('');
  const [showPromptComparison, setShowPromptComparison] = useState(false);
  const [summaryFeedback, setSummaryFeedback] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'ai' | 'student', content: string, timestamp: Date }>>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isLessonActive, setIsLessonActive] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProgressData();
  }, []);

  // Reload progress data when grade band changes
  useEffect(() => {
    loadProgressData();
  }, [gradeBand]);

  const loadProgressData = async () => {
    try {
      const userId = getUserId();
      const progress = await ProgressTracker.getAllTopicProgress(userId);
      setProgressData(progress);
      
      // Clear any active lesson state when grade band changes
      setIsLessonDialogOpen(false);
      setIsTestDialogOpen(false);
      setCurrentLesson(null);
      setSelectedTopic(null);
      setConversationHistory([]);
      setIsLessonActive(false);
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const getTopicProgress = (topicId: string): StudentProgress | null => {
    return progressData.find(p => p.topicId === topicId) || null;
  };

  const isTopicUnlocked = (topic: CurriculumTopic): boolean => {
    // All topics are unlocked after access code validation
    return true;
  };

  const startLesson = async (topic: CurriculumTopic, lessonNumber: number) => {
    // All topics are accessible after access code validation

    try {
      // 1. Fetch student memory from Firebase
      const userId = getUserId();
      const memory = await SmartMemory.getStudentMemory(userId, gradeBand);
      setStudentMemory(memory);
      
      // 2. Generate personalized message
      let personalizedMsg = '';
      if (memory.lastLessonTopic && memory.lastLessonTopic !== topic.id) {
        const lastTopicTitle = CURRICULUM_TOPICS.find(t => t.id === memory.lastLessonTopic)?.title || memory.lastLessonTopic;
        personalizedMsg = `Welcome back! Last time you studied ${lastTopicTitle}. Let's build on that.`;
      } else if (memory.totalLessonsCompleted > 0) {
        personalizedMsg = `Great to see you continuing your AI learning journey! You've completed ${memory.totalLessonsCompleted} lessons so far.`;
      } else {
        personalizedMsg = 'Welcome to your first AI lesson! Let\'s begin your learning journey.';
      }
      setPersonalizedMessage(personalizedMsg);
      
      const lesson = await CurriculumGenerator.generateLesson(topic.id, lessonNumber, gradeBand);
      setCurrentLesson(lesson);
      setSelectedTopic(topic);
      setIsLessonDialogOpen(true);
      setConversationHistory([]);
      setIsLessonActive(false);

      // Log lesson start
      await SessionLogger.logLessonStart(userId, gradeBand, lessonNumber);
    } catch (error) {
      console.error('Failed to start lesson:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load lesson. Please try again.",
      });
    }
  };

  const startInteractiveLesson = async () => {
    if (!currentLesson || !selectedTopic) return;

    try {
      setIsLessonActive(true);
      setIsLoadingAI(true);
      setConversationHistory([]);
      
      const userId = getUserId();
      
      // 1. Fetch student's memory from Firebase at /student_memory/{userId}
      const memory = await SmartMemory.getStudentMemory(userId, gradeBand);
      setStudentMemory(memory);
      
      // 2. Inject memory into AI system prompt with specific fields
      const memoryInjection = {
        lastLessonTopic: memory.lastLessonTopic,
        missedTestConcepts: memory.missedTestConcepts,
        preferredLearningStyle: memory.preferredLearningStyle,
        strengthAreas: memory.strengthAreas,
        weaknessAreas: memory.weaknessAreas,
        interactionPatterns: memory.interactionPatterns
      };
      
      // 6. Log lesson start to /session_logs/{userId}
      await SessionLogger.logLessonStart(userId, gradeBand, currentLesson.stepNumber);
      
      // 3. Start AI lesson using OpenAI with memory context
      const response = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Start interactive lesson: ${currentLesson.title}. Description: ${currentLesson.description}. Task: ${currentLesson.task}`,
          gradeBand,
          lessonStep: currentLesson.stepNumber,
          conversationHistory: [],
          memoryContext: SmartMemory.generateSystemPromptInjection(memory),
          studentMemory: memoryInjection
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start lesson');
      }

      const data = await response.json();
      
      // 4. Render first lesson step as voice + text with personalized AI response
      const aiResponse = data.response;
      
      setConversationHistory([{
        role: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }]);

      // Auto-scroll to bottom
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
      
      // Log AI response to session logs at /session_logs/{userId}/{timestamp}
      await SessionLogger.logAiResponse(userId, gradeBand, currentLesson.stepNumber, aiResponse);
      
    } catch (error) {
      console.error('Failed to start interactive lesson:', error);
      
      // Show error toast instead of fallback content
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to start AI lesson. Please check your connection and try again.",
      });
      
      setIsLessonActive(false);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const sendMessage = async () => {
    if (!currentPrompt.trim() || !currentLesson) return;

    const userMessage = currentPrompt.trim();
    setCurrentPrompt('');
    
    // Add user message to conversation
    const newHistory = [...conversationHistory, {
      role: 'student' as const,
      content: userMessage,
      timestamp: new Date()
    }];
    setConversationHistory(newHistory);

    try {
      setIsLoadingAI(true);
      
      const userId = getUserId();
      
      // 6. Log all interaction data to /session_logs/{userId}
      await SessionLogger.logPromptSubmit(userId, gradeBand, currentLesson.stepNumber, userMessage);
      
      // Continue AI conversation with memory context
      const memoryContext = studentMemory ? SmartMemory.generateSystemPromptInjection(studentMemory) : '';
      
      // Get AI response with full context
      const response = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          gradeBand,
          lessonStep: currentLesson.stepNumber,
          conversationHistory: newHistory.map(msg => ({
            role: msg.role === 'student' ? 'user' : 'assistant',
            content: msg.content
          })),
          memoryContext,
          studentMemory: studentMemory ? {
            lastLessonTopic: studentMemory.lastLessonTopic,
            missedTestConcepts: studentMemory.missedTestConcepts,
            preferredLearningStyle: studentMemory.preferredLearningStyle
          } : null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      // Log AI response to session logs
      await SessionLogger.logAiResponse(userId, gradeBand, currentLesson.stepNumber, data.response);
      
      // Add AI response to conversation
      setConversationHistory(prev => [...prev, {
        role: 'ai',
        content: data.response,
        timestamp: new Date()
      }]);

      // Auto-scroll to bottom
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
      
      // 7. Update memory with interaction data and inferred learning style
      const learningStyleIndicators = {
        requestedVisuals: userMessage.toLowerCase().includes('visual') || userMessage.toLowerCase().includes('image') || userMessage.toLowerCase().includes('picture'),
        usedVoice: false, // Would be true if voice input was used
        preferredText: userMessage.length > 50 // Longer responses indicate text preference
      };
      
      await SmartMemory.logInteraction({
        askedForExamples: userMessage.toLowerCase().includes('example'),
        neededEncouragement: conversationHistory.length < 3,
        usedVaguePrompts: userMessage.length < 20,
        responseTime: 5000
      });
      
      // Update learning style if indicators are strong
      if (learningStyleIndicators.requestedVisuals) {
        await SmartMemory.updateStudentMemory({
          learningStyleIndicators
        }, userId);
      }
      
    } catch (error) {
      console.error('Failed to send message:', error);
      setConversationHistory(prev => [...prev, {
        role: 'ai',
        content: 'I apologize, but I encountered an error. Please try again or rephrase your question.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const completeLesson = async () => {
    if (!currentLesson || !selectedTopic) return;

    try {
      const userId = getUserId();
      
      // Update progress tracking
      await ProgressTracker.updateProgress(userId, selectedTopic.id, currentLesson.stepNumber);
      
      // 7. Update memory with lesson completion and inferred learning style
      const interactionAnalysis = {
        askedForExamples: conversationHistory.some(msg => 
          msg.role === 'student' && msg.content.toLowerCase().includes('example')
        ),
        neededEncouragement: conversationHistory.length < 3,
        usedVaguePrompts: conversationHistory.some(msg => 
          msg.role === 'student' && msg.content.length < 20
        ),
        responseTime: 5000
      };
      
      // Infer learning style from conversation patterns
      const studentMessages = conversationHistory.filter(msg => msg.role === 'student');
      let inferredLearningStyle = studentMemory?.preferredLearningStyle || 'text';
      
      if (studentMessages.some(msg => msg.content.toLowerCase().includes('visual') || msg.content.toLowerCase().includes('image'))) {
        inferredLearningStyle = 'visual';
      } else if (studentMessages.some(msg => msg.content.toLowerCase().includes('example'))) {
        inferredLearningStyle = 'examples';
      } else if (studentMessages.reduce((total, msg) => total + msg.content.length, 0) / studentMessages.length > 50) {
        inferredLearningStyle = 'text';
      }
      
      // 4. Update memory with lesson completion data at /student_memory/{userId}
      await SmartMemory.updateStudentMemory({
        lessonTopic: selectedTopic.id,
        interactionData: interactionAnalysis,
        learningStyleIndicators: {
          requestedVisuals: studentMessages.some(msg => msg.content.toLowerCase().includes('visual')),
          usedVoice: false,
          preferredText: studentMessages.length > 0 && studentMessages.reduce((total, msg) => total + msg.content.length, 0) / studentMessages.length > 30
        }
      }, userId);
      
      // 8. Display personalized feedback line at the bottom
      let personalizedFeedback = "Great work completing this lesson!";
      
      if (studentMemory) {
        const currentVaguePrompts = conversationHistory.filter(msg => 
          msg.role === 'student' && msg.content.length < 20
        ).length;
        const previousPromptIssues = studentMemory.frequentPromptMistakes?.length || 0;
        
        if (currentVaguePrompts === 0 && previousPromptIssues > 0) {
          personalizedFeedback = "Excellent! You used detailed prompts throughout this lesson. Your prompt quality has improved significantly!";
        } else if (conversationHistory.length > 6) {
          personalizedFeedback = "Outstanding engagement! You're actively participating and asking great questions. Keep up the curiosity!";
        } else if (conversationHistory.some(msg => msg.role === 'student' && msg.content.toLowerCase().includes('example'))) {
          personalizedFeedback = "Great job asking for examples! This shows you're thinking critically about the concepts.";
        } else if (inferredLearningStyle === 'visual') {
          personalizedFeedback = "I noticed you prefer visual learning. I'll include more visual examples in future lessons!";
        } else if (studentMemory.totalLessonsCompleted > 3) {
          personalizedFeedback = `You're making consistent progress! You've completed ${studentMemory.totalLessonsCompleted + 1} lessons. Your dedication is paying off!`;
        }
      }
      
      setSummaryFeedback(personalizedFeedback);
      
      await loadProgressData();
      
      toast({
        title: "Lesson Complete!",
        description: `You've completed "${currentLesson.title}"`,
      });

      // Check if all lessons are complete to show test option
      const progress = getTopicProgress(selectedTopic.id);
      if (progress && progress.completedLessons.length === selectedTopic.totalLessons && !progress.testTaken) {
        toast({
          title: "Ready for Test!",
          description: `You can now take the ${selectedTopic.title} test to earn your badge.`,
        });
      }
      
      // Show feedback for a moment before closing
      setTimeout(() => {
        setIsLessonDialogOpen(false);
        setCurrentLesson(null);
        setSelectedTopic(null);
        setIsLessonActive(false);
        setSummaryFeedback('');
        setConversationHistory([]);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete lesson. Please try again.",
      });
    }
  };

  const startTopicTest = async (topic: CurriculumTopic) => {
    const progress = getTopicProgress(topic.id);
    if (!progress || progress.completedLessons.length < topic.totalLessons) {
      toast({
        variant: "destructive",
        title: "Complete All Lessons",
        description: "You must complete all lessons before taking the test.",
      });
      return;
    }

    try {
      const questions = await TestGenerator.generateTest(topic.id, gradeBand);
      setTestQuestions(questions);
      setSelectedTopic(topic);
      setCurrentTestQuestion(0);
      setTestAnswers([]);
      setTestStartTime(new Date());
      setShowTestResults(false);
      setIsTestDialogOpen(true);

      // Log test start
      const userId = getUserId();
      await SessionLogger.logTestStart(userId, gradeBand);
    } catch (error) {
      console.error('Failed to start test:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load test. Please try again.",
      });
    }
  };

  const answerTestQuestion = (answerIndex: number) => {
    const newAnswers = [...testAnswers];
    newAnswers[currentTestQuestion] = answerIndex;
    setTestAnswers(newAnswers);
  };

  const nextTestQuestion = () => {
    if (currentTestQuestion < testQuestions.length - 1) {
      setCurrentTestQuestion(prev => prev + 1);
    } else {
      submitTest();
    }
  };

  const submitTest = async () => {
    if (!selectedTopic || !testStartTime) return;

    try {
      const gradeResult = TestGenerator.gradeTest(testQuestions, testAnswers);
      const timeSpent = Math.floor((new Date().getTime() - testStartTime.getTime()) / 1000);
      
      setTestScore(gradeResult.score);
      setShowTestResults(true);

      // Save test result
      const userId = getUserId();
      await TestGenerator.saveTestResult({
        userId,
        topicId: selectedTopic.id,
        score: gradeResult.score,
        totalQuestions: testQuestions.length,
        answers: testAnswers,
        timeSpent,
        passed: gradeResult.passed,
        timestamp: new Date()
      });

      // Update progress
      await ProgressTracker.markTestTaken(userId, selectedTopic.id, gradeResult.score, gradeResult.passed);
      await loadProgressData();

      // Log test completion
      await SessionLogger.logTestComplete(userId, gradeBand, gradeResult.score, testAnswers);

      if (gradeResult.passed) {
        toast({
          title: "Congratulations!",
          description: `You earned the ${selectedTopic.title} badge with ${gradeResult.score}%!`,
        });
      } else {
        toast({
          title: "Keep Learning!",
          description: `You scored ${gradeResult.score}%. Review the lessons and try again.`,
        });
      }
    } catch (error) {
      console.error('Failed to submit test:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Curriculum
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Master AI skills through our structured learning path
          </p>
          
          {/* Grade Level Toggle */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="flex space-x-4">
              <Button
                variant={gradeBand === 'middle' ? 'default' : 'outline'}
                onClick={() => setGradeBand('middle')}
                className="flex-1 sm:flex-none"
              >
                Grades 6-8
              </Button>
              <Button
                variant={gradeBand === 'high' ? 'default' : 'outline'}
                onClick={() => setGradeBand('high')}
                className="flex-1 sm:flex-none"
              >
                Grades 9-12
              </Button>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <span>Currently viewing: </span>
              <Badge variant="outline" className="ml-2 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                {gradeBand === 'middle' ? 'Middle School (Ages 11-14)' : 'High School (Ages 14-18)'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Curriculum Topics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CURRICULUM_TOPICS.map((topic) => {
            const progress = getTopicProgress(topic.id);
            const isUnlocked = isTopicUnlocked(topic);
            const completedLessons = progress?.completedLessons.length || 0;
            const progressPercent = (completedLessons / topic.totalLessons) * 100;
            const canTakeTest = completedLessons === topic.totalLessons && !progress?.testTaken;
            const hasEarnedBadge = progress?.badgeUnlocked || false;

            return (
              <Card key={topic.id} className={`${!isUnlocked ? 'opacity-60' : ''} hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{topic.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{topic.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1 flex-wrap">
                          <Badge variant={topic.difficulty === 'beginner' ? 'default' : topic.difficulty === 'intermediate' ? 'secondary' : 'outline'}>
                            {topic.difficulty}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                            {gradeBand === 'middle' ? 'Grades 6-8' : 'Grades 9-12'}
                          </Badge>
                          {hasEarnedBadge && (
                            <Badge className="bg-success text-success-foreground">
                              <Trophy className="h-3 w-3 mr-1" />
                              Badge Earned
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {!isUnlocked && <Lock className="h-5 w-5 text-gray-400" />}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="mb-4">
                    {topic.description}
                  </CardDescription>
                  
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{completedLessons}/{topic.totalLessons} lessons</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>

                  {/* Prerequisites */}
                  {topic.prerequisites && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Prerequisites:</p>
                      <div className="flex flex-wrap gap-1">
                        {topic.prerequisites.map(prereqId => {
                          const prereqTopic = CURRICULUM_TOPICS.find(t => t.id === prereqId);
                          const prereqProgress = getTopicProgress(prereqId);
                          return (
                            <Badge 
                              key={prereqId} 
                              variant={prereqProgress?.badgeUnlocked ? "default" : "outline"}
                              className="text-xs"
                            >
                              {prereqTopic?.title}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {isUnlocked && (
                      <>
                        <Button
                          onClick={() => startLesson(topic, (progress?.currentLesson || 0) + 1)}
                          disabled={completedLessons >= topic.totalLessons}
                          className="w-full"
                          variant={completedLessons >= topic.totalLessons ? "outline" : "default"}
                        >
                          {completedLessons === 0 ? (
                            <>
                              <PlayCircle className="mr-2 h-4 w-4" />
                              Start Learning
                            </>
                          ) : completedLessons < topic.totalLessons ? (
                            <>
                              <BookOpen className="mr-2 h-4 w-4" />
                              Continue Lesson {completedLessons + 1}
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              All Lessons Complete
                            </>
                          )}
                        </Button>
                        
                        {canTakeTest && (
                          <Button
                            onClick={() => startTopicTest(topic)}
                            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                          >
                            <Target className="mr-2 h-4 w-4" />
                            Take Test & Earn Badge
                          </Button>
                        )}
                        
                        {progress?.testTaken && !hasEarnedBadge && (
                          <Button
                            onClick={() => startTopicTest(topic)}
                            variant="outline"
                            className="w-full"
                          >
                            Retake Test (Score: {progress.testScore}%)
                          </Button>
                        )}
                      </>
                    )}
                    
                    {!isUnlocked && (
                      <Button disabled className="w-full">
                        <Lock className="mr-2 h-4 w-4" />
                        Complete Prerequisites
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Lesson Dialog */}
        <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            {currentLesson && selectedTopic && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <span className="text-2xl">{selectedTopic.icon}</span>
                    <span>{currentLesson.title}</span>
                  </DialogTitle>
                  <DialogDescription className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span>Lesson {currentLesson.stepNumber} of {selectedTopic.totalLessons} • {currentLesson.estimatedTime} minutes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={selectedTopic.difficulty === 'beginner' ? 'default' : selectedTopic.difficulty === 'intermediate' ? 'secondary' : 'outline'} className="text-xs">
                        {selectedTopic.difficulty}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs">
                        {gradeBand === 'middle' ? 'Grades 6-8' : 'Grades 9-12'}
                      </Badge>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* 2. Display personalized message */}
                  {personalizedMessage && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                      <p className="text-green-800 dark:text-green-300 text-sm">
                        {personalizedMessage}
                      </p>
                    </div>
                  )}

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

                  {!isLessonActive ? (
                    <div className="flex space-x-2">
                      <Button onClick={startInteractiveLesson} className="flex-1">
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Start Learning
                      </Button>
                      <Button onClick={completeLesson} variant="outline">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Complete
                      </Button>
                      <Button variant="outline" onClick={() => setIsLessonDialogOpen(false)}>
                        Close
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Interactive AI Teacher Chat */}
                      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                        <h4 className="font-semibold mb-3">AI Teacher Chat</h4>
                        
                        <div className="space-y-3 max-h-80 overflow-y-auto mb-4" ref={chatContainerRef}>
                          {conversationHistory.map((message, index) => (
                            <div key={index} className={`flex ${message.role === 'student' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-sm p-3 rounded-lg text-sm ${
                                message.role === 'student' 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border'
                              }`}>
                                <p className="whitespace-pre-wrap">{message.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {message.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))}
                          {isLoadingAI && (
                            <div className="flex justify-start">
                              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                                <p className="text-gray-600 dark:text-gray-300 text-sm">AI is typing...</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 3. Prompt Activity Section */}
                        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded">
                          <h5 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2 text-sm">
                            Practice: Compare Vague vs Detailed Prompts
                          </h5>
                          <div className="space-y-2">
                            <Input
                              value={promptActivity}
                              onChange={(e) => setPromptActivity(e.target.value)}
                              placeholder="Write your prompt here..."
                              className="text-sm"
                            />
                            <div className="flex space-x-2">
                              <Button 
                                onClick={() => {
                                  if (promptActivity.trim()) {
                                    setShowPromptComparison(true);
                                    setCurrentPrompt(promptActivity);
                                  }
                                }}
                                disabled={!promptActivity.trim()}
                                size="sm"
                                variant="outline"
                              >
                                Analyze My Prompt
                              </Button>
                            </div>
                            {showPromptComparison && (
                              <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border text-xs">
                                <p className="text-gray-600 dark:text-gray-400">
                                  <strong>Your prompt:</strong> {promptActivity}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                  <strong>Analysis:</strong> {promptActivity.length < 20 ? 'Too vague - try adding more details!' : 'Good detail level!'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 5. Input field and Submit button for task completion */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Complete the lesson task:
                          </label>
                          <div className="flex gap-2">
                            <Input
                              value={currentPrompt}
                              onChange={(e) => setCurrentPrompt(e.target.value)}
                              placeholder="Share your attempt, ask questions, or provide your answer..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  sendMessage();
                                }
                              }}
                              disabled={isLoadingAI}
                              className="flex-1 text-sm"
                            />
                            <Button onClick={sendMessage} disabled={isLoadingAI || !currentPrompt.trim()} size="sm">
                              <Send className="h-3 w-3" />
                              Submit
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Press Enter to submit or use the Submit button
                          </p>
                        </div>
                      </div>

                      {/* 6. Summary Feedback */}
                      {summaryFeedback && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                          <p className="text-green-800 dark:text-green-300 font-medium text-sm">
                            {summaryFeedback}
                          </p>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button onClick={completeLesson} className="flex-1">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Complete Lesson
                        </Button>
                        <Button variant="outline" onClick={() => setIsLessonDialogOpen(false)}>
                          Close
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Test Dialog */}
        <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            {selectedTopic && !showTestResults && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-accent" />
                    <span>{selectedTopic.title} Test</span>
                  </DialogTitle>
                  <DialogDescription className="space-y-2">
                    <div>Question {currentTestQuestion + 1} of {testQuestions.length}</div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={selectedTopic.difficulty === 'beginner' ? 'default' : selectedTopic.difficulty === 'intermediate' ? 'secondary' : 'outline'} className="text-xs">
                        {selectedTopic.difficulty}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs">
                        {gradeBand === 'middle' ? 'Grades 6-8' : 'Grades 9-12'}
                      </Badge>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                
                {testQuestions[currentTestQuestion] && (
                  <div className="space-y-6">
                    <div className="mb-4">
                      <Progress value={((currentTestQuestion + 1) / testQuestions.length) * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        {testQuestions[currentTestQuestion].question}
                      </h3>
                      
                      <RadioGroup
                        value={testAnswers[currentTestQuestion]?.toString()}
                        onValueChange={(value) => answerTestQuestion(parseInt(value))}
                      >
                        <div className="space-y-3">
                          {testQuestions[currentTestQuestion].options?.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                                {option}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentTestQuestion(prev => Math.max(0, prev - 1))}
                        disabled={currentTestQuestion === 0}
                      >
                        Previous
                      </Button>
                      
                      <Button
                        onClick={nextTestQuestion}
                        disabled={testAnswers[currentTestQuestion] === undefined}
                      >
                        {currentTestQuestion === testQuestions.length - 1 ? 'Submit Test' : 'Next Question'}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {showTestResults && selectedTopic && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-center">Test Results</DialogTitle>
                </DialogHeader>
                
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold text-primary">{testScore}%</div>
                  
                  {testScore >= 70 ? (
                    <>
                      <div className="text-2xl font-semibold text-success">Congratulations!</div>
                      <p className="text-gray-600 dark:text-gray-400">
                        You've earned the {selectedTopic.title} badge!
                      </p>
                      <div className="text-4xl">{selectedTopic.icon}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-semibold text-orange-500">Keep Learning!</div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Review the lessons and try again. You need 70% to pass.
                      </p>
                    </>
                  )}
                  
                  <Button onClick={() => setIsTestDialogOpen(false)} className="w-full">
                    Continue Learning
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}