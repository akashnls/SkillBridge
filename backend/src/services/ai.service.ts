export interface RoadmapStageItem {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'project' | 'assessment' | 'application';
  link_or_action?: string;
  estimated_hours: number;
  completed: boolean;
}

export interface RoadmapStage {
  stage_number: number;
  stage_name: string;
  description: string;
  items: RoadmapStageItem[];
}

export interface GeneratedRoadmap {
  target_role: string;
  estimated_completion_weeks: number;
  stages: RoadmapStage[];
  ai_coaching_advice: string;
}

export interface InterviewEvaluation {
  overall_score: number; // 0-100
  clarity_score: number; // 0-100
  technical_relevance_score: number; // 0-100
  completeness_score: number; // 0-100
  star_alignment_score: number; // 0-100
  strengths: string[];
  areas_for_improvement: string[];
  suggested_better_answer: string;
  actionable_tip: string;
}

export class AIService {
  /**
   * Generates a 4-step personalized learning & job readiness roadmap
   */
  static generateSkillGapRoadmap(
    targetRole: string,
    currentSkills: string[],
    missingSkills: string[],
    targetJobTitle?: string
  ): GeneratedRoadmap {
    const roleName = targetJobTitle || targetRole || 'Software Professional';
    const primaryMissing = missingSkills.length > 0 ? missingSkills : ['Advanced System Design', 'Cloud Deployment'];

    const stages: RoadmapStage[] = [
      {
        stage_number: 1,
        stage_name: 'Step 1: Foundational Conceptual Learning',
        description: 'Master the core theoretical principles and syntax for your missing requirements.',
        items: [
          {
            id: 'item-1-1',
            title: `Core Fundamentals of ${primaryMissing[0] || 'Modern Architecture'}`,
            description: `Complete interactive modular lessons covering design principles, state management, and real-world patterns in ${primaryMissing[0] || 'Software Architecture'}.`,
            type: 'course',
            link_or_action: 'https://freecodecamp.org',
            estimated_hours: 12,
            completed: false
          },
          {
            id: 'item-1-2',
            title: `Deep-Dive: ${primaryMissing[1] || 'API & Database Integration'}`,
            description: 'Learn best practices for high-performance querying, caching strategies, and security hygiene.',
            type: 'course',
            link_or_action: 'https://developer.mozilla.org',
            estimated_hours: 10,
            completed: false
          }
        ]
      },
      {
        stage_number: 2,
        stage_name: 'Step 2: Hands-On Milestone Project',
        description: 'Translate acquired knowledge into a tangible, non-traditional portfolio asset.',
        items: [
          {
            id: 'item-2-1',
            title: `Build a Full-Featured ${roleName} Capstone Project`,
            description: `Design and implement an end-to-end web project incorporating ${primaryMissing.slice(0, 3).join(', ')}. Include README architecture diagram, unit tests, and live deploy.`,
            type: 'project',
            link_or_action: '/portfolio',
            estimated_hours: 20,
            completed: false
          },
          {
            id: 'item-2-2',
            title: 'Push Code to GitHub & Add Live Demo to SkillBridge Portfolio',
            description: 'Publish your repository with clear setup documentation and link it directly in your SkillBridge Portfolio showcase.',
            type: 'project',
            link_or_action: '/portfolio',
            estimated_hours: 4,
            completed: false
          }
        ]
      },
      {
        stage_number: 3,
        stage_name: 'Step 3: Micro-Credential Verification',
        description: 'Validate your competence with SkillBridge automated assessments and earn verifiable digital badges.',
        items: [
          {
            id: 'item-3-1',
            title: `Take ${primaryMissing[0] || 'Technical'} Skill Assessment`,
            description: 'Achieve 70%+ score to earn your cryptographic digital badge and boost your Job-Fit score by 15%.',
            type: 'assessment',
            link_or_action: '/assessments',
            estimated_hours: 1,
            completed: false
          },
          {
            id: 'item-3-2',
            title: 'Complete AI Mock Interview Simulator Session',
            description: 'Practice 5 role-specific interview questions with instant AI feedback on articulation, technical depth, and STAR structure.',
            type: 'assessment',
            link_or_action: '/mock-interview',
            estimated_hours: 2,
            completed: false
          }
        ]
      },
      {
        stage_number: 4,
        stage_name: 'Step 4: Targeted Job Application',
        description: 'Apply with high confidence and verified proof to matching employers.',
        items: [
          {
            id: 'item-4-1',
            title: `Apply to verified ${roleName} openings with high Fit Score`,
            description: 'Leverage your updated score, verifiable badges, and project proofs to stand out to employers.',
            type: 'application',
            link_or_action: '/jobs',
            estimated_hours: 2,
            completed: false
          }
        ]
      }
    ];

    const advice = `Focus on completing Step 2 (Milestone Project) and Step 3 (Micro-Credential). In skill-based hiring, verified badges and live repositories outweigh traditional pedigree by up to 3x!`;

    return {
      target_role: roleName,
      estimated_completion_weeks: 3,
      stages,
      ai_coaching_advice: advice
    };
  }

