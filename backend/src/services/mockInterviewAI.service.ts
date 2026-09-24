/**
 * Mock Interview AI Service
 * Dynamic AI Question Generation & Evaluation with Anthropic API integration & Algorithmic fallback.
 */

export interface InterviewQuestion {
  id: string;
  question: string;
  skill_focus: string;
  expected_keywords: string[];
  difficulty: string;
  question_type?: 'standard' | 'situational' | 'role-specific';
  interviewer_role?: string;
  follow_up: boolean;
}

export interface AnswerEvaluation {
  score: number; // 0 - 100
  score_out_of_10?: number; // 0.0 - 10.0
  technical_knowledge: number;
  communication: number;
  problem_solving: number;
  answer_relevance: number;
  confidence: number;
  feedback: string;
  clarity_feedback?: string;
  structure_feedback?: string;
  filler_words_feedback?: string;
  strengths: string[];
  improvements: string[];
  suggested_better_answer?: string;
}

export interface SessionFeedback {
  overall_score: number;
  category_scores: {
    technical_knowledge: number;
    communication: number;
    problem_solving: number;
    answer_relevance: number;
    confidence: number;
  };
  strengths: string[];
  areas_to_improve: string[];
  recommendations: string[];
}

export interface CandidateContext {
  name: string;
  skills: string[];
  experience_years: number;
  headline?: string;
  education?: string;
  portfolio_projects?: Array<{ title: string; skills_used: string[]; description: string }>;
  badges?: Array<{ skill_name: string; level: string; score_percentage: number }>;
}

export interface JobContext {
  title: string;
  description: string;
  required_skills: Array<{ skill: string; weight?: number }>;
  preferred_skills: string[];
  experience_level: string;
  responsibilities?: string;
}

export class MockInterviewAIService {
  /**
   * Generate an opening greeting message for the interview.
   */
  static generateGreeting(role: string, type: string, difficulty: string, candidateName: string): string {
    if (type === 'Panel') {
      return `Welcome ${candidateName}! You are now meeting with our Executive Interview Panel for the ${role} position. We have our Lead Architect, Engineering Director, and Culture Lead present. We will take turns asking technical, architectural, and behavioral questions. Take your time to structure your answers. Let's begin!`;
    }
    return `Hello ${candidateName}! I'm your AI Interview Coach. We'll be conducting a ${difficulty.toLowerCase()} level ${type.toLowerCase()} interview for the ${role} position. I will ask you one question at a time and evaluate your response immediately after each answer. When you're ready, let's begin!`;
  }

