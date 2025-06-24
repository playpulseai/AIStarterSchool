import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Trophy, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SessionLogger, RoleValidator, getUserId } from '@/lib/safety-agents';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  level: 'middle' | 'high' | 'both';
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is the most important part of writing a good AI prompt?",
    options: [
      "Making it as short as possible",
      "Being clear and specific about what you want",
      "Using complicated technical terms",
      "Writing it in ALL CAPS"
    ],
    correct: 1,
    explanation: "Clear and specific prompts help AI understand exactly what you want, leading to better results.",
    level: 'both'
  },
  {
    id: 2,
    question: "Which of these is an example of responsible AI use?",
    options: [
      "Using AI to cheat on homework",
      "Sharing AI-generated content without mentioning it's AI-made",
      "Using AI as a learning tool to understand concepts better",
      "Believing everything AI tells you without checking"
    ],
    correct: 2,
    explanation: "AI should be used as a learning tool to enhance understanding, not replace critical thinking.",
    level: 'both'
  },
  {
    id: 3,
    question: "When using AI for creative writing, what's the best approach?",
    options: [
      "Let AI write everything for you",
      "Use AI for ideas and inspiration, then add your own creativity",
      "Copy AI text exactly without any changes",
      "Never use AI for creative projects"
    ],
    correct: 1,
    explanation: "AI works best as a creative partner - use it for inspiration while adding your unique voice and ideas.",
    level: 'both'
  },
  {
    id: 4,
    question: "What should you do if an AI gives you information you're not sure about?",
    options: [
      "Always trust the AI completely",
      "Ignore the information entirely",
      "Verify the information using reliable sources",
      "Share it immediately with others"
    ],
    correct: 2,
    explanation: "Always verify AI-generated information with reliable sources. AI can make mistakes or have outdated information.",
    level: 'both'
  },
  {
    id: 5,
    question: "In AI image generation, what makes a prompt effective?",
    options: [
      "Using only one word",
      "Including specific details about style, colors, and composition",
      "Writing a long paragraph about your feelings",
      "Using random words"
    ],
    correct: 1,
    explanation: "Effective image prompts include specific details about what you want to see, helping the AI create better results.",
    level: 'high'
  }
];

export default function Test() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [testStarted, setTestStarted] = useState(false);

  const filteredQuestions = QUESTIONS.filter(q => q.level === 'both' || q.level === 'middle');
  const totalQuestions = filteredQuestions.length;

  const startTest = async () => {
    const userId = getUserId();
    const currentGradeBand = RoleValidator.getGradeBandFromGrade('8'); // Default to middle school
    
    // Log test start
    await SessionLogger.logTestStart(userId, currentGradeBand);
    
    setTestStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setTestCompleted(false);
    setShowResults(false);
    setTimeLeft(300);

    // Start timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      submitTest();
    }
  };

  const submitTest = async () => {
    const userId = getUserId();
    const currentGradeBand = RoleValidator.getGradeBandFromGrade('8');
    
    const correctAnswers = selectedAnswers.filter((answer, index) => 
      answer === filteredQuestions[index].correct
    ).length;
    
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Log test completion
    await SessionLogger.logTestComplete(userId, currentGradeBand, score, selectedAnswers);
    
    setTestCompleted(true);
    setShowResults(true);
    
    toast({
      title: "Test Completed!",
      description: `You scored ${score}% (${correctAnswers}/${totalQuestions} correct)`,
    });
  };

  const resetTest = () => {
    setTestStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setTestCompleted(false);
    setShowResults(false);
    setTimeLeft(300);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    const correctAnswers = selectedAnswers.filter((answer, index) => 
      answer === filteredQuestions[index].correct
    ).length;
    return {
      correct: correctAnswers,
      total: totalQuestions,
      percentage: Math.round((correctAnswers / totalQuestions) * 100)
    };
  };

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              AI Knowledge Test
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Test your understanding of AI concepts and responsible usage
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-primary" />
                <span>Ready to Test Your Knowledge?</span>
              </CardTitle>
              <CardDescription>
                This test will evaluate your understanding of AI fundamentals, prompting techniques, and ethical considerations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {totalQuestions} multiple choice questions
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    5 minutes to complete
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-accent" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Earn AI badges based on your score
                  </span>
                </div>
              </div>

              <div className="text-center">
                <Button 
                  onClick={startTest}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Start Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Test Results
            </h1>
            <div className="text-6xl font-bold text-primary mb-4">
              {score.percentage}%
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              You got {score.correct} out of {score.total} questions correct
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Overall Score</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{score.percentage}%</span>
                  </div>
                  <Progress value={score.percentage} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-success">{score.correct}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-destructive">{score.total - score.correct}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Incorrect</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{score.total}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                  </div>
                </div>

                {score.percentage >= 80 && (
                  <div className="text-center">
                    <Badge variant="default" className="bg-success text-success-foreground">
                      Excellent Work! Badge Earned: AI Fundamentals Master
                    </Badge>
                  </div>
                )}
                {score.percentage >= 60 && score.percentage < 80 && (
                  <div className="text-center">
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      Good Job! Badge Earned: AI Knowledge Explorer
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Question Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredQuestions.map((question, index) => {
                  const userAnswer = selectedAnswers[index];
                  const isCorrect = userAnswer === question.correct;
                  
                  return (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start space-x-2 mb-2">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-destructive mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white mb-2">
                            {index + 1}. {question.question}
                          </p>
                          <div className="text-sm space-y-1">
                            <p className="text-gray-600 dark:text-gray-400">
                              Your answer: {question.options[userAnswer] || 'Not answered'}
                            </p>
                            {!isCorrect && (
                              <p className="text-success">
                                Correct answer: {question.options[question.correct]}
                              </p>
                            )}
                            <p className="text-gray-500 dark:text-gray-500 italic">
                              {question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button onClick={resetTest} variant="outline" className="mr-4">
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake Test
            </Button>
            <Button onClick={() => window.location.href = '/lessons'} className="bg-primary hover:bg-primary/90 text-white">
              Continue Learning
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = filteredQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with timer and progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Knowledge Test
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className={`font-mono text-sm ${timeLeft < 60 ? 'text-destructive' : 'text-gray-600 dark:text-gray-400'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Question {currentQuestion + 1} of {totalQuestions}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {currentQ.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedAnswers[currentQuestion]?.toString()}
              onValueChange={(value) => selectAnswer(parseInt(value))}
            >
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <div className="flex justify-between items-center mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              
              <Button
                onClick={nextQuestion}
                disabled={selectedAnswers[currentQuestion] === undefined}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {currentQuestion === totalQuestions - 1 ? 'Submit Test' : 'Next Question'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}