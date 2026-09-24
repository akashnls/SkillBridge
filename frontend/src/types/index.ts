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
  passing_score?: number;
  description?: string;
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
  project_title?: string;
  description: string;
  role_on_project?: string;
  duration?: string;
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

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  category: string;
  ip_address?: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface Company {
  id: string;
  user_id: string;
  name: string;
  industry: string;
  website?: string;
  description?: string;
  location?: string;
  logo_url?: string;
  company_size?: string;
  founded_year?: string;
  email?: string;
  phone?: string;
  culture_text?: string;
  verification_status: 'pending' | 'verified' | 'rejected' | 'suspended';
  status: 'active' | 'suspended';
  rejection_reason?: string;
  benefits?: string[];
  social_links?: { linkedin?: string; twitter?: string; github?: string };
  jobs_count?: number;
  recruiter_name?: string;
  recruiter_email?: string;
}

export interface ScheduledInterview {
  id: string;
  application_id?: string;
  job_id: string;
  candidate_id: string;
  recruiter_id: string;
  interview_date: string;
  interview_time: string;
  interview_type: 'Video' | 'Phone' | 'In-person';
  meeting_link?: string;
  location?: string;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show';
  created_at: string;
  job_title?: string;
  candidate_name?: string;
  company_name?: string;
}

export interface Conversation {
  id: string;
  participant_a: string;
  participant_b: string;
  last_message_at?: string;
  created_at: string;
  other?: {
    id: string;
    name: string;
    avatar_url?: string;
    role: UserRole;
  };
  last_message?: {
    body: string;
    created_at: string;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  content?: string;
  created_at: string;
}

export interface PlatformNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  message?: string;
  link?: string;
  is_read: number;
  read?: boolean;
  created_at: string;
}

export interface DeterministicMatchResult {
  overall_percentage: number;
  skill_match_percentage: number;
  breakdown: {
    required_skills: { score: number; max: number; matched: string[]; missing: string[] };
    preferred_skills: { score: number; max: number; matched: string[]; missing: string[] };
    experience: { score: number; max: number; candidate_years: number; expected: string };
    education: { score: number; max: number; candidate_edu: string; expected: string };
    location_preference: { score: number; max: number; match_detail: string };
  };
  matched_skills: string[];
  missing_skills: string[];
  verified_skills: string[];
}

export interface RecruiterCandidate {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
  headline?: string;
  location?: string;
  skills: string[];
  experience_years: number;
  education?: string;
  preferred_job_role?: string;
  work_preference?: string;
  relevance: number;
  match_details?: DeterministicMatchResult;
  badges: VerifiableBadge[];
}

export interface SkillTaxonomyItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  difficulty_level: string;
  synonyms: string[];
  aliases?: string[];
  is_active: number;
}

export interface BadgeTemplateItem {
  id: string;
  name: string;
  skill_name: string;
  level: string;
  description?: string;
  criteria?: string;
  icon?: string;
  is_active: number;
}

export interface PlatformReport {
  id: string;
  reporter_id?: string;
  target_type: string;
  target_id: string;
  reason: string;
  details?: string;
  status: 'open' | 'pending' | 'investigating' | 'resolved' | 'rejected';
  admin_note?: string;
  created_at: string;
  resolved_at?: string;
}

export interface RecruiterDashboardData {
  stats: {
    total_jobs: number;
    active_jobs: number;
    applications: number;
    shortlisted: number;
    interviews: number;
    hired: number;
  };
  recent_applications: any[];
  active_jobs: any[];
  job_performance: Array<{
    id: string;
    title: string;
    status: string;
    moderation_status: string;
    created_at: string;
    views_count: number;
    application_deadline?: string;
    total_applications: number;
    shortlisted_count: number;
    interviews_count: number;
    hired_count: number;
  }>;
}

export interface AdminDashboardData {
  stats: {
    total_users: number;
    total_candidates: number;
    total_recruiters: number;
    total_companies: number;
    active_jobs: number;
    pending_jobs: number;
    total_applications: number;
    scheduled_interviews: number;
    total_hires: number;
    open_reports: number;
  };
  top_demanded_skills: Array<{ name: string; count: number; percentage: number }>;
  funnel: {
    applied: number;
    under_review: number;
    shortlisted: number;
    interview: number;
    selected: number;
    rejected: number;
  };
}

export interface CandidateDashboardData {
  user: User;
  profile_completion: number;
  missing_fields: string[];
  application_stats: {
    total: number;
    applied: number;
    under_review: number;
    shortlisted: number;
    interview: number;
    selected: number;
    rejected: number;
  };
  recent_applications: any[];
  upcoming_interviews: any[];
  badges: VerifiableBadge[];
  recent_assessments: any[];
  skills_count: number;
  verified_skills_count: number;
  mock_interviews: any[];
  recommended_jobs: any[];
  saved_job_ids: string[];
  avg_fit_score?: number;
  portfolio_count?: number;
  roadmap_count?: number;
}

export interface CandidateDetailedProfile {
  id?: string;
  user_id: string;
  headline?: string;
  bio?: string;
  phone?: string;
  location?: string;
  skills: string[];
  soft_skills: string[];
  internships: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education?: string;
  education_entries: Array<{
    degree: string;
    institution: string;
    year: string;
    score?: string;
  }>;
  experience_years: number;
  experience_entries: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year: string;
    link?: string;
  }>;
  achievements: string[];
  preferred_job_role?: string;
  preferred_locations: string[];
  expected_salary?: number;
  work_preference?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_website?: string;
}

export interface CandidateSkillItem {
  id: string;
  user_id: string;
  skill_name: string;
  category?: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  is_verified: number;
  badge_code?: string;
  badge_level?: string;
  source: string;
}

export interface CandidateResumeItem {
  id: string;
  user_id: string;
  file_name: string;
  content_text?: string;
  is_primary: number;
  score?: number;
  suggestions?: string[];
  created_at: string;
}

export interface CandidateSettingsData {
  job_preferences: {
    desired_roles: string[];
    work_modes: string[];
    preferred_locations: string[];
    min_salary: number;
    currency: string;
  };
  notification_preferences: {
    email_job_alerts: boolean;
    email_application_updates: boolean;
    email_interview_invites: boolean;
    email_marketing: boolean;
  };
  privacy_preferences: {
    profile_visibility: 'public' | 'recruiters_only' | 'private';
    resume_visibility: 'public' | 'applied_only';
    share_mock_interview_scores: boolean;
  };
}

export interface MockInterviewQuestion {
  id: string;
  question: string;
  skill_focus: string;
  expected_keywords: string[];
  difficulty: string;
  follow_up: boolean;
}

export interface MockInterviewAnswerEvaluation {
  score: number;
  score_out_of_10?: number;
  technical_knowledge: number;
  communication: number;
  problem_solving: number;
  answer_relevance: number;
  confidence: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface MockInterviewSession {
  id: string;
  user_id?: string;
  role: string;
  job_id?: string | null;
  interview_type: string;
  difficulty: string;
  duration_minutes: number;
  greeting?: string;
  questions?: MockInterviewQuestion[];
  answers?: Array<{
    question_id: string;
    question: string;
    answer: string;
    evaluation: MockInterviewAnswerEvaluation;
    answered_at: string;
  }>;
  overall_score: number;
  category_scores?: {
    technical_knowledge: number;
    communication: number;
    problem_solving: number;
    answer_relevance: number;
    confidence: number;
  };
  feedback?: string;
  strengths?: string[];
  areas_to_improve?: string[];
  recommendations?: string[];
  status: 'in_progress' | 'completed';
  created_at: string;
  completed_at?: string;
}


