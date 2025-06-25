import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Bot, Cpu, GraduationCap } from 'lucide-react';
import { AccessCodeModal } from '@/components/access-code-modal';

export default function Home() {
  const [accessCodeModalOpen, setAccessCodeModalOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  return (
    <div>
      {/* Hero Section */}
      <div className="relative primary-gradient overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                AIStarter School
                <span className="block text-yellow-300">Where Kids Master AI</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                Autonomous AI-powered school for Grades 6–12
              </p>
              <p className="text-lg text-blue-100 mb-8 leading-relaxed max-w-lg">
                Prepare your child for the future with our cutting-edge AI education platform. Interactive lessons, personalized learning, and real-world AI projects.
              </p>
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-gray-900 font-bold py-4 px-8 text-lg"
                onClick={() => setAccessCodeModalOpen(true)}
              >
                Access Demo (2025)
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <div className="hidden lg:block">
              <div className="relative">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-4 flex items-center justify-center">
                      <Brain className="h-8 w-8 text-yellow-300" />
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4 flex items-center justify-center">
                      <Bot className="h-8 w-8 text-green-300" />
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4 flex items-center justify-center">
                      <Cpu className="h-8 w-8 text-purple-300" />
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4 flex items-center justify-center">
                      <GraduationCap className="h-8 w-8 text-blue-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="bg-white dark:bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-gray-600 dark:text-gray-400">Students Enrolled</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-400">AI Learning Support</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">95%</div>
              <div className="text-gray-600 dark:text-gray-400">Student Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-success mb-2">50+</div>
              <div className="text-gray-600 dark:text-gray-400">AI Projects Completed</div>
            </div>
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