  /**
   * Generates dynamic role-specific interview questions
   */
  static getMockInterviewQuestions(role: string, difficulty: string) {
    const defaultQuestions = [
      {
        id: 1,
        question: `Can you walk me through a complex technical challenge you solved in a recent project? How did you approach debugging and choosing the right architecture?`,
        skill_focus: 'Problem Solving & Architecture',
        expected_keywords: ['trade-offs', 'debugging', 'architecture', 'scalability', 'testing']
      },
      {
        id: 2,
        question: `How do you ensure data integrity, error handling, and performance when designing client-server interactions?`,
        skill_focus: 'API & Data Handling',
        expected_keywords: ['REST', 'validation', 'error handling', 'caching', 'latency']
      },
      {
        id: 3,
        question: `Describe a scenario where you had to quickly learn a new framework, tool, or library to deliver a project on time. What was your learning strategy?`,
        skill_focus: 'Adaptability & Self-Directed Learning',
        expected_keywords: ['documentation', 'prototyping', 'milestones', 'troubleshooting']
      },
      {
        id: 4,
        question: `How do you collaborate in a team environment when code review feedback or architectural opinions conflict?`,
        skill_focus: 'Communication & Teamwork (STAR)',
        expected_keywords: ['constructive feedback', 'consensus', 'documentation', 'empathy']
      }
    ];

    if (role.toLowerCase().includes('data')) {
      return [
        {
          id: 1,
          question: `Explain how you would handle missing data and outliers in a large dataset before feeding it into an analytics pipeline or ML model.`,
          skill_focus: 'Data Cleaning & Preprocessing',
          expected_keywords: ['imputation', 'outliers', 'distribution', 'Pandas', 'validation']
        },
        {
          id: 2,
          question: `How would you optimize a slow-running SQL query involving multiple joins across millions of records?`,
          skill_focus: 'SQL & Query Optimization',
          expected_keywords: ['indexing', 'execution plan', 'joins', 'aggregation', 'partitioning']
        },
        {
          id: 3,
          question: `Describe a business intelligence dashboard or report you built that directly influenced a stakeholder decision.`,
          skill_focus: 'Business Impact & Storytelling',
          expected_keywords: ['KPIs', 'stakeholders', 'visualization', 'actionable insights']
        }
      ];
    }

    return defaultQuestions;
  }

  /**
   * Evaluates user's spoken or written interview answer
   */
  static evaluateInterviewAnswer(questionText: string, userAnswer: string, expectedKeywords: string[] = []): InterviewEvaluation {
    const text = userAnswer.trim();
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    let clarity = 70;
    let technical = 65;
    let completeness = 60;
    let star = 65;

    // Word count / length check
    if (wordCount < 15) {
      clarity = 45;
      technical = 40;
      completeness = 35;
      star = 30;
    } else if (wordCount > 40 && wordCount < 200) {
      clarity = 85;
      completeness = 85;
    } else if (wordCount >= 200) {
      clarity = 78; // might be slightly verbose
      completeness = 92;
    }

    // Keyword detection
    let matchedKeywords = 0;
    const lower = text.toLowerCase();
    for (const kw of expectedKeywords) {
      if (lower.includes(kw.toLowerCase())) {
        matchedKeywords++;
      }
    }

    if (expectedKeywords.length > 0) {
      technical += Math.min(Math.round((matchedKeywords / expectedKeywords.length) * 30), 30);
    } else {
      technical += 15;
    }

    // Check for STAR method markers (Situation, Task, Action, Result)
    const starMarkers = ['when', 'situation', 'responsible', 'decided to', 'implemented', 'result', 'achieved', 'outcome', 'measured'];
    let starCount = 0;
    for (const marker of starMarkers) {
      if (lower.includes(marker)) starCount++;
    }
    star += Math.min(starCount * 6, 30);

    const overall = Math.min(Math.round((clarity + technical + completeness + star) / 4), 98);

    const strengths: string[] = [];
    const improvements: string[] = [];

    if (wordCount >= 30) {
      strengths.push('Provided solid narrative detail rather than a superficial one-sentence reply.');
    }
    if (matchedKeywords > 0) {
      strengths.push(`Effectively integrated relevant technical vocabulary (${expectedKeywords.slice(0, 2).join(', ')}).`);
    } else {
      improvements.push('Incorporate more specific technical terminology, tools, and quantifiable metrics into your explanation.');
    }

    if (starCount < 2) {
      improvements.push('Structure your answer using the STAR method: Situation (Context) -> Task (Goal) -> Action (What you specifically did) -> Result (Quantifiable outcome).');
    } else {
      strengths.push('Followed a structured narrative progression highlighting individual action and measurable outcomes.');
    }

    const suggestedAnswer = `“In my recent project, I encountered a situation where [Context/Challenge]. My specific task was to [Goal/Responsibility]. I took action by implementing [Technical Solution, e.g., ${expectedKeywords[0] || 'modular caching'}], optimizing the code and setting up automated tests. As a result, [Measurable positive outcome, e.g., reduced response time by 40%].”`;

    return {
      overall_score: Math.max(overall, 40),
      clarity_score: Math.min(Math.max(clarity, 40), 98),
      technical_relevance_score: Math.min(Math.max(technical, 40), 98),
      completeness_score: Math.min(Math.max(completeness, 35), 98),
      star_alignment_score: Math.min(Math.max(star, 35), 98),
      strengths: strengths.length > 0 ? strengths : ['Good initial attempt; shows direct willingness to tackle the prompt.'],
      areas_for_improvement: improvements.length > 0 ? improvements : ['Continue practicing concise delivery while maintaining high technical specificity.'],
      suggested_better_answer: suggestedAnswer,
      actionable_tip: 'Pro tip: Always quantify your results with percentages, time saved, or user adoption metrics.'
    };
  }
}
