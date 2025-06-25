import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Download, 
  Eye, 
  Trash2, 
  Trophy, 
  Users, 
  Activity, 
  Search,
  Calendar,
  Filter,
  CheckCircle,
  XCircle,
  FileX
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RoleValidator } from '@/lib/safety-agents';

interface SessionLog {
  id: string;
  userId: string;
  userName?: string;
  gradeBand: string;
  lessonStep: number;
  action: string;
  content: string;
  timestamp: Date;
  metadata?: any;
}

interface FlaggedContent {
  id: string;
  userId: string;
  userName?: string;
  gradeBand: string;
  content: string;
  reason: string;
  timestamp: Date;
  status: 'pending' | 'reviewed' | 'cleared';
  reviewedBy?: string;
  reviewedAt?: Date;
}

interface TestResult {
  id: string;
  userId: string;
  userName?: string;
  topicId: string;
  topicTitle: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  timestamp: Date;
  timeSpent: number;
}

interface BadgeHistory {
  id: string;
  userId: string;
  userName?: string;
  topicId: string;
  topicTitle: string;
  earnedDate: Date;
  testScore: number;
  manualOverride?: boolean;
  overrideBy?: string;
}

interface PublicationRequest {
  id: string;
  projectId: string;
  projectTitle: string;
  studentAlias: string;
  userId: string;
  content: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
}

