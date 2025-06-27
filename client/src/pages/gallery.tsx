import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Eye, Trash2, Calendar, Palette, PenTool, BookOpen, Play, Sparkles, FolderOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { getUserId } from '@/lib/safety-agents';

interface StudentProject {
  id: string;
  title: string;
  content: string;
  type: 'ai-art' | 'writing' | 'lesson' | 'playground';
  timestamp: Date;
  thumbnail?: string;
  preview?: string;
}

interface ProjectsByType {
  'ai-art': StudentProject[];
  'writing': StudentProject[];
  'lesson': StudentProject[];
  'playground': StudentProject[];
}

const PROJECT_SECTIONS = {
  'ai-art': { 
    title: '🎨 AI Art Creation', 
    icon: Palette, 
    color: 'bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
  'writing': { 
    title: '✍️ Fantasy World Generator', 
    icon: PenTool, 
    color: 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  'lesson': { 
    title: '📚 Completed Lessons', 
    icon: BookOpen, 
    color: 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  'playground': { 
    title: '🚀 AI Playground Projects', 
    icon: Sparkles, 
    color: 'bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    iconColor: 'text-orange-600 dark:text-orange-400'
  }
};

export default function Gallery() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [projectsByType, setProjectsByType] = useState<ProjectsByType>({
    'ai-art': [],
    'writing': [],
    'lesson': [],
    'playground': []
  });
  const [selectedProject, setSelectedProject] = useState<StudentProject | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<StudentProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    loadUserProjects();
  }, [user]);

  const loadUserProjects = async () => {
    setLoading(true);
    try {
      // Check if we're in demo mode (no Firebase authentication)
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

      // Get current user ID for Firebase query
      const userId = getUserId();
      
      // In a real Firebase implementation, this would be:
      // const projectsRef = firebase.firestore().collection('student_projects').doc(userId).collection('projects');
      // const snapshot = await projectsRef.orderBy('timestamp', 'desc').get();
      
      // For now, simulate Firebase data structure
      const mockProjects: StudentProject[] = [];
      
      // Group projects by type
      const grouped: ProjectsByType = {
        'ai-art': mockProjects.filter(p => p.type === 'ai-art'),
        'writing': mockProjects.filter(p => p.type === 'writing'),
        'lesson': mockProjects.filter(p => p.type === 'lesson'),
        'playground': mockProjects.filter(p => p.type === 'playground')
      };

      setProjectsByType(grouped);
    } catch (error) {
      console.error('Error loading user projects:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your projects. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (project: StudentProject) => {
    try {
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to delete projects."
        });
        return;
      }

      const userId = getUserId();
      
      // In a real Firebase implementation:
      // await firebase.firestore().collection('student_projects')
      //   .doc(userId).collection('projects').doc(project.id).delete();

      // Update local state
      setProjectsByType(prev => ({
        ...prev,
        [project.type]: prev[project.type].filter(p => p.id !== project.id)
      }));

      toast({
        title: "Project Deleted",
        description: `"${project.title}" has been removed from your gallery.`
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete project. Please try again."
      });
    }
  };

  const viewProject = (project: StudentProject) => {
    setSelectedProject(project);
    setIsViewDialogOpen(true);
  };

  const confirmDelete = (project: StudentProject) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete);
      setProjectToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const getTotalProjects = () => {
    return Object.values(projectsByType).flat().length;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getPreviewText = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your projects...</p>
        </div>
      </div>
    );
  }

  if (isDemoMode) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <FolderOpen className="mx-auto h-16 w-16 text-gray-400 mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No saved projects in demo mode
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Projects are saved to your personal account. In demo mode, projects are not persisted.
            </p>
            <div className="space-x-4">
              <Button onClick={() => setLocation('/playground')}>
                <Sparkles className="mr-2 h-4 w-4" />
                Go to AI Playground
              </Button>
              <Button variant="outline" onClick={() => setLocation('/curriculum')}>
                <BookOpen className="mr-2 h-4 w-4" />
                Start a Lesson
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Login Required
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please log in to view your project gallery.
            </p>
            <Button onClick={() => setLocation('/')}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalProjects = getTotalProjects();

  if (totalProjects === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <FolderOpen className="mx-auto h-16 w-16 text-gray-400 mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No projects yet
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Complete a lesson or explore the AI Playground to get started!
            </p>
            <div className="space-x-4">
              <Button onClick={() => setLocation('/playground')}>
                <Sparkles className="mr-2 h-4 w-4" />
                Go to AI Playground
              </Button>
              <Button variant="outline" onClick={() => setLocation('/curriculum')}>
                <BookOpen className="mr-2 h-4 w-4" />
                Start a Lesson
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Project Gallery
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {totalProjects} saved project{totalProjects !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Project Sections */}
        <div className="space-y-12">
          {(Object.keys(PROJECT_SECTIONS) as Array<keyof ProjectsByType>).map((sectionType) => {
            const section = PROJECT_SECTIONS[sectionType];
            const projects = projectsByType[sectionType];
            
            if (projects.length === 0) return null;

            return (
              <div key={sectionType}>
                <div className="flex items-center mb-6">
                  <section.icon className={`h-6 w-6 mr-3 ${section.iconColor}`} />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {section.title}
                  </h2>
                  <Badge variant="secondary" className="ml-3">
                    {projects.length}
                  </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <Card key={project.id} className={`hover:shadow-lg transition-shadow ${section.color}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg leading-tight">
                            {project.title}
                          </CardTitle>
                          <div className="flex space-x-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewProject(project)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => confirmDelete(project)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(project.timestamp)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {project.thumbnail && (
                          <img 
                            src={project.thumbnail} 
                            alt={project.title}
                            className="w-full h-32 object-cover rounded-md mb-3"
                          />
                        )}
                        {project.preview && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {getPreviewText(project.preview)}
                          </p>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => viewProject(project)}
                          className="w-full"
                        >
                          <Eye className="mr-2 h-3 w-3" />
                          View Project
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* View Project Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Play className="mr-2 h-5 w-5" />
                {selectedProject?.title}
              </DialogTitle>
              <DialogDescription>
                Created on {selectedProject && formatDate(selectedProject.timestamp)}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {selectedProject?.thumbnail && (
                <img 
                  src={selectedProject.thumbnail} 
                  alt={selectedProject.title}
                  className="w-full max-h-64 object-cover rounded-lg mb-4"
                />
              )}
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {selectedProject?.content}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{projectToDelete?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}