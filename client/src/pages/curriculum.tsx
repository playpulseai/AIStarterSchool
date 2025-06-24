import { useState, useEffect } from 'react';
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

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const userId = getUserId();
      const progress = await ProgressTracker.getAllTopicProgress(userId);
      setProgressData(progress);
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const getTopicProgress = (topicId: string): StudentProgress | null => {
    return progressData.find(p => p.topicId === topicId) || null;
  };

  const isTopicUnlocked = (topic: CurriculumTopic): boolean => {
    if (!topic.prerequisites) return true;
    
    return topic.prerequisites.every(prereqId => {
      const prereqProgress = getTopicProgress(prereqId);
      return prereqProgress?.badgeUnlocked || false;
    });
  };

  const startLesson = async (topic: CurriculumTopic, lessonNumber: number) => {
    if (!isTopicUnlocked(topic)) {
      toast({
        variant: "destructive",
        title: "Topic Locked",
        description: "Complete prerequisite topics first.",
      });
      return;
    }

    try {
      const lesson = await CurriculumGenerator.generateLesson(topic.id, lessonNumber, gradeBand);
      setCurrentLesson(lesson);
      setSelectedTopic(topic);
      setIsLessonDialogOpen(true);

      // Log lesson start
      const userId = getUserId();
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

  const completeLesson = async () => {
    if (!currentLesson || !selectedTopic) return;

    try {
      const userId = getUserId();
      await ProgressTracker.updateProgress(userId, selectedTopic.id, currentLesson.stepNumber);
      await loadProgressData();
      setIsLessonDialogOpen(false);
      
      toast({
        title: "Lesson Complete!",
        description: `You've completed ${currentLesson.title}`,
      });

      // Check if all lessons are complete to show test option
      const progress = getTopicProgress(selectedTopic.id);
      if (progress && progress.completedLessons.length === selectedTopic.totalLessons && !progress.testTaken) {
        toast({
          title: "Ready for Test!",
          description: `You can now take the ${selectedTopic.title} test to earn your badge.`,
        });
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error);
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
          <div className="flex space-x-4 mb-6">
            <Button
              variant={gradeBand === 'middle' ? 'default' : 'outline'}
              onClick={() => setGradeBand('middle')}
            >
              Grades 6-8
            </Button>
            <Button
              variant={gradeBand === 'high' ? 'default' : 'outline'}
              onClick={() => setGradeBand('high')}
            >
              Grades 9-12
            </Button>
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
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={topic.difficulty === 'beginner' ? 'default' : topic.difficulty === 'intermediate' ? 'secondary' : 'outline'}>
                            {topic.difficulty}
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
          <DialogContent className="sm:max-w-2xl">
            {currentLesson && selectedTopic && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <span className="text-2xl">{selectedTopic.icon}</span>
                    <span>{currentLesson.title}</span>
                  </DialogTitle>
                  <DialogDescription>
                    Lesson {currentLesson.stepNumber} of {selectedTopic.totalLessons} • {currentLesson.estimatedTime} minutes
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
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
                  
                  <div className="flex space-x-2">
                    <Button onClick={completeLesson} className="flex-1">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark Complete
                    </Button>
                    <Button variant="outline" onClick={() => setIsLessonDialogOpen(false)}>
                      Close
                    </Button>
                  </div>
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
                  <DialogDescription>
                    Question {currentTestQuestion + 1} of {testQuestions.length}
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