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
- For Grade 9-12 lessons: Include case studies, ethical dilemmas, advanced techniques, and industry applications

${memoryContext ? `\n🧠 STUDENT CONTEXT:\n${memoryContext}\n\nUse this context to personalize your teaching approach, reference past lessons, and adapt your explanations to this student's learning style and experience level.` : ''}

Your goal: build real AI fluency. Stay in teacher mode. Don't break character.

Teaching style for ${gradeRange}:
${gradeBand === 'middle' 
  ? '- Use simple, clear language appropriate for ages 11-14\n- Focus on practical examples and games\n- Keep lessons interactive and fun with frequent engagement\n- Use analogies kids can understand (like comparing AI to a helpful robot friend)\n- Include hands-on activities and creative projects\n- Emphasize safety and basic digital citizenship'
  : '- Use sophisticated vocabulary appropriate for ages 14-18\n- Include technical concepts and industry terminology\n- Focus on real-world case studies: AI in finance (algorithmic trading), healthcare (diagnostic AI), criminal justice (sentencing algorithms)\n- Discuss advanced topics like machine learning bias, neural network architectures, and algorithmic accountability\n- Prepare students for college-level computer science and AI ethics courses\n- Cover complex ethical dilemmas: surveillance vs. personalization, automation vs. employment, privacy vs. security\n- Include advanced prompt engineering: instruction chaining, creative constraints, input sensitivity testing\n- Add scenario-based questions and group projects\n- Connect to current events and regulatory frameworks (EU AI Act, algorithmic auditing)'
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
          
          GRADE-SPECIFIC ADAPTATIONS:
          ${gradeBand === 'middle' ? `
          For Grades 6-8:
          - Use simple, encouraging language
          - Focus on fun, creative examples
          - Include step-by-step visual guides
          - Emphasize creativity over technical precision
          ` : `
          For Grades 9-12:
          - Include technical terminology
          - Discuss image generation algorithms
          - Cover advanced prompt engineering techniques
          - Connect to graphic design and digital art careers
          `}
          ` : `
          Make this lesson progressive - building on previous lessons if step > 1.
          Include a hands-on task and a practical prompt example.
          Keep language and complexity appropriate for grades ${gradeRange}.
          
          GRADE-SPECIFIC ADAPTATIONS:
          ${gradeBand === 'middle' ? `
          For Grades 6-8:
          - Use simpler vocabulary and concepts
          - Include more interactive elements and games
          - Focus on practical applications they can relate to
          - Use analogies to everyday objects
          ` : `
          For Grades 9-12 ADVANCED CONTENT:
          - Include complex real-world case studies (hiring bias, finance algorithms, healthcare AI)
          - Add scenario-based ethical dilemmas with decision trees
          - Cover industry applications and career pathways
          - Include advanced prompt engineering techniques (chaining, constraints, sensitivity analysis)
          - Discuss surveillance vs. personalization in education technology
          - Add group project ideas and collaborative problem-solving
          - Include coding concepts, algorithmic thinking, and technical implementation
          - Cover legal and regulatory implications (GDPR, AI Act, algorithmic accountability)
          `}
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
        description: gradeBand === 'high' 
          ? "Master advanced AI art generation using DALL-E and Midjourney with sophisticated prompt engineering and style analysis"
          : "Learn to create digital artwork using DALL-E and DeepArt tools with effective prompting techniques",
        task: gradeBand === 'high'
          ? "Create a portfolio of AI artwork demonstrating advanced techniques: style transfer, prompt chaining, and comparative analysis of different AI art platforms"
          : "Create your first piece of digital artwork using AI tools and experiment with prompt refinement techniques",
        promptSuggestion: gradeBand === 'high'
          ? "Create a series: 'Cyberpunk cityscape in the style of Van Gogh', then modify with constraints like 'limited color palette' and 'architectural focus'"
          : "A cat wearing a wizard hat casting spells in a library"
      };
    }

    // Enhanced content for Grade 9-12 advanced topics
    if (gradeBand === 'high') {
      if (topicId === 'ethics' && stepNumber === 1) {
        return {
          title: "AI Ethics and Algorithmic Bias",
          description: "Examine real-world cases of AI bias in hiring, criminal justice, and healthcare. Analyze ethical frameworks for AI development.",
          task: "Research and present a case study on algorithmic bias (e.g., COMPAS recidivism algorithm, Amazon hiring AI). Propose solutions.",
          promptSuggestion: "Design an ethical framework for an AI hiring system. What safeguards would prevent discrimination?"
        };
      }
      
      if (topicId === 'automation' && stepNumber === 1) {
        return {
          title: "Advanced AI Automation Systems",
          description: "Analyze complex automation implementations in healthcare, manufacturing, and financial services. Examine economic and social impacts.",
          task: "Design an automation strategy for a real organization. Consider implementation challenges, job displacement, and efficiency gains.",
          promptSuggestion: "How would you automate hospital patient flow while maintaining human oversight and ethical standards?"
        };
      }
      
      if (topicId === 'ai-for-school' && stepNumber === 1) {
        return {
          title: "Educational AI: Personalization vs. Surveillance",
          description: "Explore adaptive learning systems, proctoring AI, and student data privacy. Balance personalization with ethical concerns.",
          task: "Debate: Should schools use AI to monitor student attention and behavior? Present arguments for both sides.",
          promptSuggestion: "Design an AI tutoring system that personalizes learning without violating student privacy."
        };
      }
      
      if (topicId === 'prompting-basics' && stepNumber === 1) {
        return {
          title: "Advanced Prompt Engineering",
          description: "Master instruction chaining, creative constraints, input sensitivity, and prompt optimization techniques for complex tasks.",
          task: "Create a prompt chain that solves a multi-step problem (e.g., business analysis, creative writing, code debugging).",
          promptSuggestion: "Design a prompt sequence: 1) Analyze market data, 2) Identify trends, 3) Generate strategic recommendations with risk assessment."
        };
      }
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