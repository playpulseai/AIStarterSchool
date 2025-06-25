import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Bot, Mic, TrendingUp, FolderOpen, Shield, Award, Check, ArrowRight } from 'lucide-react';
import { AccessCodeModal } from '@/components/access-code-modal';

export default function Features() {
  const [accessCodeModalOpen, setAccessCodeModalOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const features = [
    {
      icon: <Bot className="h-8 w-8 text-white" />,
      title: "Autonomous AI Teacher Agents",
      description: "Our AI teachers adapt to each student's learning style and pace. Separate specialized agents for grades 6-8 and 9-12 ensure age-appropriate content and complexity.",
      benefits: [
        "Personalized learning paths",
        "Adaptive difficulty scaling",
        "24/7 availability"
      ],
      gradient: "from-primary to-blue-600"
    },
    {
      icon: <Mic className="h-8 w-8 text-white" />,
      title: "Voice-Powered Lessons",
      description: "Natural conversation-based learning that feels like talking with a knowledgeable friend. Students can ask questions and get instant, detailed explanations.",
      benefits: [
        "Natural language interaction",
        "Instant question responses",
        "Multi-language support"
      ],
      gradient: "from-secondary to-purple-600"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-white" />,
      title: "Real-Time Feedback & Tests",
      description: "Instant feedback on every interaction helps students learn from mistakes immediately. Adaptive testing ensures optimal challenge levels.",
      benefits: [
        "Immediate error correction",
        "Progress tracking",
        "Personalized assessments"
      ],
      gradient: "from-accent to-yellow-600"
    },
    {
      icon: <FolderOpen className="h-8 w-8 text-white" />,
      title: "AI Project Portfolio",
      description: "Build real AI projects that showcase your skills. From chatbots to image recognition, create a portfolio that impresses colleges and employers.",
      benefits: [
        "Hands-on AI projects",
        "Portfolio showcase",
        "Industry-relevant skills"
      ],
      gradient: "from-success to-green-600"
    },
    {
      icon: <Shield className="h-8 w-8 text-white" />,
      title: "Guardian AI for Safety",
      description: "Our Guardian AI ensures a safe learning environment by monitoring interactions, filtering content, and providing parental insights while protecting student privacy.",
      benefits: [
        "Content filtering",
        "Parental controls",
        "Privacy protection"
      ],
      gradient: "from-red-500 to-pink-600"
    },
    {
      icon: <Award className="h-8 w-8 text-white" />,
      title: "Badges & Achievements",
      description: "Gamified learning with meaningful badges and achievements that recognize mastery, creativity, and persistence. Celebrate every milestone!",
      benefits: [
        "Skill-based badges",
        "Progress celebrations",
        "Leaderboards"
      ],
      gradient: "from-purple-500 to-indigo-600"
    }
  ];

  return (
    <div className="bg-gray-50 dark:bg-background py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Platform Features</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Discover the cutting-edge features that make AIStarter School the most advanced AI education platform for young learners.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                {feature.description}
              </p>
              <div className="space-y-2">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <div key={benefitIndex} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="primary-gradient rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Experience the Future of Learning?</h2>
            <p className="text-xl mb-6 text-blue-100">
              Join thousands of students already mastering AI skills with our innovative platform.
            </p>
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-gray-900 font-bold py-3 px-8 text-lg"
              onClick={() => setAccessCodeModalOpen(true)}
            >
              Access Demo (2025)
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <AccessCodeModal 
        isOpen={accessCodeModalOpen} 
        onClose={() => setAccessCodeModalOpen(false)}
        onSuccess={() => setHasAccess(true)}
      />
    </div>
  );
}
