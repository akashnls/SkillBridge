export type UserRole = 'job_seeker' | 'employer' | 'admin';
export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'kn' | 'ml';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  biometric_enabled?: boolean;
  profile?: CandidateProfile;
  company?: CompanyInfo;
  badges?: VerifiableBadge[];
}

export interface CandidateProfile {
  user_id: string;
  headline?: string;
  bio?: string;
  location?: string;
  skills: string[];
  experience_years: number;
  education?: string;
  preferred_language: SupportedLanguage;
  github_url?: string;
  linkedin_url?: string;
  portfolio_website?: string;
}

export interface CompanyInfo {
  id: string;
  user_id: string;
  name: string;
  industry: string;
  website?: string;
  description?: string;
  location?: string;
  logo_url?: string;
}

export interface SkillRequirement {
  skill: string;
  weight: number;
}

export interface Job {
  id: string;
  employer_id: string;
  company_name: string;
  title: string;
  description: string;
  location: string;
  job_type: string;
  experience_level: string;
  salary_range: string;
  required_skills: SkillRequirement[];
  preferred_skills: string[];
  status: 'open' | 'closed';
  created_at: string;
  user_fit_score?: number | null;
  match_summary?: {
    matched_count: number;
    verified_count: number;
    missing_count: number;
  };
}

export interface SkillMatchItem {
  name: string;
  is_verified: boolean;
  badge_code?: string;
  score?: number;
  level?: string;
}

export interface MissingSkillItem {
  name: string;
  importance: 'required' | 'preferred';
}

export interface PortfolioEvidenceItem {
  project_title: string;
  matched_skills: string[];
  live_demo_url?: string;
  github_url?: string;
}

export interface JobFitExplanation {
  overall_percentage: number;
  matched_skills: SkillMatchItem[];
  missing_skills: MissingSkillItem[];
  portfolio_evidence: PortfolioEvidenceItem[];
  ai_explanation: string;
  confidence_level: 'High' | 'Medium' | 'Low';
  verified_badge_bonus: number;
  practical_portfolio_bonus: number;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface Assessment {
  id: string;
  skill_name: string;
  title: string;
  category: string;
  duration_minutes: number;
  pass_percentage: number;
  total_questions: number;
  questions?: AssessmentQuestion[];
}

export interface VerifiableBadge {
  id: string;
  badge_code: string;
  user_id: string;
  skill_name: string;
  assessment_id: string;
  score_percentage: number;
  level: string;
  issued_at: string;
  verification_hash: string;
  status: 'active' | 'revoked';
}

export interface PortfolioProject {
  id: string;
  user_id: string;
  title: string;
  description: string;
  problem_solved?: string;
  skills_used: string[];
  github_url?: string;
  live_demo_url?: string;
  screenshot_url?: string;
  created_at: string;
}

export interface RoadmapItem {
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
  items: RoadmapItem[];
}

export interface Roadmap {
  id: string;
  user_id: string;
  target_role: string;
  target_job_id?: string;
  overall_progress: number;
  stages: RoadmapStage[];
  ai_coaching_advice?: string;
  created_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  user_id: string;
  job_title?: string;
  company_name?: string;
  location?: string;
  salary_range?: string;
  fit_score: number;
  fit_score_breakdown: JobFitExplanation;
  status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Interviewing' | 'Offered' | 'Rejected';
  cover_letter?: string;
  created_at: string;
  updated_at: string;
  candidate_name?: string;
  candidate_email?: string;
  candidate_avatar?: string;
  candidate_headline?: string;
  candidate_location?: string;
  experience_years?: number;
  earned_badges_count?: number;
  badges?: VerifiableBadge[];
  portfolios?: PortfolioProject[];
}

export interface MockInterviewSession {
  id: string;
  user_id: string;
  target_role: string;
  difficulty: string;
  overall_score: number;
  feedback: {
    overall_score: number;
    clarity_score: number;
    technical_relevance_score: number;
    completeness_score: number;
    star_alignment_score: number;
    strengths: string[];
    areas_for_improvement: string[];
    suggested_better_answer: string;
    actionable_tip: string;
  };
  conversation_log: Array<{
    role: 'ai' | 'user';
    text: string;
    score?: number;
  }>;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  category: string;
  ip_address?: string;
  details: Record<string, any>;
  timestamp: string;
}
