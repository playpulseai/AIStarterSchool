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
  memoryContext?: string;
  studentMemory?: {
    lastLessonTopic?: string;
    missedTestConcepts?: string[];
    preferredLearningStyle?: string;
    strengthAreas?: string[];
    weaknessAreas?: string[];
    interactionPatterns?: {
      asksForExamples: boolean;
      needsEncouragement: boolean;
      prefersStepByStep: boolean;
    };
  };
}

export interface AITeacherResponse {
  response: string;
  lessonComplete: boolean;
  nextStep?: number;
}

// Autonomous AI Teacher System Prompt
function getSystemPrompt(gradeBand: 'middle' | 'high', memoryContext?: string): string {
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
2. Break lessons into clear steps (Step 1, Step 2, etc.)
3. Ask student to try a task after each step
4. Wait for response → give detailed feedback
5. Check if prompt is vague - suggest improvements
6. Include comprehension checks and mini-quizzes
7. For AI Art lessons: guide students through DALL-E/DeepArt workflow with hands-on creation
8. Adapt based on student's responses and provide specific feedback on their artwork

🔒 Rules:
- Only respond to age-appropriate questions for grades ${gradeRange}
- Redirect inappropriate input: "Let's stay focused on AI learning."
- All interactions monitored by background agents
- Log all sessions, prompts, and test attempts
- If student gives vague prompts (under 20 chars), respond: "That's too vague. Try adding more details like [specific example]."
- Include comprehension checks: "Can you explain back to me what we just learned?"
- End lessons with quiz questions to test understanding
- For AI Art Lesson 2: Include DALL-E/DeepArt tutorial, prompt refinement exercises, and 3 quiz questions

${memoryContext ? `\n🧠 STUDENT CONTEXT:\n${memoryContext}\n\nUse this context to personalize your teaching approach, reference past lessons, and adapt your explanations to this student's learning style and experience level.` : ''}

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
      { role: 'system', content: getSystemPrompt(request.gradeBand, request.memoryContext) },
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

export async function generateCurriculumLesson(topicId: string, topicTitle: string, stepNumber: number, gradeBand: 'middle' | 'high', totalSteps: number): Promise<{
  title: string;
  description: string;
  task: string;
  promptSuggestion: string;
}> {
  const gradeRange = gradeBand === 'middle' ? '6-8' : '9-12';

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert curriculum designer creating AI education content for grades ${gradeRange}. 
          Create structured, progressive lessons that build upon each other.
          
          Response format (JSON):
          {
            "title": "Lesson title",
            "description": "Brief lesson description",
            "task": "Specific task for students to complete",
            "promptSuggestion": "Example AI prompt for students to try"
          }`
        },
        {
          role: 'user',
          content: `Create lesson ${stepNumber} of ${totalSteps} for the topic "${topicTitle}".
          
          Topic: ${topicTitle}
          Step: ${stepNumber}/${totalSteps}
          Grade level: ${gradeRange}
          
          ${topicId === 'ai-art' && stepNumber === 2 ? `
          SPECIAL REQUIREMENT - Create "Creating Your First AI Artwork" lesson with this exact content structure:
          
          Title: "Creating Your First AI Artwork"
          Description: "Learn to create digital artwork using DALL-E and DeepArt tools with effective prompting techniques"
          Task: "Create your first piece of digital artwork using AI tools and experiment with prompt refinement techniques"
          Prompt Suggestion: "A cat wearing a wizard hat casting spells in a library"
          
          The AI teacher should guide students through:
          1. Choosing between DALL-E or DeepArt
          2. Writing descriptive prompts (example: "A cat wearing a wizard hat casting spells in a library")
          3. Experimenting with styles (Van Gogh, Picasso for DeepArt)
          4. Refining prompts (vague vs detailed: "A mountain" vs "A snow-capped mountain under a starry night sky with a glowing moon")
          5. Comprehension check: "How does changing prompt details change the AI-generated image?"
          6. End with 3 quiz questions: 
             - What are AI art tools used for?
             - How can you make prompts more effective for detailed images?
             - What did you learn about how AI interprets prompts?
          ` : `
          Make this lesson progressive - building on previous lessons if step > 1.
          Include a hands-on task and a practical prompt example.
          Keep language appropriate for grades ${gradeRange}.
          `}`
        }
      ],
      max_tokens: 400,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    
    // Special override for AI Art Lesson 2
    if (topicId === 'ai-art' && stepNumber === 2) {
      return {
        title: "Creating Your First AI Artwork",
        description: "Learn to create digital artwork using DALL-E and DeepArt tools with effective prompting techniques",
        task: "Create your first piece of digital artwork using AI tools and experiment with prompt refinement techniques",
        promptSuggestion: "A cat wearing a wizard hat casting spells in a library"
      };
    }
    
    return {
      title: result.title || `${topicTitle} - Lesson ${stepNumber}`,
      description: result.description || `Learn about ${topicTitle.toLowerCase()}`,
      task: result.task || `Complete the interactive lesson on ${topicTitle.toLowerCase()}`,
      promptSuggestion: result.promptSuggestion || 'Try creating a prompt related to this lesson topic'
    };
  } catch (error) {
    console.error('Failed to generate curriculum lesson:', error);
    
    // Special fallback for AI Art Lesson 2
    if (topicId === 'ai-art' && stepNumber === 2) {
      return {
        title: "Creating Your First AI Artwork",
        description: "Learn to create digital artwork using DALL-E and DeepArt tools with effective prompting techniques",
        task: "Create your first piece of digital artwork using AI tools and experiment with prompt refinement techniques",
        promptSuggestion: "A cat wearing a wizard hat casting spells in a library"
      };
    }
    
    return {
      title: `${topicTitle} - Lesson ${stepNumber}`,
      description: `Learn about ${topicTitle.toLowerCase()}`,
      task: `Complete the interactive lesson on ${topicTitle.toLowerCase()}`,
      promptSuggestion: 'Try creating a prompt related to this lesson topic'
    };
  }
}

export async function generateTest(topicId: string, gradeBand: 'middle' | 'high', questionCount: number): Promise<{ questions: any[] }> {
  const gradeRange = gradeBand === 'middle' ? '6-8' : '9-12';
  
  const topicTitles: Record<string, string> = {
    'prompting-basics': 'Prompting Basics',
    'ai-art': 'AI Art Creation',
    'ai-for-school': 'AI for School',
    'automation': 'AI Automation',
    'ethics': 'AI Ethics'
  };

  const topicTitle = topicTitles[topicId] || 'AI Fundamentals';

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert test creator for AI education. Create ${questionCount} multiple choice questions for grades ${gradeRange}.
          
          Each question should test practical understanding, not memorization.
          Include real-world scenarios and applications.
          
          Response format (JSON):
          {
            "questions": [
              {
                "id": "unique_id",
                "question": "Question text",
                "type": "multiple_choice",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": 0,
                "explanation": "Why this answer is correct"
              }
            ]
          }`
        },
        {
          role: 'user',
          content: `Create ${questionCount} test questions for "${topicTitle}" suitable for grades ${gradeRange}.
          
          Focus on practical application and understanding.
          Make questions relevant to real-world AI usage.
          Ensure explanations help students learn from mistakes.`
        }
      ],
      max_tokens: 800,
      temperature: 0.6,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{"questions": []}');
    
    // Add topicId and gradeBand to each question
    const questions = result.questions.map((q: any, index: number) => ({
      ...q,
      id: q.id || `${topicId}-q${index + 1}`,
      topicId,
      gradeBand: 'both'
    }));

    return { questions };
  } catch (error) {
    console.error('Failed to generate test:', error);
    return { questions: [] };
  }
}