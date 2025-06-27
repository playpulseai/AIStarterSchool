import { BookOpen, Palette, Cog, Shield, Brain } from 'lucide-react';

export default function CurriculumOverview() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            🎓 AIStarter School Curriculum
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            AIStarter School is dedicated to teaching middle and high school students how to understand, use, and think critically about artificial intelligence. Our curriculum is divided into five core subject areas, designed to grow both technical skill and ethical awareness.
          </p>
        </div>

        {/* Subject Areas */}
        <div className="space-y-12">
          {/* 1. Prompt Engineering */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <BookOpen className="h-8 w-8 text-blue-600 mr-4" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                📘 1. Prompt Engineering
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Students learn how to craft effective prompts to guide AI behavior. From basic question phrasing to advanced chaining, students build strong communication skills with AI tools.
            </p>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Key topics:</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
                  What is a prompt?
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
                  Specificity and clarity
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
                  Role-based prompting
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
                  Instruction chaining
                </li>
              </ul>
            </div>
          </div>

          {/* 2. AI Art and Creativity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Palette className="h-8 w-8 text-purple-600 mr-4" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                🎨 2. AI Art and Creativity
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Using tools like DALL·E and DeepArt, students explore how AI can generate visual content. Lessons focus on visual storytelling, creative prompting, and style experimentation.
            </p>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Key topics:</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3"></span>
                  Visual prompt design
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3"></span>
                  Style transfer and AI art history
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3"></span>
                  Generating portfolio-worthy images
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3"></span>
                  Responsible use of AI-generated content
                </li>
              </ul>
            </div>
          </div>

          {/* 3. Automation and AI Tools for Life */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Cog className="h-8 w-8 text-green-600 mr-4" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                🛠️ 3. Automation and AI Tools for Life
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Students learn how AI can support productivity, automate tasks, and assist in daily life. This includes voice assistants, planning tools, and custom AI workflows.
            </p>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Key topics:</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></span>
                  Automation in school and home
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></span>
                  How recommendation systems work
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></span>
                  AI for note-taking, reminders, and scheduling
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></span>
                  Creating your own basic automation with no-code tools
                </li>
              </ul>
            </div>
          </div>

          {/* 4. AI Ethics and Responsible Use */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Shield className="h-8 w-8 text-red-600 mr-4" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                🏛️ 4. AI Ethics and Responsible Use
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Students critically examine how AI systems can be biased, unfair, or misused — and how to prevent it. High school students explore real-world ethical cases.
            </p>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Key topics:</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3"></span>
                  Algorithmic bias
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3"></span>
                  Fairness and transparency
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3"></span>
                  Privacy in AI systems
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3"></span>
                  Real-world cases (e.g., COMPAS, hiring tools)
                </li>
              </ul>
            </div>
          </div>

          {/* 5. Real-World AI Applications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Brain className="h-8 w-8 text-indigo-600 mr-4" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                🧠 5. Real-World AI Applications
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Older students (Grades 9–12) explore how AI is used across industries, from medicine to music. They learn to analyze, critique, and even design small AI-powered systems.
            </p>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Key topics:</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3"></span>
                  AI in healthcare, finance, education, logistics
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3"></span>
                  Case study analysis
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3"></span>
                  Hands-on projects to apply concepts
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3"></span>
                  Career exploration in AI
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Learning Paths Section */}
        <div className="mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-6">🔒 Learning Paths</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Grades 6–8:</h3>
                <p className="text-blue-100">
                  Foundational understanding, creative exploration, safe experimentation
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Grades 9–12:</h3>
                <p className="text-blue-100">
                  Technical depth, real-world application, ethical reasoning
                </p>
              </div>
            </div>
            <div className="mt-8 p-4 bg-white/10 rounded-lg">
              <p className="text-blue-100">
                Each path is powered by voice-ready AI agents, memory tracking, and fully interactive lessons.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-amber-100 dark:bg-amber-900 rounded-full">
            <span className="text-amber-800 dark:text-amber-200 font-medium">
              📍 Curriculum updated quarterly to stay aligned with industry trends and evolving AI capabilities.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}