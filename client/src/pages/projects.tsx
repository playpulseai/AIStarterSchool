import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, FolderOpen, Eye, Edit, Trash2, Calendar, User, Heart, Download, Copy, FileText, Trophy, Star, Globe, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SessionLogger, getUserId } from '@/lib/safety-agents';
import { ProgressTracker, CURRICULUM_TOPICS } from '@/lib/curriculum-engine';

interface Project {
  id: string;
  title: string;
  description: string;
  type: 'chatbot' | 'image-gen' | 'writing' | 'productivity' | 'other';
  status: 'draft' | 'in-progress' | 'completed' | 'published';
  createdAt: Date;
  updatedAt: Date;
  content: string;
  tags: string[];
  isPublic?: boolean;
  publishedAt?: Date;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  studentAlias?: string;
}

interface AIGeneration {
  id: string;
  userId: string;
  topicId?: string;
  lessonStep?: number;
  prompt: string;
  aiResponse: string;
  timestamp: Date;
  isFavorite: boolean;
  generationType: 'lesson' | 'project' | 'experiment';
  metadata?: {
    gradeBand?: string;
    responseTime?: number;
    tokenCount?: number;
  };
}

interface StudentBadge {
  topicId: string;
  topicTitle: string;
  icon: string;
  earnedDate: Date;
  testScore: number;
}

const PROJECT_TYPES = {
  'chatbot': { label: 'AI Chatbot', icon: '🤖', color: 'bg-blue-500' },
  'image-gen': { label: 'Image Generation', icon: '🎨', color: 'bg-purple-500' },
  'writing': { label: 'AI Writing', icon: '✍️', color: 'bg-green-500' },
  'productivity': { label: 'Productivity Tool', icon: '⚡', color: 'bg-orange-500' },
  'other': { label: 'Other', icon: '📁', color: 'bg-gray-500' }
};

const STATUS_COLORS = {
  'draft': 'bg-gray-500',
  'in-progress': 'bg-yellow-500',
  'completed': 'bg-green-500',
  'published': 'bg-blue-500'
};