interface StudentMemoryInsight {
  id: string;
  userId: string;
  userName?: string;
  email?: string;
  lastLessonTopic?: string;
  missedTestConcepts: string[];
  promptMistakePatterns: string[];
  preferredLearningStyle: string;
  identifiedStrengths: string[];
  weaknessAreas: string[];
  totalLessonsCompleted: number;
  averageTestScore: number;
  lastActivity: Date;
  interactionPatterns: {
    asksForExamples: boolean;
    needsEncouragement: boolean;
    prefersStepByStep: boolean;
  };
}

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sessions');

  // Data states
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [badgeHistory, setBadgeHistory] = useState<BadgeHistory[]>([]);
  const [publicationRequests, setPublicationRequests] = useState<PublicationRequest[]>([]);
  const [studentMemoryInsights, setStudentMemoryInsights] = useState<StudentMemoryInsight[]>([]);

  // Filter states
  const [sessionFilter, setSessionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [flagFilter, setFlagFilter] = useState('all');

  useEffect(() => {
    checkAdminAccess();
    if (isAuthorized) {
      loadAdminData();
    }
  }, [user, isAuthorized]);

  const checkAdminAccess = async () => {
    // In demo mode, allow access with your admin email
    const userEmail = user?.email || 'demo@user.com';
    const hasAccess = RoleValidator.validateAdminAccess(userEmail);
    
    setIsAuthorized(hasAccess);
    setLoading(false);

    if (!hasAccess) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
      });
    }
  };

  const loadAdminData = async () => {
    try {
      // Load mock data for demonstration
      // In a real app, this would fetch from Firebase
      setSessionLogs([
        {
          id: 'session-1',
          userId: 'user-123',
          userName: 'alex.student@school.edu',
          gradeBand: 'middle',
          lessonStep: 1,
          action: 'lesson_start',
          content: 'Started lesson: Prompting Basics - Lesson 1',
          timestamp: new Date('2024-01-16T14:30:00'),
          metadata: { topicId: 'prompting-basics' }
        },
        {
          id: 'session-2',
          userId: 'user-123',
          userName: 'alex.student@school.edu',
          gradeBand: 'middle',
          lessonStep: 1,
          action: 'prompt_submit',
          content: 'Help me write a story about a robot chef',
          timestamp: new Date('2024-01-16T14:32:00'),
        },
        {
          id: 'session-3',
          userId: 'user-456',
          userName: 'sarah.learner@school.edu',
          gradeBand: 'high',
          lessonStep: 2,
          action: 'ai_response',
          content: 'Generated lesson content for AI Art Creation',
          timestamp: new Date('2024-01-16T15:15:00'),
        }
      ]);

      setFlaggedContent([
        {
          id: 'flag-1',
          userId: 'user-789',
          userName: 'student.test@school.edu',
          gradeBand: 'middle',
          content: 'Can you help me hack into my school system?',
          reason: 'Blocked word: hack',
          timestamp: new Date('2024-01-15T16:45:00'),
          status: 'pending'
        },
        {
          id: 'flag-2',
          userId: 'user-456',
          userName: 'sarah.learner@school.edu',
          gradeBand: 'high',
          content: 'This is completely off-topic about gaming and movies',
          reason: 'Off-topic content',
          timestamp: new Date('2024-01-14T13:22:00'),
          status: 'reviewed',
          reviewedBy: 'admin@aistarter.school',
          reviewedAt: new Date('2024-01-14T14:00:00')
        }
      ]);

      setTestResults([
        {
          id: 'test-1',
          userId: 'user-123',
          userName: 'alex.student@school.edu',
          topicId: 'prompting-basics',
          topicTitle: 'Prompting Basics',
          score: 85,
          totalQuestions: 4,
          passed: true,
          timestamp: new Date('2024-01-16T15:00:00'),
          timeSpent: 180
        },
        {
          id: 'test-2',
          userId: 'user-456',
          userName: 'sarah.learner@school.edu',
          topicId: 'ai-art',
          topicTitle: 'AI Art Creation',
          score: 92,
          totalQuestions: 5,
          passed: true,
          timestamp: new Date('2024-01-15T11:30:00'),
          timeSpent: 240
        }
      ]);

      setBadgeHistory([
        {
          id: 'badge-1',
          userId: 'user-123',
          userName: 'alex.student@school.edu',
          topicId: 'prompting-basics',
          topicTitle: 'Prompting Basics',
          earnedDate: new Date('2024-01-16T15:00:00'),
          testScore: 85
        },
        {
          id: 'badge-2',
          userId: 'user-456',
          userName: 'sarah.learner@school.edu',
          topicId: 'ai-art',
          topicTitle: 'AI Art Creation',
          earnedDate: new Date('2024-01-15T11:30:00'),
          testScore: 92
        }
      ]);

      setPublicationRequests([
        {
          id: 'pub-req-1',
          projectId: 'proj-1',
          projectTitle: 'Smart Study Assistant',
          studentAlias: 'StudyBuddy',
          userId: 'user-123',
          content: 'An AI chatbot that helps students with homework by providing step-by-step explanations...',
          submittedAt: new Date('2024-01-20T10:30:00'),
          status: 'pending'
        },
        {
          id: 'pub-req-2',
          projectId: 'proj-2',
          projectTitle: 'Creative Writing Generator',
          studentAlias: 'WordWizard',
          userId: 'user-456',
          content: 'AI-powered tool for generating creative story prompts and character development...',
          submittedAt: new Date('2024-01-19T14:15:00'),
          status: 'approved',
          reviewedBy: 'admin@aistarter.school',
          reviewedAt: new Date('2024-01-19T16:30:00')
        }
      ]);

      setStudentMemoryInsights([
        {
          id: 'mem-1',
          userId: 'user-123',
          userName: 'alex.student',
          email: 'alex.student@school.edu',
          lastLessonTopic: 'Prompting Basics',
          missedTestConcepts: ['Complex prompting', 'Context management'],
          promptMistakePatterns: ['Uses vague prompts', 'Forgets examples'],
          preferredLearningStyle: 'visual',
          identifiedStrengths: ['Creative writing', 'AI art prompts'],
          weaknessAreas: ['Technical concepts'],
          totalLessonsCompleted: 8,
          averageTestScore: 78,
          lastActivity: new Date('2024-01-20T14:30:00'),
          interactionPatterns: {
            asksForExamples: true,
            needsEncouragement: false,
            prefersStepByStep: true
          }
        },
        {
          id: 'mem-2',
          userId: 'user-456',
          userName: 'sarah.learner',
          email: 'sarah.learner@school.edu',
          lastLessonTopic: 'AI Ethics',
          missedTestConcepts: ['Bias detection'],
          promptMistakePatterns: [],
          preferredLearningStyle: 'text',
          identifiedStrengths: ['Ethical reasoning', 'Critical thinking'],
          weaknessAreas: ['Image generation'],
          totalLessonsCompleted: 15,
          averageTestScore: 92,
          lastActivity: new Date('2024-01-21T10:15:00'),
          interactionPatterns: {
            asksForExamples: false,
            needsEncouragement: false,
            prefersStepByStep: false
          }
        },
        {
          id: 'mem-3',
          userId: 'user-789',
          userName: 'mike.coder',
          email: 'mike.coder@school.edu',
          lastLessonTopic: 'AI for Productivity',
          missedTestConcepts: ['Workflow automation', 'Task prioritization'],
          promptMistakePatterns: ['Technical jargon overuse'],
          preferredLearningStyle: 'examples',
          identifiedStrengths: ['Logical thinking', 'Problem solving'],
          weaknessAreas: ['Creative applications'],
          totalLessonsCompleted: 12,
          averageTestScore: 85,
          lastActivity: new Date('2024-01-19T16:45:00'),
          interactionPatterns: {
            asksForExamples: true,
            needsEncouragement: true,
            prefersStepByStep: true
          }
        }
      ]);

    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load admin data.",
      });
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(value => 
        typeof value === 'object' && value instanceof Date 
          ? value.toISOString()
          : `"${String(value).replace(/"/g, '""')}"`
      ).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: `${filename} data exported successfully.`,
    });
  };

  const clearFlag = async (flagId: string) => {
    setFlaggedContent(prev => prev.map(flag => 
      flag.id === flagId 
        ? { 
            ...flag, 
            status: 'cleared', 
            reviewedBy: user?.email || 'admin',
            reviewedAt: new Date()
          }
        : flag
    ));

    toast({
      title: "Flag Cleared",
      description: "Flagged content has been marked as reviewed.",
    });
  };

  const overrideBadge = async (userId: string, topicId: string) => {
    // In a real app, this would call an API to grant the badge
    setBadgeHistory(prev => [...prev, {
      id: `override-${Date.now()}`,
      userId,
      userName: 'manual.override@admin',
      topicId,
      topicTitle: topicId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      earnedDate: new Date(),
      testScore: 0,
      manualOverride: true,
      overrideBy: user?.email || 'admin'
    }]);

    toast({
      title: "Badge Granted",
      description: "Badge has been manually granted to the student.",
    });
  };

  const approvePublication = async (requestId: string) => {
    setPublicationRequests(prev => prev.map(req =>
      req.id === requestId
        ? {
            ...req,
            status: 'approved' as const,
            reviewedBy: user?.email || 'admin',
            reviewedAt: new Date()
          }
        : req
    ));

    toast({
      title: "Publication Approved",
      description: "Project has been approved and will appear in the public gallery.",
    });
  };

  const rejectPublication = async (requestId: string, reason: string) => {
    setPublicationRequests(prev => prev.map(req =>
      req.id === requestId
        ? {
            ...req,
            status: 'rejected' as const,
            reviewedBy: user?.email || 'admin',
            reviewedAt: new Date(),
            rejectionReason: reason
          }
        : req
    ));

    toast({
      title: "Publication Rejected",
      description: "Project has been rejected and will not appear in the gallery.",
    });
  };

  const getFilteredSessions = () => {
    let filtered = sessionLogs;

    if (sessionFilter) {
      filtered = filtered.filter(session => 
        session.userName?.toLowerCase().includes(sessionFilter.toLowerCase()) ||
        session.content.toLowerCase().includes(sessionFilter.toLowerCase())
      );
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(session => session.timestamp >= filterDate);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const getFilteredFlags = () => {
    let filtered = flaggedContent;

    if (flagFilter !== 'all') {
      filtered = filtered.filter(flag => flag.status === flagFilter);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center py-12">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-destructive" />
              <span>Access Denied</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You don't have permission to access the admin dashboard. Contact your administrator for access.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <Shield className="h-8 w-8 mr-3 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor student activity, review flagged content, and manage system security
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{sessionLogs.length}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Total Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {flaggedContent.filter(f => f.status === 'pending').length}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Pending Flags</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round((testResults.filter(t => t.passed).length / testResults.length) * 100) || 0}%
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Pass Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{badgeHistory.length}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Badges Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="sessions">Session Logs</TabsTrigger>
            <TabsTrigger value="flags">Flagged Content</TabsTrigger>
            <TabsTrigger value="tests">Test Results</TabsTrigger>
            <TabsTrigger value="badges">Badge History</TabsTrigger>
            <TabsTrigger value="publications">Publications</TabsTrigger>
            <TabsTrigger value="memory">Memory Insights</TabsTrigger>
          </TabsList>

          {/* Session Logs Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Session Activity</CardTitle>
                    <CardDescription>Monitor all student interactions and AI responses</CardDescription>
                  </div>
                  <Button onClick={() => exportToCSV(getFilteredSessions(), 'session-logs')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search sessions..."
                      value={sessionFilter}
                      onChange={(e) => setSessionFilter(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Past Week</SelectItem>
                      <SelectItem value="month">Past Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {getFilteredSessions().map((session) => (
                    <div key={session.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{session.action}</Badge>
                            <Badge variant="secondary">{session.gradeBand === 'middle' ? 'Grades 6-8' : 'Grades 9-12'}</Badge>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {session.userName || session.userId}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {session.content}
                          </p>
                          <p className="text-xs text-gray-500">
                            {session.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Flagged Content Tab */}
          <TabsContent value="flags" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Flagged Content</CardTitle>
                    <CardDescription>Review content flagged by Guardian Agent</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Select value={flagFilter} onValueChange={setFlagFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="cleared">Cleared</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => exportToCSV(getFilteredFlags(), 'flagged-content')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getFilteredFlags().map((flag) => (
                    <div key={flag.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant={flag.status === 'pending' ? 'destructive' : flag.status === 'cleared' ? 'default' : 'secondary'}>
                              {flag.status}
                            </Badge>
                            <Badge variant="outline">{flag.reason}</Badge>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {flag.userName || flag.userId}
                            </span>
                          </div>
                          <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded border border-red-200 dark:border-red-800">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {flag.content}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{flag.timestamp.toLocaleString()}</span>
                            {flag.reviewedBy && (
                              <span>Reviewed by {flag.reviewedBy} at {flag.reviewedAt?.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {flag.status === 'pending' && (
                            <Button size="sm" onClick={() => clearFlag(flag.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Clear
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Results Tab */}
          <TabsContent value="tests" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Test Results</CardTitle>
                    <CardDescription>Monitor student test performance and scores</CardDescription>
                  </div>
                  <Button onClick={() => exportToCSV(testResults, 'test-results')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResults.map((result) => (
                    <div key={result.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant={result.passed ? 'default' : 'destructive'}>
                              {result.passed ? 'Passed' : 'Failed'}
                            </Badge>
                            <Badge variant="outline">{result.topicTitle}</Badge>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {result.userName || result.userId}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="font-semibold">Score: {result.score}%</span>
                            <span>({result.score * result.totalQuestions / 100}/{result.totalQuestions} correct)</span>
                            <span>Time: {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {result.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{result.score}%</div>
                          {!result.passed && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => overrideBadge(result.userId, result.topicId)}
                              className="mt-2"
                            >
                              Grant Badge
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badge History Tab */}
          <TabsContent value="badges" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Badge History</CardTitle>
                    <CardDescription>Track badge achievements and manual overrides</CardDescription>
                  </div>
                  <Button onClick={() => exportToCSV(badgeHistory, 'badge-history')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {badgeHistory.map((badge) => (
                    <div key={badge.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">🏆</div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold">{badge.topicTitle}</span>
                              {badge.manualOverride && (
                                <Badge variant="outline">Manual Override</Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>{badge.userName || badge.userId}</span>
                              <span>Score: {badge.testScore}%</span>
                              <span>{badge.earnedDate.toLocaleDateString()}</span>
                            </div>
                            {badge.overrideBy && (
                              <p className="text-xs text-gray-500">
                                Override by {badge.overrideBy}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-success">{badge.testScore}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Publication Requests Tab */}
          <TabsContent value="publications" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Publication Requests</CardTitle>
                    <CardDescription>Review and approve student projects for the public gallery</CardDescription>
                  </div>
                  <Button onClick={() => exportToCSV(publicationRequests, 'publication-requests')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {publicationRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant={
                              request.status === 'approved' ? 'default' :
                              request.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {request.status}
                            </Badge>
                            <span className="font-semibold">{request.projectTitle}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              by {request.studentAlias}
                            </span>
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {request.content.length > 200 
                                ? `${request.content.substring(0, 200)}...` 
                                : request.content}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Submitted {request.submittedAt.toLocaleString()}</span>
                            {request.reviewedBy && (
                              <span>Reviewed by {request.reviewedBy} at {request.reviewedAt?.toLocaleString()}</span>
                            )}
                          </div>
                          
                          {request.rejectionReason && (
                            <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-200 dark:border-red-800">
                              <p className="text-sm text-red-700 dark:text-red-300">
                                <strong>Rejection reason:</strong> {request.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          {request.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => approvePublication(request.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => rejectPublication(request.id, 'Content does not meet guidelines')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Student Memory Insights Tab */}
          <TabsContent value="memory" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Student Memory Insights</CardTitle>
                    <CardDescription>Real-time view of student learning profiles and patterns</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={exportMemoryInsights}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary">{studentMemoryInsights.length}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Active Students</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(studentMemoryInsights.reduce((sum, s) => sum + s.averageTestScore, 0) / studentMemoryInsights.length) || 0}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(studentMemoryInsights.reduce((sum, s) => sum + s.totalLessonsCompleted, 0) / studentMemoryInsights.length) || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Avg Lessons</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {studentMemoryInsights.filter(s => s.interactionPatterns.needsEncouragement).length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Need Support</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Student Memory Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Student
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Learning Style
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Performance
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Strengths
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Areas to Improve
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Last Topic
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {studentMemoryInsights.map((insight) => (
                            <tr key={insight.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8">
                                    <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                      <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                    </div>
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {insight.userName || 'Anonymous'}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {insight.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-lg mr-2">{getLearningStyleIcon(insight.preferredLearningStyle)}</span>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                      {insight.preferredLearningStyle}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {insight.interactionPatterns.asksForExamples && '📚 Examples • '}
                                      {insight.interactionPatterns.prefersStepByStep && '🪜 Step-by-step • '}
                                      {insight.interactionPatterns.needsEncouragement && '💪 Needs support'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm">
                                  <div className={`font-medium ${getPerformanceColor(insight.averageTestScore)}`}>
                                    {insight.averageTestScore}% avg
                                  </div>
                                  <div className="text-gray-500 dark:text-gray-400">
                                    {insight.totalLessonsCompleted} lessons
                                  </div>
                                </div>
                              </td>
                              
                              <td className="px-4 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {insight.identifiedStrengths.slice(0, 2).map((strength, index) => (
                                    <Badge key={index} variant="default" className="text-xs bg-green-100 text-green-700">
                                      {strength}
                                    </Badge>
                                  ))}
                                  {insight.identifiedStrengths.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{insight.identifiedStrengths.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              
                              <td className="px-4 py-4">
                                <div className="space-y-1">
                                  {insight.weaknessAreas.slice(0, 2).map((weakness, index) => (
                                    <Badge key={index} variant="outline" className="text-xs mr-1">
                                      {weakness}
                                    </Badge>
                                  ))}
                                  {insight.missedTestConcepts.slice(0, 1).map((concept, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs mr-1 bg-yellow-100 text-yellow-700">
                                      {concept}
                                    </Badge>
                                  ))}
                                </div>
                              </td>
                              
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm">
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {insight.lastLessonTopic || 'None'}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {insight.lastActivity.toLocaleDateString()}
                                  </div>
                                </div>
                              </td>
                              
                              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => resetStudentMemory(insight.userId)}
                                    className="text-orange-600 hover:text-orange-700"
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Reset
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Detailed Analysis Cards */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Learning Style Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {['visual', 'text', 'voice', 'examples'].map(style => {
                            const count = studentMemoryInsights.filter(s => s.preferredLearningStyle === style).length;
                            const percentage = studentMemoryInsights.length > 0 ? (count / studentMemoryInsights.length) * 100 : 0;
                            return (
                              <div key={style} className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <span className="mr-2">{getLearningStyleIcon(style)}</span>
                                  <span className="text-sm capitalize">{style}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                      className="bg-primary h-2 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{count}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Common Patterns</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">Most Common Mistakes</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Vague prompts, Missing examples, Technical jargon
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">Top Strength Areas</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Creative writing, Problem solving, Critical thinking
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">Students Needing Support</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {studentMemoryInsights.filter(s => s.averageTestScore < 75 || s.interactionPatterns.needsEncouragement).length} students
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}