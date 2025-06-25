import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  BookOpen, 
  MessageSquare, 
  Wand2, 
  Download, 
  Copy, 
  Save, 
  RefreshCw,
  Sparkles,
  FileText,
  Bot
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SessionLogger, getUserId } from '@/lib/safety-agents';

interface PlaygroundProject {
  id: string;
  userId: string;
  title: string;
  toolType: 'logo' | 'story' | 'chatbot';
  outputText: string;
  imageUrl?: string;
  prompt: string;
  createdAt: Date;
  status: 'completed' | 'in-progress';
}

export default function Playground() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeToolDialog, setActiveToolDialog] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projects, setProjects] = useState<PlaygroundProject[]>([]);
  
  // Tool states
  const [logoPrompt, setLogoPrompt] = useState('');
  const [logoOutput, setLogoOutput] = useState('');
  const [storyPrompt, setStoryPrompt] = useState('');
  const [storyOutput, setStoryOutput] = useState('');
  const [chatbotPrompt, setChatbotPrompt] = useState('');
  const [chatbotOutput, setChatbotOutput] = useState('');

  useEffect(() => {
    if (user) {
      loadPlaygroundProjects();
    }
  }, [user]);

  const loadPlaygroundProjects = async () => {
    try {
      // In demo mode, load mock projects
      const mockProjects: PlaygroundProject[] = [
        {
          id: 'pg-1',
          userId: getUserId(),
          title: 'Tech Startup Logo',
          toolType: 'logo',
          outputText: 'A modern, minimalist logo design featuring a stylized "T" in blue gradient with clean typography. The design emphasizes innovation and reliability, perfect for a tech startup.',
          prompt: 'Design a logo for a tech startup called "TechFlow" that builds productivity apps',
          createdAt: new Date('2024-01-15'),
          status: 'completed'
        }
      ];
      setProjects(mockProjects);
    } catch (error) {
      console.error('Failed to load playground projects:', error);
    }
  };

  const generateWithAI = async (toolType: 'logo' | 'story' | 'chatbot', prompt: string) => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a prompt first.",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const userId = getUserId();
      
      // Log the creative request
      await SessionLogger.logSession({
        userId,
        gradeBand: 'middle',
        lessonStep: 0,
        action: 'prompt_submit',
        content: `Playground ${toolType}: ${prompt}`,
        timestamp: new Date()
      });

      // Call AI generation endpoint
      const response = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: getToolSystemPrompt(toolType, prompt),
          gradeBand: 'middle',
          lessonStep: 0,
          conversationHistory: []
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      const output = data.response;

      // Update appropriate state
      switch (toolType) {
        case 'logo':
          setLogoOutput(output);
          break;
        case 'story':
          setStoryOutput(output);
          break;
        case 'chatbot':
          setChatbotOutput(output);
          break;
      }

      // Log AI response
      await SessionLogger.logSession({
        userId,
        gradeBand: 'middle',
        lessonStep: 0,
        action: 'ai_response',
        content: `Generated ${toolType}: ${output.substring(0, 200)}...`,
        timestamp: new Date()
      });

      toast({
        title: "Generated!",
        description: `Your ${toolType} has been created successfully.`,
      });

    } catch (error) {
      console.error(`Failed to generate ${toolType}:`, error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Unable to generate content. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getToolSystemPrompt = (toolType: string, prompt: string): string => {
    switch (toolType) {
      case 'logo':
        return `You are a professional logo designer. Create a detailed written description of a logo design based on this request: "${prompt}". Include colors, shapes, typography style, and the overall aesthetic. Be specific and creative but keep it appropriate for students.`;
      
      case 'story':
        return `You are a creative writing assistant. Write an engaging, age-appropriate short story (300-500 words) based on this prompt: "${prompt}". Make it creative, fun, and suitable for middle/high school students.`;
      
      case 'chatbot':
        return `You are helping design a chatbot. Based on this request: "${prompt}", provide a detailed description of the chatbot including its personality, main functions, sample conversation starters, and how it would interact with users. Keep it educational and appropriate.`;
      
      default:
        return `Help the user with their creative request: "${prompt}"`;
    }
  };

  const saveToPortfolio = async (toolType: 'logo' | 'story' | 'chatbot', prompt: string, output: string) => {
    if (!output) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No content to save.",
      });
      return;
    }

    try {
      const newProject: PlaygroundProject = {
        id: `pg-${Date.now()}`,
        userId: getUserId(),
        title: `${toolType.charAt(0).toUpperCase() + toolType.slice(1)} Project ${projects.length + 1}`,
        toolType,
        outputText: output,
        prompt,
        createdAt: new Date(),
        status: 'completed'
      };

      setProjects(prev => [newProject, ...prev]);

      toast({
        title: "Saved!",
        description: "Project saved to your portfolio.",
      });

      // Log save action
      const userId = getUserId();
      await SessionLogger.logSession({
        userId,
        gradeBand: 'middle',
        lessonStep: 0,
        action: 'prompt_submit',
        content: `Saved playground project: ${toolType}`,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Failed to save project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save project.",
      });
    }
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy content.",
      });
    }
  };

  const exportAsText = (title: string, content: string) => {
    const exportText = `${title}\n\nGenerated by AIStarter School Playground\nDate: ${new Date().toLocaleDateString()}\n\n${content}`;
    
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported!",
      description: "File downloaded successfully.",
    });
  };

  const resetTool = (toolType: 'logo' | 'story' | 'chatbot') => {
    switch (toolType) {
      case 'logo':
        setLogoPrompt('');
        setLogoOutput('');
        break;
      case 'story':
        setStoryPrompt('');
        setStoryOutput('');
        break;
      case 'chatbot':
        setChatbotPrompt('');
        setChatbotOutput('');
        break;
    }
  };

  const openTool = (toolType: string) => {
    setActiveToolDialog(toolType);
    resetTool(toolType as 'logo' | 'story' | 'chatbot');
  };

  const tools = [
    {
      id: 'logo',
      title: 'Logo Design Assistant',
      description: 'Create unique logo concepts and branding ideas',
      icon: Palette,
      color: 'bg-purple-500',
      examples: ['Tech startup logo', 'Sports team emblem', 'Eco-friendly brand']
    },
    {
      id: 'story',
      title: 'Creative Story Generator',
      description: 'Write engaging stories and creative narratives',
      icon: BookOpen,
      color: 'bg-green-500',
      examples: ['Space adventure', 'Mystery detective', 'Fantasy quest']
    },
    {
      id: 'chatbot',
      title: 'AI Chatbot Builder',
      description: 'Design conversational AI assistants and bots',
      icon: MessageSquare,
      color: 'bg-blue-500',
      examples: ['Study helper bot', 'Pet care advisor', 'Recipe assistant']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI Playground
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore creative AI tools and build amazing projects. No limits, just pure creativity!
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {tools.map((tool) => (
            <Card key={tool.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 ${tool.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <tool.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">{tool.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {tool.description}
                </p>
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Examples:</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {tool.examples.map((example, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={() => openTool(tool.id)} 
                  className="w-full"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Try It Out
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Projects */}
        {projects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                Recent Playground Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.slice(0, 6).map((project) => (
                  <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{project.toolType}</Badge>
                      <span className="text-xs text-gray-500">
                        {project.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-medium mb-2">{project.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {project.outputText.substring(0, 100)}...
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tool Dialogs */}
        {tools.map((tool) => (
          <Dialog 
            key={`dialog-${tool.id}`} 
            open={activeToolDialog === tool.id} 
            onOpenChange={(open) => !open && setActiveToolDialog(null)}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <tool.icon className="w-6 h-6 mr-2" />
                  {tool.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Input Section */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Describe your {tool.id} idea:
                  </label>
                  <Textarea
                    value={tool.id === 'logo' ? logoPrompt : tool.id === 'story' ? storyPrompt : chatbotPrompt}
                    onChange={(e) => {
                      if (tool.id === 'logo') setLogoPrompt(e.target.value);
                      else if (tool.id === 'story') setStoryPrompt(e.target.value);
                      else setChatbotPrompt(e.target.value);
                    }}
                    placeholder={`Example: ${tool.examples[0]}`}
                    rows={3}
                    className="w-full"
                  />
                </div>

                {/* Generate Button */}
                <Button 
                  onClick={() => generateWithAI(
                    tool.id as 'logo' | 'story' | 'chatbot',
                    tool.id === 'logo' ? logoPrompt : tool.id === 'story' ? storyPrompt : chatbotPrompt
                  )}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>

                {/* Output Section */}
                {(tool.id === 'logo' ? logoOutput : tool.id === 'story' ? storyOutput : chatbotOutput) && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Generated Result:</h4>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
                        <p className="whitespace-pre-wrap">
                          {tool.id === 'logo' ? logoOutput : tool.id === 'story' ? storyOutput : chatbotOutput}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => saveToPortfolio(
                          tool.id as 'logo' | 'story' | 'chatbot',
                          tool.id === 'logo' ? logoPrompt : tool.id === 'story' ? storyPrompt : chatbotPrompt,
                          tool.id === 'logo' ? logoOutput : tool.id === 'story' ? storyOutput : chatbotOutput
                        )}
                        variant="default"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save to Portfolio
                      </Button>
                      <Button 
                        onClick={() => copyToClipboard(
                          tool.id === 'logo' ? logoOutput : tool.id === 'story' ? storyOutput : chatbotOutput
                        )}
                        variant="outline"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button 
                        onClick={() => exportAsText(
                          `${tool.title} Project`,
                          tool.id === 'logo' ? logoOutput : tool.id === 'story' ? storyOutput : chatbotOutput
                        )}
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <Button 
                        onClick={() => generateWithAI(
                          tool.id as 'logo' | 'story' | 'chatbot',
                          tool.id === 'logo' ? logoPrompt : tool.id === 'story' ? storyPrompt : chatbotPrompt
                        )}
                        variant="outline"
                        disabled={isGenerating}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}