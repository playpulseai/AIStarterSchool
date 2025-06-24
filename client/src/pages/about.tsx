import { Users, Lightbulb, Scale, Check, Percent, Brain, Rocket } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-white dark:bg-background py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">About AIStarter School</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Pioneering the future of education through artificial intelligence and personalized learning experiences.
          </p>
        </div>
        
        {/* Section 1: What is AIStarter School? */}
        <div className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">What is AIStarter School?</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                AIStarter School is a revolutionary educational platform that harnesses the power of artificial intelligence to create personalized learning experiences for students in grades 6-12. Our autonomous AI teacher agents adapt to each student's learning style, pace, and interests.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Unlike traditional schools, we operate 24/7, providing continuous learning opportunities with real-time feedback, interactive projects, and comprehensive AI education that prepares students for tomorrow's technology-driven world.
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Fully autonomous AI-powered learning platform</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-robot text-white text-2xl"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">AI Teachers</h3>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-microphone text-white text-2xl"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Voice Learning</h3>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-chart-line text-white text-2xl"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Real-time Feedback</h3>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-shield-alt text-white text-2xl"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Guardian AI</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Section 2: Why AI fluency matters */}
        <div className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Future Job Market</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Percent className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300"><strong>85%</strong> of jobs in 2030 don't exist today</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300"><strong>AI literacy</strong> will be as important as reading</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Rocket className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300"><strong>2x higher</strong> earning potential with AI skills</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Why AI Fluency Matters</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                We're living through the greatest technological transformation in human history. Artificial Intelligence is reshaping every industry, from healthcare and finance to entertainment and education.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Students who understand AI today will be the leaders, innovators, and problem-solvers of tomorrow. They'll have the tools to create solutions we can't even imagine yet, and the confidence to navigate an AI-powered world.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                AI fluency isn't just about coding—it's about understanding how to collaborate with AI, think critically about its applications, and use it ethically to solve real-world problems.
              </p>
            </div>
          </div>
        </div>
        
        {/* Section 3: Our mission */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
              To democratize AI education and empower the next generation with the knowledge, skills, and ethical foundation they need to thrive in an AI-driven world.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 primary-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Accessible Education</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Making high-quality AI education available to students everywhere, regardless of location or background.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Innovation Focus</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Fostering creativity, critical thinking, and innovative problem-solving through hands-on AI projects.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-accent to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Scale className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Ethical Foundation</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Teaching responsible AI development and usage with strong emphasis on ethics and social impact.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
