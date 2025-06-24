import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

export interface AITeacherRequest {
  message: string;
  gradeBand: 'middle' | 'high';
  lessonStep: number;
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>;
}

export interface AITeacherResponse {
  response: string;
  lessonComplete: boolean;
  nextStep?: number;
}

// Autonomous AI Teacher System Prompt
function getSystemPrompt(gradeBand: 'middle' | 'high'): string {
  const gradeRange = gradeBand === 'middle' ? '6-8' : '9-12';
  
  return `You are an Autonomous AI Teacher developed by AIStarter School.

Your mission is to teach students (Grades ${gradeRange}) how to use artificial intelligence in everyday life. You operate completely independently: delivering voice lessons, asking questions, evaluating input, and progressing students through lessons.

🧠 Focus Areas:
- Prompting basics
- AI writing, storytelling
- AI image generation
- AI productivity tools
- Ethics and responsibility

🎓 Teaching Format:
1. Greet the student: "Hi, I'm your AI teacher for today…"
2. Deliver 5-step lesson
3. Ask student to try a task
4. Wait for response → give feedback
5. Repeat or advance

🔒 Rules:
- Only respond to age-appropriate questions for grades ${gradeRange}
- Redirect inappropriate input: "Let's stay focused on AI learning."
- All interactions monitored by background agents
- Log all sessions, prompts, and test attempts

Your goal: build real AI fluency. Stay in teacher mode. Don't break character.

Teaching style for ${gradeRange}:
${gradeBand === 'middle' 
  ? '- Use simple, clear language\n- Focus on practical examples\n- Keep lessons interactive and fun\n- Use analogies kids can understand'
  : '- Use more sophisticated vocabulary\n- Include technical concepts\n- Focus on real-world applications\n- Prepare for college/career readiness'
}`;
}

export async function callAITeacher(request: AITeacherRequest): Promise<AITeacherResponse> {
  try {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: getSystemPrompt(request.gradeBand) },
      ...request.conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user', content: request.message }
    ];

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages,
      max_tokens: 800,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I had trouble generating a response. Please try again.';
    
    // Simple logic to determine if lesson is complete
    const lessonComplete = response.toLowerCase().includes('congratulations') || 
                          response.toLowerCase().includes('completed') ||
                          response.toLowerCase().includes('next lesson') ||
                          request.lessonStep >= 5;

    return {
      response,
      lessonComplete,
      nextStep: lessonComplete ? request.lessonStep + 1 : request.lessonStep
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      response: 'I apologize, but I encountered a technical issue. Please try again in a moment.',
      lessonComplete: false
    };
  }
}

export async function generateLessonContent(gradeBand: 'middle' | 'high', lessonStep: number): Promise<string> {
  const lessonTopics = [
    'Introduction to AI and Prompting Basics',
    'AI Writing and Storytelling',
    'AI Image Generation and Creative Tools',
    'AI Productivity and Everyday Applications',
    'AI Ethics and Responsible Usage'
  ];

  const topic = lessonTopics[lessonStep - 1] || 'AI Fundamentals';
  const gradeRange = gradeBand === 'middle' ? '6-8' : '9-12';

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an AI teacher creating lesson content for grades ${gradeRange}. Create engaging, age-appropriate content about ${topic}.`
        },
        {
          role: 'user',
          content: `Create a brief lesson introduction for "${topic}" suitable for students in grades ${gradeRange}. Keep it engaging and under 200 words.`
        }
      ],
      max_tokens: 300,
      temperature: 0.8
    });

    return completion.choices[0]?.message?.content || `Welcome to our lesson on ${topic}! Let's explore this fascinating topic together.`;
  } catch (error) {
    console.error('Failed to generate lesson content:', error);
    return `Welcome to our lesson on ${topic}! Let's explore this fascinating topic together.`;
  }
}