export default function Projects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'Personal Study Assistant',
      description: 'A chatbot that helps with homework questions and explains concepts in simple terms.',
      type: 'chatbot',
      status: 'completed',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      content: 'This chatbot uses natural language processing to understand student questions and provide helpful explanations. It can assist with math problems, science concepts, and writing assignments.',
      tags: ['education', 'homework', 'assistant']
    },
    {
      id: '2',
      title: 'Creative Story Generator',
      description: 'An AI tool that generates creative story prompts and helps develop characters.',
      type: 'writing',
      status: 'in-progress',
      createdAt: new Date('2024-01-22'),
      updatedAt: new Date('2024-01-25'),
      content: 'This project explores how AI can assist in creative writing by generating unique story prompts, character descriptions, and plot ideas.',
      tags: ['creativity', 'stories', 'writing']
    },
    {
      id: '3',
      title: 'Logo Designer Bot',
      description: 'AI-powered logo creation tool for school projects and clubs.',
      type: 'image-gen',
      status: 'draft',
      createdAt: new Date('2024-01-28'),
      updatedAt: new Date('2024-01-28'),
      content: 'Working on prompts to generate professional-looking logos for various purposes.',
      tags: ['design', 'logos', 'graphics']
    }
  ]);

  const [aiGenerations, setAiGenerations] = useState<AIGeneration[]>([
    {
      id: 'gen-1',
      userId: 'demo-user',
      topicId: 'prompting-basics',
      lessonStep: 1,
      prompt: 'Write a clear prompt to help me create a story about a robot chef',
      aiResponse: 'Here\'s a well-structured prompt: "Write a 300-word short story about ROBO-3000, a malfunctioning kitchen robot who accidentally becomes the best chef in New York City. Include: how the malfunction actually improves its cooking, one specific dish it creates, and how the human customers react when they discover their chef is a robot. Use a humorous tone and include dialogue between ROBO-3000 and the restaurant owner."',
      timestamp: new Date('2024-01-16'),
      isFavorite: true,
      generationType: 'lesson',
      metadata: {
        gradeBand: 'middle',
        responseTime: 1200,
        tokenCount: 95
      }
    },
    {
      id: 'gen-2',
      userId: 'demo-user',
      topicId: 'ai-art',
      lessonStep: 2,
      prompt: 'Create a prompt for generating a fantasy landscape with magical elements',
      aiResponse: 'Perfect art generation prompt: "A mystical forest clearing at twilight with floating luminescent crystals, ancient stone archways covered in glowing vines, ethereal blue and purple lighting, mystical fog rolling across the ground, digital art style, highly detailed, fantasy concept art, trending on ArtStation"',
      timestamp: new Date('2024-01-18'),
      isFavorite: false,
      generationType: 'lesson',
      metadata: {
        gradeBand: 'middle',
        responseTime: 800,
        tokenCount: 67
      }
    },
    {
      id: 'gen-3',
      userId: 'demo-user',
      prompt: 'Help me write a persuasive essay about renewable energy for my science class',
      aiResponse: 'Here\'s a structured approach for your essay:\n\n**Introduction**: Start with a striking fact about climate change, then introduce renewable energy as a solution.\n\n**Body Paragraph 1**: Economic benefits - job creation, long-term cost savings\n**Body Paragraph 2**: Environmental impact - reduced emissions, cleaner air\n**Body Paragraph 3**: Energy independence - reduced reliance on fossil fuel imports\n\n**Conclusion**: Summarize benefits and call for immediate action.\n\n**Key phrases to use**: "sustainable future," "clean energy transition," "environmental stewardship"\n\nRemember to cite specific statistics and examples!',
      timestamp: new Date('2024-01-20'),
      isFavorite: true,
      generationType: 'project',
      metadata: {
        gradeBand: 'high',
        responseTime: 1800,
        tokenCount: 142
      }
    }
  ]);

  const [earnedBadges, setEarnedBadges] = useState<StudentBadge[]>([
    {
      topicId: 'prompting-basics',
      topicTitle: 'Prompting Basics',
      icon: '🌱',
      earnedDate: new Date('2024-01-16'),
      testScore: 85
    }
  ]);

  const [progressData, setProgressData] = useState<any[]>([]);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedGeneration, setSelectedGeneration] = useState<AIGeneration | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isGenerationDialogOpen, setIsGenerationDialogOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [projectToPublish, setProjectToPublish] = useState<Project | null>(null);
  const [studentAlias, setStudentAlias] = useState('');
  const [activeTab, setActiveTab] = useState('projects');
  const [memoryFeedback, setMemoryFeedback] = useState<string>('');
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    type: 'other' as Project['type'],
    content: '',
    tags: ''
  });

  useEffect(() => {
    loadUserProgress();
  }, []);

  const loadUserProgress = async () => {
    try {
      const userId = getUserId();
      const progress = await ProgressTracker.getAllTopicProgress(userId);
      setProgressData(progress);
      
      // Load earned badges
      const badges = progress
        .filter(p => p.badgeUnlocked)
        .map(p => {
          const topic = CURRICULUM_TOPICS.find(t => t.id === p.topicId);
          return {
            topicId: p.topicId,
            topicTitle: topic?.title || 'Unknown Topic',
            icon: topic?.icon || '🏆',
            earnedDate: p.lastActivity,
            testScore: p.testScore || 0
          };
        });
      setEarnedBadges(badges);
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const createProject = () => {
    if (!newProject.title.trim() || !newProject.description.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in title and description.",
      });
      return;
    }

    const project: Project = {
      id: Date.now().toString(),
      title: newProject.title,
      description: newProject.description,
      type: newProject.type,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      content: newProject.content,
      tags: newProject.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    setProjects(prev => [project, ...prev]);
    setNewProject({ title: '', description: '', type: 'other', content: '', tags: '' });
    setIsCreateDialogOpen(false);

    toast({
      title: "Project Created",
      description: "Your new AI project has been added to your portfolio.",
    });
  };

  const updateProjectStatus = (projectId: string, newStatus: Project['status']) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, status: newStatus, updatedAt: new Date() }
        : project
    ));
    
    toast({
      title: "Status Updated",
      description: `Project status changed to ${newStatus}.`,
    });
  };

  const deleteProject = async (projectId: string) => {
    // Log deletion action
    const userId = getUserId();
    await SessionLogger.logSession({
      userId,
      gradeBand: 'middle',
      lessonStep: 0,
      action: 'prompt_submit',
      content: `Deleted project: ${projectId}`,
      timestamp: new Date()
    });

    setProjects(prev => prev.filter(project => project.id !== projectId));
    toast({
      title: "Project Deleted",
      description: "Project has been removed from your portfolio.",
    });
  };

  const toggleFavorite = async (generationId: string) => {
    const userId = getUserId();
    await SessionLogger.logSession({
      userId,
      gradeBand: 'middle',
      lessonStep: 0,
      action: 'prompt_submit',
      content: `Toggled favorite: ${generationId}`,
      timestamp: new Date()
    });

    setAiGenerations(prev => prev.map(gen => 
      gen.id === generationId 
        ? { ...gen, isFavorite: !gen.isFavorite }
        : gen
    ));
    
    toast({
      title: "Updated",
      description: "Favorite status updated.",
    });
  };

  const deleteGeneration = async (generationId: string) => {
    const userId = getUserId();
    await SessionLogger.logSession({
      userId,
      gradeBand: 'middle',
      lessonStep: 0,
      action: 'prompt_submit',
      content: `Deleted AI generation: ${generationId}`,
      timestamp: new Date()
    });

    setAiGenerations(prev => prev.filter(gen => gen.id !== generationId));
    toast({
      title: "Deleted",
      description: "AI generation has been removed.",
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Content copied to clipboard.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy to clipboard.",
      });
    }
  };

  const exportToPDF = (generation: AIGeneration) => {
    // Create a simple text export (in a real app, you'd use a PDF library)
    const content = `AI Generation Export
Date: ${generation.timestamp.toLocaleDateString()}
Topic: ${generation.topicId || 'General'}

Prompt:
${generation.prompt}

AI Response:
${generation.aiResponse}

Generated with AIStarter School`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-generation-${generation.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: "AI generation exported successfully.",
    });
  };

  const initiatePublish = (project: Project) => {
    setProjectToPublish(project);
    setStudentAlias('');
    setIsPublishDialogOpen(true);
  };

  const publishProject = async () => {
    if (!projectToPublish || !studentAlias.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a display alias for your project.",
      });
      return;
    }

    const userId = getUserId();
    await SessionLogger.logSession({
      userId,
      gradeBand: 'middle',
      lessonStep: 0,
      action: 'prompt_submit',
      content: `Published project: ${projectToPublish.title} with alias: ${studentAlias}`,
      timestamp: new Date()
    });

    // Update project to published status
    setProjects(prev => prev.map(project =>
      project.id === projectToPublish.id
        ? {
            ...project,
            isPublic: true,
            publishedAt: new Date(),
            approvalStatus: 'pending' as const,
            studentAlias: studentAlias.trim(),
            status: 'published' as const
          }
        : project
    ));

    setIsPublishDialogOpen(false);
    setProjectToPublish(null);

    toast({
      title: "Project Submitted",
      description: "Your project has been submitted for review. It will appear in the public gallery once approved by our moderators.",
    });
  };

  const viewProject = (project: Project) => {
    setSelectedProject(project);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: Project['status']) => {
    return (
      <Badge className={`${STATUS_COLORS[status]} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My AI Portfolio
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your AI projects, generations, and achievements
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New AI Project</DialogTitle>
                <DialogDescription>
                  Start building your AI project portfolio
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Smart Study Assistant"
                    value={newProject.title}
                    onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Project Type</Label>
                  <Select value={newProject.type} onValueChange={(value: Project['type']) => setNewProject(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROJECT_TYPES).map(([key, type]) => (
                        <SelectItem key={key} value={key}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What does your AI project do?"
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Project Details</Label>
                  <Textarea
                    id="content"
                    placeholder="Describe how you built it, what AI tools you used, challenges you faced..."
                    value={newProject.content}
                    onChange={(e) => setNewProject(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., chatbot, education, productivity"
                    value={newProject.tags}
                    onChange={(e) => setNewProject(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={createProject} className="flex-1 bg-primary hover:bg-primary/90 text-white">
                    Create Project
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Earned Badges Section */}
        {earnedBadges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-accent" />
              Earned Badges
            </h2>
            <div className="flex flex-wrap gap-4">
              {earnedBadges.map((badge) => (
                <div key={badge.topicId} className="bg-white dark:bg-card rounded-lg p-4 border border-gray-200 dark:border-border flex items-center space-x-3">
                  <div className="text-2xl">{badge.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{badge.topicTitle}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Earned {badge.earnedDate.toLocaleDateString()} • Score: {badge.testScore}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs for different content types */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
            <TabsTrigger value="generations">AI Generations ({aiGenerations.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="space-y-6">
            {/* Projects Grid */}
            {projects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No projects yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start building your AI project portfolio
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const projectType = PROJECT_TYPES[project.type];
              
              return (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 ${projectType.color} rounded-lg flex items-center justify-center text-white text-sm`}>
                          {projectType.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusBadge(project.status)}
                            <Badge variant="outline">{projectType.label}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="mb-4">
                      {project.description}
                    </CardDescription>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <Calendar className="h-3 w-3 mr-1" />
                      Created {project.createdAt.toLocaleDateString()}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewProject(project)}
                        className="flex-1"
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      
                      <Select
                        value={project.status}
                        onValueChange={(value: Project['status']) => updateProjectStatus(project.id, value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {project.status === 'completed' && !project.isPublic && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => initiatePublish(project)}
                          className="mr-2"
                        >
                          <Globe className="h-3 w-3 mr-1" />
                          Publish
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteProject(project.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
          </TabsContent>
        </Tabs>

        {/* Project View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            {selectedProject && (
              <>
                <DialogHeader>
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 ${PROJECT_TYPES[selectedProject.type].color} rounded-lg flex items-center justify-center text-white text-sm`}>
                      {PROJECT_TYPES[selectedProject.type].icon}
                    </div>
                    <div>
                      <DialogTitle>{selectedProject.title}</DialogTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(selectedProject.status)}
                        <Badge variant="outline">{PROJECT_TYPES[selectedProject.type].label}</Badge>
                        {selectedProject.isPublic && (
                          <Badge variant="default" className="bg-green-500">
                            <Globe className="h-3 w-3 mr-1" />
                            Public
                          </Badge>
                        )}
                        {selectedProject.approvalStatus && (
                          <Badge variant={
                            selectedProject.approvalStatus === 'approved' ? 'default' :
                            selectedProject.approvalStatus === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {selectedProject.approvalStatus === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {selectedProject.approvalStatus === 'pending' && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {selectedProject.approvalStatus}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedProject.description}</p>
                  </div>
                  
                  {selectedProject.content && (
                    <div>
                      <h4 className="font-semibold mb-2">Project Details</h4>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedProject.content}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedProject.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Created:</span>
                      <p className="text-gray-600 dark:text-gray-400">{selectedProject.createdAt.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span>
                      <p className="text-gray-600 dark:text-gray-400">{selectedProject.updatedAt.toLocaleDateString()}</p>
                    </div>
                    {selectedProject.publishedAt && (
                      <div>
                        <span className="font-medium">Published:</span>
                        <p className="text-gray-600 dark:text-gray-400">{selectedProject.publishedAt.toLocaleDateString()}</p>
                      </div>
                    )}
                    {selectedProject.studentAlias && (
                      <div>
                        <span className="font-medium">Public Alias:</span>
                        <p className="text-gray-600 dark:text-gray-400">{selectedProject.studentAlias}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* AI Generation View Dialog */}
        <Dialog open={isGenerationDialogOpen} onOpenChange={setIsGenerationDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
            {selectedGeneration && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>AI Generation Details</span>
                  </DialogTitle>
                  <DialogDescription>
                    {selectedGeneration.generationType} • {selectedGeneration.timestamp.toLocaleString()}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Badge variant={selectedGeneration.generationType === 'lesson' ? 'default' : 'secondary'}>
                      {selectedGeneration.generationType}
                    </Badge>
                    {selectedGeneration.topicId && (
                      <Badge variant="outline">
                        {CURRICULUM_TOPICS.find(t => t.id === selectedGeneration.topicId)?.title || selectedGeneration.topicId}
                        {selectedGeneration.lessonStep && ` - Lesson ${selectedGeneration.lessonStep}`}
                      </Badge>
                    )}
                    {selectedGeneration.isFavorite && (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        <Heart className="h-3 w-3 mr-1 fill-current" />
                        Favorite
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Original Prompt:</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedGeneration.prompt}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">AI Response:</h4>
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedGeneration.aiResponse}
                      </p>
                    </div>
                  </div>
                  
                  {selectedGeneration.metadata && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Generation Details:</h4>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {selectedGeneration.metadata.gradeBand && (
                            <div>
                              <span className="font-medium">Grade Band:</span>
                              <span className="ml-2 text-gray-600 dark:text-gray-400">
                                {selectedGeneration.metadata.gradeBand === 'middle' ? '6-8' : '9-12'}
                              </span>
                            </div>
                          )}
                          {selectedGeneration.metadata.responseTime && (
                            <div>
                              <span className="font-medium">Response Time:</span>
                              <span className="ml-2 text-gray-600 dark:text-gray-400">
                                {selectedGeneration.metadata.responseTime}ms
                              </span>
                            </div>
                          )}
                          {selectedGeneration.metadata.tokenCount && (
                            <div>
                              <span className="font-medium">Tokens:</span>
                              <span className="ml-2 text-gray-600 dark:text-gray-400">
                                {selectedGeneration.metadata.tokenCount}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={() => toggleFavorite(selectedGeneration.id)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Heart className={`h-4 w-4 mr-2 ${selectedGeneration.isFavorite ? 'text-red-500 fill-current' : ''}`} />
                      {selectedGeneration.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </Button>
                    
                    <Button
                      onClick={() => copyToClipboard(`Prompt: ${selectedGeneration.prompt}\n\nResponse: ${selectedGeneration.aiResponse}`)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All
                    </Button>
                    
                    <Button
                      onClick={() => exportToPDF(selectedGeneration)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Publish Project Dialog */}
        <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
          <DialogContent className="sm:max-w-md">
            {projectToPublish && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <span>Publish to Gallery</span>
                  </DialogTitle>
                  <DialogDescription>
                    Share your project "{projectToPublish.title}" with the public gallery
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> Your project will be reviewed by moderators before appearing publicly. 
                      Only your chosen display name will be visible - your real name stays private.
                    </AlertDescription>
                  </Alert>
                  
                  <div>
                    <Label htmlFor="student-alias">Display Name (Public Alias)</Label>
                    <Input
                      id="student-alias"
                      placeholder="e.g., TechExplorer, CodeWiz, ArtMaster..."
                      value={studentAlias}
                      onChange={(e) => setStudentAlias(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This name will be shown publicly instead of your real name
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">What happens next?</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Your project will be submitted for moderation review</li>
                      <li>• If approved, it will appear in the public gallery</li>
                      <li>• Other students can view and like your project</li>
                      <li>• You can unpublish it anytime from your portfolio</li>
                    </ul>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button onClick={publishProject} className="flex-1" disabled={!studentAlias.trim()}>
                      <Globe className="mr-2 h-4 w-4" />
                      Publish Project
                    </Button>
                    <Button variant="outline" onClick={() => setIsPublishDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}