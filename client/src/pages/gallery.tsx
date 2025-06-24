import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Eye, Heart, Calendar, Filter, Sparkles } from 'lucide-react';
import { CURRICULUM_TOPICS } from '@/lib/curriculum-engine';

interface PublicProject {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'chatbot' | 'image-gen' | 'writing' | 'productivity' | 'other';
  topicId?: string;
  studentAlias: string;
  gradeBand: 'middle' | 'high';
  publishedAt: Date;
  likes: number;
  tags: string[];
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
}

const PROJECT_TYPES = {
  'chatbot': { label: 'AI Chatbot', icon: '🤖', color: 'bg-blue-500' },
  'image-gen': { label: 'Image Generation', icon: '🎨', color: 'bg-purple-500' },
  'writing': { label: 'AI Writing', icon: '✍️', color: 'bg-green-500' },
  'productivity': { label: 'Productivity Tool', icon: '⚡', color: 'bg-orange-500' },
  'other': { label: 'Other', icon: '📁', color: 'bg-gray-500' }
};

export default function Gallery() {
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<PublicProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<PublicProject | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [gradeBandFilter, setGradeBandFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, topicFilter, typeFilter, gradeBandFilter]);

  const loadPublicProjects = async () => {
    try {
      // Mock data for demonstration - in real app would fetch from API
      const mockProjects: PublicProject[] = [
        {
          id: 'pub-1',
          title: 'Study Buddy AI',
          description: 'An AI assistant that helps with homework and explains complex topics in simple terms.',
          content: 'This chatbot was designed to help students understand difficult concepts by breaking them down into simpler explanations. It uses prompting techniques to ask clarifying questions and provide step-by-step guidance. The AI can help with math problems, science concepts, and essay writing by offering suggestions and feedback.',
          type: 'chatbot',
          topicId: 'prompting-basics',
          studentAlias: 'TechExplorer',
          gradeBand: 'middle',
          publishedAt: new Date('2024-01-20'),
          likes: 24,
          tags: ['education', 'homework', 'study'],
          isApproved: true,
          approvedBy: 'admin@aistarter.school',
          approvedAt: new Date('2024-01-21')
        },
        {
          id: 'pub-2',
          title: 'Fantasy World Generator',
          description: 'AI-powered tool that creates detailed fantasy worlds for creative writing and storytelling.',
          content: 'Using advanced prompting techniques, this tool generates rich fantasy settings complete with geography, cultures, and histories. Students can input basic parameters like climate and civilization type, and the AI creates comprehensive world-building details perfect for stories, games, or creative projects.',
          type: 'writing',
          topicId: 'ai-art',
          studentAlias: 'StoryWeaver',
          gradeBand: 'high',
          publishedAt: new Date('2024-01-18'),
          likes: 31,
          tags: ['creative writing', 'fantasy', 'world building'],
          isApproved: true,
          approvedBy: 'teacher@aistarter.school',
          approvedAt: new Date('2024-01-19')
        },
        {
          id: 'pub-3',
          title: 'Math Problem Visualizer',
          description: 'Creates visual representations and step-by-step solutions for complex math problems.',
          content: 'This productivity tool helps students understand mathematical concepts by generating visual aids and detailed explanations. It can break down algebra problems, geometry concepts, and calculus into digestible steps with helpful analogies.',
          type: 'productivity',
          topicId: 'ai-for-school',
          studentAlias: 'MathWiz',
          gradeBand: 'high',
          publishedAt: new Date('2024-01-15'),
          likes: 18,
          tags: ['mathematics', 'visualization', 'education'],
          isApproved: true,
          approvedBy: 'admin@aistarter.school',
          approvedAt: new Date('2024-01-16')
        },
        {
          id: 'pub-4',
          title: 'Creative Art Prompt Generator',
          description: 'Generates detailed prompts for AI art tools with style and composition suggestions.',
          content: 'This tool helps students create better AI-generated artwork by providing detailed, well-structured prompts. It includes guidance on artistic styles, color palettes, composition techniques, and lighting effects to achieve professional-looking results.',
          type: 'image-gen',
          topicId: 'ai-art',
          studentAlias: 'DigitalArtist',
          gradeBand: 'middle',
          publishedAt: new Date('2024-01-12'),
          likes: 27,
          tags: ['art', 'creativity', 'prompting'],
          isApproved: true,
          approvedBy: 'teacher@aistarter.school',
          approvedAt: new Date('2024-01-13')
        }
      ];

      setProjects(mockProjects);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load public projects:', error);
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects.filter(project => project.isApproved);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (topicFilter !== 'all') {
      filtered = filtered.filter(project => project.topicId === topicFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(project => project.type === typeFilter);
    }

    if (gradeBandFilter !== 'all') {
      filtered = filtered.filter(project => project.gradeBand === gradeBandFilter);
    }

    // Sort by likes (most popular first)
    filtered.sort((a, b) => b.likes - a.likes);

    setFilteredProjects(filtered);
  };

  const likeProject = async (projectId: string) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? { ...project, likes: project.likes + 1 }
        : project
    ));
  };

  const viewProject = (project: PublicProject) => {
    setSelectedProject(project);
    setIsViewDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center">
            <Sparkles className="h-10 w-10 mr-3 text-primary" />
            Student Gallery
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Discover amazing AI projects created by students. Get inspired and see what's possible with artificial intelligence!
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Projects</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by title, description, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Topic</label>
                <Select value={topicFilter} onValueChange={setTopicFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    {CURRICULUM_TOPICS.map(topic => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.icon} {topic.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Project Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(PROJECT_TYPES).map(([key, type]) => (
                      <SelectItem key={key} value={key}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Grade Level</label>
                <Select value={gradeBandFilter} onValueChange={setGradeBandFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value="middle">Grades 6-8</SelectItem>
                    <SelectItem value="high">Grades 9-12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{filteredProjects.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Projects</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">
                {filteredProjects.reduce((sum, project) => sum + project.likes, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Likes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">
                {new Set(filteredProjects.map(p => p.studentAlias)).size}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Contributors</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary">
                {new Set(filteredProjects.map(p => p.topicId)).size}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Topics</div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No projects found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your filters or search terms to find more projects.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const projectType = PROJECT_TYPES[project.type];
              const topic = CURRICULUM_TOPICS.find(t => t.id === project.topicId);

              return (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${projectType.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                          {projectType.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{projectType.label}</Badge>
                            {topic && (
                              <Badge variant="secondary">{topic.icon} {topic.title}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <CardDescription className="mb-4 line-clamp-3">
                      {project.description}
                    </CardDescription>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center space-x-2">
                        <span>by {project.studentAlias}</span>
                        <Badge variant="outline" className="text-xs">
                          {project.gradeBand === 'middle' ? 'Grades 6-8' : 'Grades 9-12'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{project.publishedAt.toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewProject(project)}
                        className="flex-1 mr-2"
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        View Project
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => likeProject(project.id)}
                        className="flex items-center space-x-1"
                      >
                        <Heart className="h-4 w-4" />
                        <span>{project.likes}</span>
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
          <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
            {selectedProject && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <div className={`w-8 h-8 ${PROJECT_TYPES[selectedProject.type].color} rounded-lg flex items-center justify-center text-white text-sm`}>
                      {PROJECT_TYPES[selectedProject.type].icon}
                    </div>
                    <span>{selectedProject.title}</span>
                  </DialogTitle>
                  <DialogDescription>
                    Created by {selectedProject.studentAlias} • {selectedProject.publishedAt.toLocaleDateString()}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{PROJECT_TYPES[selectedProject.type].label}</Badge>
                    {selectedProject.topicId && (
                      <Badge variant="secondary">
                        {CURRICULUM_TOPICS.find(t => t.id === selectedProject.topicId)?.icon}{' '}
                        {CURRICULUM_TOPICS.find(t => t.id === selectedProject.topicId)?.title}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {selectedProject.gradeBand === 'middle' ? 'Grades 6-8' : 'Grades 9-12'}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Description</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedProject.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Project Details</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedProject.content}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>Created by {selectedProject.studentAlias}</span>
                      <span>Published {selectedProject.publishedAt.toLocaleDateString()}</span>
                    </div>
                    <Button
                      onClick={() => likeProject(selectedProject.id)}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <Heart className="h-4 w-4" />
                      <span>{selectedProject.likes} likes</span>
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