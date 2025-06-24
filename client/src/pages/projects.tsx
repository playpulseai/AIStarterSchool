import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FolderOpen, Eye, Edit, Trash2, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    type: 'other' as Project['type'],
    content: '',
    tags: ''
  });

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

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
    toast({
      title: "Project Deleted",
      description: "Project has been removed from your portfolio.",
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
              My AI Projects
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Build and showcase your AI creations
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