  /**
   * Dynamically generate fresh, non-repeating questions via Anthropic API (or dynamic generation engine)
   */
  static async selectQuestions(
    role: string,
    type: string,
    difficulty: string,
    numQuestions: number,
    jobContext?: JobContext | null,
    candidateContext?: CandidateContext | null
  ): Promise<InterviewQuestion[]> {
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

    if (apiKey) {
      try {
        const systemPrompt = `You are a Principal Hiring Manager and Staff AI Interviewer conducting a realistic mock interview.
Target Role: "${role}"
Interview Format: ${type} (Options: Technical, Behavioral, Panel)
Experience/Difficulty Level: ${difficulty}
${jobContext ? `Job Description / Responsibilities: ${jobContext.responsibilities || jobContext.description}. Required Skills: ${jobContext.required_skills.map(s => typeof s === 'string' ? s : s.skill).join(', ')}.` : ''}
${candidateContext ? `Candidate Background: Verified Skills: ${candidateContext.skills?.join(', ')}, Experience: ${candidateContext.experience_years} years.` : ''}

Task: Generate exactly ${numQuestions} distinct, realistic, and highly relevant interview questions.
Ensure a dynamic mix of:
1. Standard / foundational concept questions
2. Realistic situational / problem-solving scenarios (e.g. system failures, performance bottlenecks, production outages, high query loads)
3. Role-specific deep-dives on modern tools, frameworks, and architecture.
Make sure questions are completely fresh and varied across sessions.

CRITICAL: Return ONLY a valid raw JSON array of objects. Do NOT include markdown code fences (\`\`\`json).
Each object schema:
{
  "id": "q-1",
  "question": "Question text here",
  "skill_focus": "Skill/Topic focus",
  "expected_keywords": ["keyword1", "keyword2", "keyword3"],
  "difficulty": "${difficulty}",
  "question_type": "standard | situational | role-specific",
  "interviewer_role": "Tech Lead | Engineering Director | Culture Partner"
}`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1800,
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: `Generate ${numQuestions} distinct ${type} interview questions for a ${difficulty} ${role}. Session timestamp seed: ${Date.now()}`
              }
            ]
          })
        });

        if (response.ok) {
          const data: any = await response.json();
          const text = data.content?.[0]?.text?.trim() || '';
          const cleaned = text.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
          const parsed = JSON.parse(cleaned);

          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.slice(0, numQuestions).map((q: any, idx: number) => ({
              id: q.id || `q-${idx + 1}`,
              question: q.question,
              skill_focus: q.skill_focus || 'Core Competency',
              expected_keywords: Array.isArray(q.expected_keywords) ? q.expected_keywords : ['architecture', 'trade-offs'],
              difficulty: q.difficulty || difficulty,
              question_type: q.question_type || 'role-specific',
              interviewer_role: q.interviewer_role || (type === 'Panel' ? (idx % 3 === 0 ? 'Tech Lead' : idx % 3 === 1 ? 'Engineering Director' : 'Culture Partner') : 'AI Interviewer'),
              follow_up: false
            }));
          }
        }
      } catch (err) {
        console.warn('Anthropic API dynamic question generation failed, using dynamic generative engine:', err);
      }
    }

    // Dynamic Generative Engine (Customizes standard, situational, and role-specific questions for any arbitrary job title)
    return this.generateDynamicQuestionPool(role, type, difficulty, numQuestions, jobContext, candidateContext);
  }

  /**
   * Generates dynamic, varied questions algorithmically tailored to the specific role and type
   */
  private static generateDynamicQuestionPool(
    role: string,
    type: string,
    difficulty: string,
    numQuestions: number,
    jobContext?: JobContext | null,
    candidateContext?: CandidateContext | null
  ): InterviewQuestion[] {
    const roleLower = role.toLowerCase();
    const questions: InterviewQuestion[] = [];

    // Panel Interviewer titles
    const panelTitles = ['Lead Architect', 'Engineering Director', 'Culture & Talent Partner'];

    // 1. Role-Specific Technical & Architectural Questions
    const techPool: Array<{ q: string; focus: string; keywords: string[] }> = [
      {
        q: `When designing high-throughput services for a ${role} position, how do you handle database connection pooling, read/write replication, and cache invalidation under peak traffic?`,
        focus: 'High-Throughput Architecture & Caching',
        keywords: ['caching', 'redis', 'replication', 'connection pooling', 'invalidation', 'latency']
      },
      {
        q: `Can you walk me through an end-to-end debugging scenario where a critical endpoint for a ${role} service exhibited intermittent memory leaks or high CPU throttling?`,
        focus: 'Performance Profiling & Debugging',
        keywords: ['profiling', 'memory leak', 'cpu', 'monitoring', 'metrics', 'root cause']
      },
      {
        q: `How do you structure API security, authentication, and granular rate-limiting when building scalable services for ${role}?`,
        focus: 'API Security & Resilience',
        keywords: ['jwt', 'oauth', 'rate limiting', 'tokens', 'validation', 'sanitization']
      },
      {
        q: `What trade-offs do you evaluate between relational SQL models and document/key-value stores when architecting schemas for ${role}?`,
        focus: 'Data Modeling & Persistence',
        keywords: ['normalization', 'indexes', 'acid', 'nosql', 'sharding', 'consistency']
      },
      {
        q: `Explain how you implement CI/CD pipelines, automated regression testing, and zero-downtime deployment strategies for ${role} production systems.`,
        focus: 'DevOps & Continuous Delivery',
        keywords: ['ci/cd', 'docker', 'kubernetes', 'canary', 'blue-green', 'unit testing']
      }
    ];

    // 2. Behavioral & Situational Questions
    const behavioralPool: Array<{ q: string; focus: string; keywords: string[] }> = [
      {
        q: `Tell me about a time in your career as a ${role} when you strongly disagreed with a product specification or engineering decision. How did you build consensus without stalling delivery?`,
        focus: 'Constructive Disagreement & Influence',
        keywords: ['situation', 'consensus', 'data-driven', 'trade-offs', 'alignment', 'outcome']
      },
      {
        q: `Describe a high-severity production incident you owned. How did you coordinate triage, mitigate customer impact, and conduct a blameless post-mortem?`,
        focus: 'Incident Response & Ownership',
        keywords: ['triage', 'rollback', 'mitigation', 'post-mortem', 'prevention', 'communication']
      },
      {
        q: `Can you share an experience where you had to balance delivering quick feature milestones against paying down technical debt as a ${role}?`,
        focus: 'Technical Debt & Prioritization',
        keywords: ['prioritization', 'refactoring', 'roadmap', 'trade-offs', 'maintainability']
      },
      {
        q: `Tell me about a project where requirements shifted drastically midway through execution. How did you adapt your architecture and keep stakeholders aligned?`,
        focus: 'Agility & Adaptability',
        keywords: ['adaptability', 'stakeholders', 'pivoting', 'modular', 'communication']
      }
    ];

    // 3. Candidate & Job Specific Questions
    if (jobContext && jobContext.required_skills?.length > 0) {
      const skills = jobContext.required_skills.map(s => typeof s === 'string' ? s : s.skill);
      techPool.unshift({
        q: `This role specifically emphasizes ${skills.slice(0, 3).join(', ')}. Can you detail your hands-on production experience with these technologies and a complex challenge you solved?`,
        focus: `${skills[0]} Production Experience`,
        keywords: [...skills.map(s => s.toLowerCase()), 'experience', 'production', 'solution']
      });
    }

    if (candidateContext?.portfolio_projects && candidateContext.portfolio_projects.length > 0) {
      const proj = candidateContext.portfolio_projects[0];
      behavioralPool.unshift({
        q: `In your portfolio project "${proj.title}", what were the biggest architectural constraints you faced, and how would you redesign it today for 100x scale?`,
        focus: 'Portfolio Project Deep-Dive',
        keywords: ['architecture', 'scalability', 'trade-offs', 'design', 'optimization']
      });
    }

    let selectedPool: Array<{ q: string; focus: string; keywords: string[] }> = [];

    if (type === 'Behavioral') {
      selectedPool = [...behavioralPool.sort(() => Math.random() - 0.5), ...techPool.slice(0, 2)];
    } else if (type === 'Panel') {
      // Interleave Technical, Behavioral, and System questions
      for (let i = 0; i < Math.max(techPool.length, behavioralPool.length); i++) {
        if (techPool[i]) selectedPool.push(techPool[i]);
        if (behavioralPool[i]) selectedPool.push(behavioralPool[i]);
      }
    } else {
      selectedPool = [...techPool.sort(() => Math.random() - 0.5), ...behavioralPool.slice(0, 2)];
    }

    // Shuffle and pick desired count
    const picked = selectedPool.slice(0, numQuestions);

    return picked.map((item, idx) => ({
      id: `q-${idx + 1}`,
      question: item.q,
      skill_focus: item.focus,
      expected_keywords: item.keywords,
      difficulty,
      question_type: idx === 0 ? 'standard' : idx % 2 === 1 ? 'situational' : 'role-specific',
      interviewer_role: type === 'Panel' ? panelTitles[idx % panelTitles.length] : 'AI Coach',
      follow_up: false
    }));
  }

  /**
   * Dynamically evaluate candidate answer live using Anthropic API or heuristic engine
   */
  static async evaluateAnswer(
    question: string,
    answer: string,
    expectedKeywords: string[] = [],
    difficulty: string = 'Intermediate',
    role: string = 'Software Professional'
  ): Promise<AnswerEvaluation> {
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

    if (apiKey && answer.trim().length > 10) {
      try {
        const evalPrompt = `You are a Senior Technical Interviewer evaluating a candidate's answer.
Role: "${role}"
Question: "${question}"
Candidate Answer: "${answer}"
Expected Focus Keywords: ${expectedKeywords.join(', ')}

Evaluate the candidate's answer with constructive, high-signal feedback.
Return a valid raw JSON object (NO markdown code blocks) with the following structure:
{
  "score": 85,
  "score_out_of_10": 8.5,
  "technical_knowledge": 85,
  "communication": 82,
  "problem_solving": 88,
  "answer_relevance": 85,
  "confidence": 80,
  "feedback": "Concise high-level diagnostic summary",
  "clarity_feedback": "Specific feedback on clarity and conciseness",
  "structure_feedback": "Specific feedback on STAR structure and flow",
  "filler_words_feedback": "Advice on reducing hesitation or filler words if applicable",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement 1", "Improvement 2"],
  "suggested_better_answer": "An exemplary, structured response using the STAR method."
}`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1000,
            messages: [{ role: 'user', content: evalPrompt }]
          })
        });

        if (response.ok) {
          const data: any = await response.json();
          const text = data.content?.[0]?.text?.trim() || '';
          const cleaned = text.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
          const parsed = JSON.parse(cleaned);

          return {
            score: Number(parsed.score) || 75,
            score_out_of_10: Number(parsed.score_out_of_10) || Math.round((Number(parsed.score) || 75) / 10 * 10) / 10,
            technical_knowledge: Number(parsed.technical_knowledge) || 75,
            communication: Number(parsed.communication) || 75,
            problem_solving: Number(parsed.problem_solving) || 75,
            answer_relevance: Number(parsed.answer_relevance) || 75,
            confidence: Number(parsed.confidence) || 75,
            feedback: parsed.feedback || 'Good structured response.',
            clarity_feedback: parsed.clarity_feedback || 'Clear delivery.',
            structure_feedback: parsed.structure_feedback || 'Followed structured logic.',
            filler_words_feedback: parsed.filler_words_feedback || 'Minimal verbal hesitations.',
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Engaged with technical depth'],
            improvements: Array.isArray(parsed.improvements) ? parsed.improvements : ['Provide quantifiable metrics'],
            suggested_better_answer: parsed.suggested_better_answer || 'Use STAR format to highlight context, task, action, and results.'
          };
        }
      } catch (err) {
        console.warn('Anthropic API evaluation call failed, using algorithmic evaluator:', err);
      }
    }

    // Heuristic Evaluation Algorithm
    return this.evaluateAnswerHeuristic(question, answer, expectedKeywords, difficulty);
  }

  private static evaluateAnswerHeuristic(
    question: string,
    answer: string,
    expectedKeywords: string[] = [],
    difficulty: string = 'Intermediate'
  ): AnswerEvaluation {
    const text = answer.trim();
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const lower = text.toLowerCase();

    // Check keyword hits
    let matchedKeywords = 0;
    for (const kw of expectedKeywords) {
      if (lower.includes(kw.toLowerCase())) matchedKeywords++;
    }

    // Check STAR markers
    const starMarkers = ['situation', 'task', 'action', 'result', 'implemented', 'designed', 'optimized', 'achieved', 'because', 'trade-off'];
    let starHits = 0;
    for (const m of starMarkers) {
      if (lower.includes(m)) starHits++;
    }

    // Check filler words
    const fillerWords = ['um', 'uh', 'like', 'you know', 'actually', 'basically', 'literally', 'sort of'];
    let fillerHits = 0;
    for (const f of fillerWords) {
      const regex = new RegExp(`\\b${f}\\b`, 'gi');
      const matches = lower.match(regex);
      if (matches) fillerHits += matches.length;
    }

    let technical = 60 + Math.min(matchedKeywords * 10, 30);
    let communication = 70 + (wordCount >= 30 && wordCount <= 180 ? 20 : wordCount < 20 ? -25 : 5);
    let problemSolving = 65 + Math.min(starHits * 7, 28);
    let answerRelevance = 65 + Math.min(matchedKeywords * 8, 25);
    let confidence = Math.max(50, 85 - fillerHits * 5);

    if (wordCount < 15) {
      technical = 45;
      communication = 40;
      problemSolving = 35;
      answerRelevance = 45;
      confidence = 40;
    }

    const overallScore = Math.min(96, Math.max(35, Math.round((technical + communication + problemSolving + answerRelevance + confidence) / 5)));
    const scoreOutOf10 = Math.round((overallScore / 10) * 10) / 10;

    const strengths: string[] = [];
    const improvements: string[] = [];

    if (wordCount >= 35) strengths.push('Provided solid narrative context with sufficient technical depth.');
    if (matchedKeywords >= 1) strengths.push(`Effectively leveraged key terminology (${expectedKeywords.slice(0, 2).join(', ')}).`);
    if (starHits >= 2) strengths.push('Structured reasoning around specific actions taken and positive outcomes.');

    if (wordCount < 30) improvements.push('Expand your explanation with concrete real-world implementation details and metrics.');
    if (matchedKeywords < 1 && expectedKeywords.length > 0) improvements.push(`Incorporate domain terminology such as ${expectedKeywords.slice(0, 2).join(' or ')}.`);
    if (fillerHits > 2) improvements.push('Reduce conversational filler words ("like", "basically") by pausing in silence.');
    if (starHits < 2) improvements.push('Apply the STAR framework: Situation → Task → Action → Result.');

    if (strengths.length === 0) strengths.push('Good initial attempt; directly addressed the prompt.');
    if (improvements.length === 0) improvements.push('Continue maintaining this high level of structured articulation.');

    const feedback = overallScore >= 80
      ? `Strong answer! You communicated key concepts clearly with appropriate depth.`
      : overallScore >= 60
        ? `Solid foundation. Try to integrate more quantifiable results and specific tooling details.`
        : `Your answer would benefit from more concrete examples and structured STAR progression.`;

    return {
      score: overallScore,
      score_out_of_10: scoreOutOf10,
      technical_knowledge: technical,
      communication,
      problem_solving: problemSolving,
      answer_relevance: answerRelevance,
      confidence,
      feedback,
      clarity_feedback: wordCount < 25 ? 'Answer is very brief. Provide more explanation.' : 'Clear and concise delivery.',
      structure_feedback: starHits >= 2 ? 'Excellent STAR narrative flow.' : 'Organize with clear Situation, Action, and Result.',
      filler_words_feedback: fillerHits > 2 ? `Detected ${fillerHits} filler words. Aim for clean pauses.` : 'Clean vocal delivery with minimal filler words.',
      strengths,
      improvements,
      suggested_better_answer: `“In my previous role, I addressed this by evaluating the core trade-offs, designing a modular solution using ${expectedKeywords[0] || 'standard patterns'}, and validating through automated tests. As a result, we improved reliability and decreased latency by 35%.”`
    };
  }

  /**
   * Generate follow-up question dynamically
   */
  static generateFollowUp(
    previousQuestion: string,
    previousAnswer: string,
    skillFocus: string,
    role: string
  ): InterviewQuestion | null {
    const wordCount = previousAnswer.trim().split(/\s+/).length;
    if (wordCount < 20) {
      return {
        id: `followup-${Date.now()}`,
        question: `Could you elaborate on that with a concrete production example? How did you specifically implement that in your work?`,
        skill_focus: skillFocus,
        expected_keywords: [skillFocus.toLowerCase(), 'implementation', 'example', 'outcome'],
        difficulty: 'Intermediate',
        follow_up: true
      };
    }
    return null;
  }

  /**
   * Generate overall session feedback
   */
  static generateSessionFeedback(
    qaList: Array<{ question: string; answer: string; evaluation: AnswerEvaluation }>,
    role: string
  ): SessionFeedback {
    if (qaList.length === 0) {
      return {
        overall_score: 0,
        category_scores: { technical_knowledge: 0, communication: 0, problem_solving: 0, answer_relevance: 0, confidence: 0 },
        strengths: ['No answers were submitted.'],
        areas_to_improve: ['Complete the interview questions to receive diagnostic feedback.'],
        recommendations: []
      };
    }

    const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

    const category_scores = {
      technical_knowledge: avg(qaList.map(q => q.evaluation.technical_knowledge)),
      communication: avg(qaList.map(q => q.evaluation.communication)),
      problem_solving: avg(qaList.map(q => q.evaluation.problem_solving)),
      answer_relevance: avg(qaList.map(q => q.evaluation.answer_relevance)),
      confidence: avg(qaList.map(q => q.evaluation.confidence)),
    };

    const overall_score = avg(Object.values(category_scores));

    const allStrengths = new Set<string>();
    const allImprovements = new Set<string>();
    qaList.forEach(q => {
      q.evaluation.strengths.forEach(s => allStrengths.add(s));
      q.evaluation.improvements.forEach(i => allImprovements.add(i));
    });

    const recommendations: string[] = [
      `Practice communicating high-impact ${role} technical trade-offs using quantifiable metrics.`,
      'Adopt deliberate pauses during complex answers to replace filler words with thoughtful clarity.',
      'Continue regular mock simulations across Technical and Behavioral formats to solidify poise under pressure.'
    ];

    return {
      overall_score,
      category_scores,
      strengths: Array.from(allStrengths).slice(0, 5),
      areas_to_improve: Array.from(allImprovements).slice(0, 5),
      recommendations
    };
  }

  static questionsForDuration(durationMinutes: number): number {
    if (durationMinutes <= 10) return 4;
    if (durationMinutes <= 20) return 6;
    return 8;
  }
}
