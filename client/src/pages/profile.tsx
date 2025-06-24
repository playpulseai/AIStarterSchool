import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Trophy, Calendar, Edit, Save, X, Star, Target, Zap, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProgressTracker } from '@/lib/curriculum-engine';
import { SmartMemory } from '@/lib/smart-memory';

interface UserProfile {
  fullName: string;
  gradeLevel: string;
  bio: string;
  interests: string[];
  joinDate: Date;
  achievements: Achievement[];
  stats: {
    lessonsCompleted: number;
    projectsCreated: number;
    badgesEarned: number;
    studyHours: number;
    currentStreak: number;
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'project' | 'social' | 'milestone';
  earnedDate: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const ACHIEVEMENT_COLORS = {
  'common': 'bg-gray-500',
  'rare': 'bg-blue-500',
  'epic': 'bg-purple-500',
  'legendary': 'bg-yellow-500'
};

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    fullName: 'Alex Johnson',
    gradeLevel: '8',
    bio: 'Passionate about AI and technology. Love building chatbots and exploring how AI can help solve real-world problems.',
    interests: ['AI Development', 'Robotics', 'Creative Writing', 'Game Design'],
    joinDate: new Date('2024-01-15'),
    achievements: [
      {
        id: '1',
        title: 'First Steps',
        description: 'Completed your first AI lesson',
        icon: '🌱',
        category: 'learning',
        earnedDate: new Date('2024-01-15'),
        rarity: 'common'
      },
      {
        id: '2',
        title: 'AI Fundamentals Master',
        description: 'Scored 85% or higher on the AI knowledge test',
        icon: '🧠',
        category: 'learning',
        earnedDate: new Date('2024-01-20'),
        rarity: 'rare'
      },
      {
        id: '3',
        title: 'Project Pioneer',
        description: 'Created your first AI project',
        icon: '🚀',
        category: 'project',
        earnedDate: new Date('2024-01-22'),
        rarity: 'rare'
      },
      {
        id: '4',
        title: 'Week Warrior',
        description: 'Maintained a 7-day study streak',
        icon: '⚡',
        category: 'milestone',
        earnedDate: new Date('2024-01-28'),
        rarity: 'epic'
      },
      {
        id: '5',
        title: 'Prompt Master',
        description: 'Mastered the art of AI prompting',
        icon: '✨',
        category: 'learning',
        earnedDate: new Date('2024-02-01'),
        rarity: 'epic'
      }
    ],
    stats: {
      lessonsCompleted: 12,
      projectsCreated: 3,
      badgesEarned: 5,
      studyHours: 24,
      currentStreak: 7
    }
  });

  const [editForm, setEditForm] = useState({
    fullName: profile.fullName,
    gradeLevel: profile.gradeLevel,
    bio: profile.bio,
    interests: profile.interests.join(', ')
  });
  const [memoryInsights, setMemoryInsights] = useState<any>(null);

  useEffect(() => {
    loadMemoryInsights();
  }, []);

  const loadMemoryInsights = async () => {
    try {
      const insights = await SmartMemory.getMemoryInsights();
      setMemoryInsights(insights);
    } catch (error) {
      console.error('Failed to load memory insights:', error);
    }
  };

  const saveProfile = () => {
    setProfile(prev => ({
      ...prev,
      fullName: editForm.fullName,
      gradeLevel: editForm.gradeLevel,
      bio: editForm.bio,
      interests: editForm.interests.split(',').map(i => i.trim()).filter(i => i)
    }));
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const cancelEdit = () => {
    setEditForm({
      fullName: profile.fullName,
      gradeLevel: profile.gradeLevel,
      bio: profile.bio,
      interests: profile.interests.join(', ')
    });
    setIsEditing(false);
  };

  const getAchievementBadge = (achievement: Achievement) => {
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${ACHIEVEMENT_COLORS[achievement.rarity]}`}>
        <span className="mr-1">{achievement.icon}</span>
        {achievement.title}
      </div>
    );
  };

  const getRarityLabel = (rarity: Achievement['rarity']) => {
    const labels = {
      'common': 'Common',
      'rare': 'Rare',
      'epic': 'Epic',
      'legendary': 'Legendary'
    };
    return labels[rarity];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {profile.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.fullName}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">Grade {profile.gradeLevel}</p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-500 mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {profile.joinDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
              
              <Button
                variant={isEditing ? "outline" : "default"}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gradeLevel">Grade Level</Label>
                    <Select value={editForm.gradeLevel} onValueChange={(value) => setEditForm(prev => ({ ...prev, gradeLevel: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">Grade 6</SelectItem>
                        <SelectItem value="7">Grade 7</SelectItem>
                        <SelectItem value="8">Grade 8</SelectItem>
                        <SelectItem value="9">Grade 9</SelectItem>
                        <SelectItem value="10">Grade 10</SelectItem>
                        <SelectItem value="11">Grade 11</SelectItem>
                        <SelectItem value="12">Grade 12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    placeholder="Tell us about yourself and your AI interests..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="interests">Interests (comma-separated)</Label>
                  <Input
                    id="interests"
                    value={editForm.interests}
                    onChange={(e) => setEditForm(prev => ({ ...prev, interests: e.target.value }))}
                    placeholder="e.g., AI Development, Robotics, Creative Writing"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={saveProfile} className="bg-primary hover:bg-primary/90 text-white">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">About</h3>
                  <p className="text-gray-600 dark:text-gray-400">{profile.bio}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary mb-1">
                {memoryInsights ? memoryInsights.totalLessons : profile.stats.lessonsCompleted}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Lessons</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success mb-1">{profile.stats.projectsCreated}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Projects</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-accent mb-1">{profile.stats.badgesEarned}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Badges</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-secondary mb-1">
                {memoryInsights ? Math.round(memoryInsights.averageScore) : 85}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning mb-1">{profile.stats.studyHours}h</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Study Time</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-500 mb-1">{profile.stats.currentStreak}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-primary" />
              Achievements & Badges
            </CardTitle>
            <CardDescription>
              Your learning milestones and accomplishments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {profile.achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {achievement.title}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={`${ACHIEVEMENT_COLORS[achievement.rarity]} text-white border-none`}
                      >
                        {getRarityLabel(achievement.rarity)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {achievement.description}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      Earned {achievement.earnedDate.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {profile.achievements.length === 0 && (
              <div className="text-center py-8">
                <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No achievements yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Start learning to earn your first badges!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}