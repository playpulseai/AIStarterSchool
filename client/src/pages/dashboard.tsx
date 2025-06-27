import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trophy, Clock, TrendingUp, Brain, Target, Home, GraduationCap, TestTube, FolderOpen, User, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserId } from '@/lib/safety-agents';

interface DashboardStats {
  lessonsCompleted: number;
  badgesEarned: number;
  studyTimeHours: number;
  averageScore: number;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    lessonsCompleted: 0,
    badgesEarned: 0,
    studyTimeHours: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Check if we're in demo mode
      const hasAccess = localStorage.getItem('investorDemoAccess') === 'true';
      if (!user && hasAccess) {
        setIsDemoMode(true);
        setLoading(false);
        return;
      }

      if (!user) {
        setLoading(false);
        return;
      }

      const userId = getUserId();
      
      // Load live Firebase data
      // In a real implementation, these would be Firebase queries:
      // - /lesson_sessions/{userId}/ for lesson completion data
      // - /user_metadata/{userId}/badges for badges
      // - Calculate study time from session timestamps
      
      // For now, return zero values for authentic empty state
      const dashboardStats: DashboardStats = {
        lessonsCompleted: 0,
        badgesEarned: 0,
        studyTimeHours: 0,
        averageScore: 0
      };

      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data. Please refresh the page."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Clear demo access token
      localStorage.removeItem('investorDemoAccess');
      // Redirect to homepage
      setLocation('/');
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account."
      });
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        variant: "destructive",
        title: "Logout Error",
        description: "Failed to sign out. Please try again."
      });
    }
  };

  const getUserDisplayName = () => {
    if (isDemoMode) return "Demo User";
    if (!user) return "Guest";
    
    // Try to extract first name from email or use email
    if (user.email) {
      const name = user.email.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    
    return user.displayName || "Student";
  };

  // Redirect if not authenticated and not in demo mode
  if (!user && !isDemoMode && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Login Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to access your dashboard.
          </p>
          <Button onClick={() => setLocation('/')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {getUserDisplayName()}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {isDemoMode ? (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    You are currently in Demo Mode — progress will not be saved
                  </span>
                ) : (
                  "Continue your AI learning journey"
                )}
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.lessonsCompleted || "—"}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Lessons Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-success" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.badgesEarned || "—"}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Badges Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.studyTimeHours > 0 ? `${stats.studyTimeHours}h` : "—"}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Study Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.averageScore > 0 ? `${stats.averageScore}%` : "—"}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Average Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/curriculum">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI Curriculum</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Explore structured learning topics
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/lessons">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI Lessons</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Interactive lessons with AI teachers
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/gallery">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">My Gallery</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View your saved projects and creations
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Current Learning */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-primary" />
                  Continue Learning
                </CardTitle>
                <CardDescription>
                  Pick up where you left off in your AI journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Link href="/curriculum">
                    <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">AI Curriculum Topics</h3>
                        <Badge variant="secondary">5 Topics Available</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Explore structured learning paths: Prompting, AI Art, School Applications, Automation, and Ethics.
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">🌱 ✍️ 🎨 📚 ⚡</span>
                      </div>
                    </div>
                  </Link>

                  <Link href="/lessons">
                    <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Interactive AI Lessons</h3>
                        <Badge variant="outline">AI Teacher</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Learn with autonomous AI teachers that adapt to your learning style.
                      </p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-success" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.lessonsCompleted === 0 && stats.badgesEarned === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      No progress yet — start a lesson to track your achievements!
                    </p>
                    <Link href="/curriculum">
                      <Button size="sm" className="w-full">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Start Learning
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.lessonsCompleted > 0 && (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Learning Progress</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {stats.lessonsCompleted} lesson{stats.lessonsCompleted !== 1 ? 's' : ''} completed
                          </p>
                        </div>
                      </div>
                    )}
                    {stats.badgesEarned > 0 && (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Achievements</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {stats.badgesEarned} badge{stats.badgesEarned !== 1 ? 's' : ''} earned
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Study Status */}
            <Card>
              <CardHeader>
                <CardTitle>Study Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  {stats.studyTimeHours > 0 ? (
                    <>
                      <div className="text-3xl font-bold text-primary mb-2">
                        {stats.studyTimeHours}h
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">total study time</p>
                      <p className="text-xs text-gray-500 mt-2">Great progress!</p>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-gray-400 mb-2">—</div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">no study time yet</p>
                      <p className="text-xs text-gray-500 mt-2">Start learning to track your time</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Navigation - Mobile Only */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card border-t border-gray-200 dark:border-border md:hidden z-50">
          <div className="flex items-center justify-around py-2 safe-area-pb-2">
            <Link href="/dashboard" className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-primary">
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link href="/curriculum" className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-primary">
              <GraduationCap className="h-5 w-5" />
              <span className="text-xs mt-1">Curriculum</span>
            </Link>
            <Link href="/test" className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-primary">
              <TestTube className="h-5 w-5" />
              <span className="text-xs mt-1">Test</span>
            </Link>
            <Link href="/gallery" className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-primary">
              <FolderOpen className="h-5 w-5" />
              <span className="text-xs mt-1">Gallery</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-primary">
              <User className="h-5 w-5" />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
