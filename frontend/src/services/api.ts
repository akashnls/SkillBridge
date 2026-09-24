import axios from 'axios';
import {
  User,
  Job,
  JobFitExplanation,
  Assessment,
  VerifiableBadge,
  PortfolioProject,
  Roadmap,
  Application,
  MockInterviewSession,
  AuditLog,
  Company,
  ScheduledInterview,
  Conversation,
  Message,
  PlatformNotification,
  RecruiterCandidate,
  SkillTaxonomyItem,
  BadgeTemplateItem,
  PlatformReport,
  CandidateDashboardData,
  CandidateDetailedProfile,
  CandidateSkillItem,
  CandidateResumeItem,
  CandidateSettingsData,
  MockInterviewQuestion,
  MockInterviewAnswerEvaluation
} from '../types/index.js';

// Re-export the API models so feature views can import a client and its
// response types from one module.
export type {
  User, Job, JobFitExplanation, Assessment, VerifiableBadge, PortfolioProject,
  Roadmap, Application, MockInterviewSession, AuditLog, Company,
  ScheduledInterview, Conversation, Message, PlatformNotification,
  RecruiterCandidate, SkillTaxonomyItem, BadgeTemplateItem, PlatformReport,
  CandidateDashboardData, CandidateDetailedProfile, CandidateSkillItem,
  CandidateResumeItem, CandidateSettingsData, MockInterviewQuestion,
  MockInterviewAnswerEvaluation
} from '../types/index.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillbridge_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get<{ success: boolean; user: User }>('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  getBiometricRegisterOptions: () => api.post('/auth/biometric/register-options'),
  verifyBiometricRegister: (response: any) => api.post<{ success: boolean; message: string }>('/auth/biometric/register-verify', { response }),
  getBiometricLoginOptions: (email: string) => api.post('/auth/biometric/login-options', { email }),
  verifyBiometricLogin: (email: string, response: any) => api.post<{ success: boolean; token: string; user: User; message: string }>('/auth/biometric/login-verify', { email, response }),
  registerBiometric: (response?: any) => api.post('/auth/biometric/register', response ? { response } : {}),
  loginBiometric: (email: string, response?: any) => api.post('/auth/biometric/login', { email, response })
};

export const jobsAPI = {
  getJobs: (params?: { search?: string; job_type?: string; experience_level?: string; location?: string; status?: string }) =>
    api.get<{ success: boolean; count: number; jobs: Job[] }>('/jobs', { params }),
  getJobById: (id: string) => api.get<{ success: boolean; job: Job & { fit_explanation?: JobFitExplanation; has_applied?: boolean } }>(`/jobs/${id}`),
  getMatchExplanation: (jobId: string) => api.get<{ success: boolean; match: JobFitExplanation }>(`/jobs/${jobId}/match-explanation`),
  getRecommendations: () => api.get<{ success: boolean; recommendations: Array<{ job: Job; fit: JobFitExplanation }> }>('/jobs/recommendations'),
  createJob: (jobData: any) => api.post('/jobs', jobData),
  getMyPostedJobs: () => api.get<{ success: boolean; jobs: any[] }>('/employer/my-jobs')
};

export const assessmentsAPI = {
  getAssessments: () => api.get<{ success: boolean; assessments: Assessment[] }>('/assessments'),
  getAssessmentById: (id: string) => api.get<{ success: boolean; assessment: Assessment }>(`/assessments/${id}`),
  submitAssessment: (id: string, answers: Array<{ question_id: string; selected_index: number }>) =>
    api.post(`/assessments/${id}/submit`, { answers }),
  getMyBadges: () => api.get<{ success: boolean; badges: VerifiableBadge[] }>('/badges/my'),
  verifyBadgePublic: (badgeCode: string) => api.get(`/badges/verify/${badgeCode}`)
};

export const roadmapAPI = {
  generateRoadmap: (target_role: string, target_job_id?: string) =>
    api.post<{ success: boolean; roadmap: Roadmap }>('/roadmap/generate', { target_role, target_job_id }),
  getMyRoadmaps: () => api.get<{ success: boolean; roadmaps: Roadmap[] }>('/roadmap/my'),
  toggleStepItem: (roadmapId: string, itemId: string, completed: boolean) =>
    api.put(`/roadmap/${roadmapId}/step`, { itemId, completed })
};

export const portfolioAPI = {
  getMyPortfolios: () => api.get<{ success: boolean; portfolios: PortfolioProject[] }>('/portfolio/my'),
  getPortfoliosByUser: (userId: string) => api.get<{ success: boolean; portfolios: PortfolioProject[] }>(`/portfolio/user/${userId}`),
  createPortfolio: (data: any) => api.post('/portfolio', data),
  deletePortfolio: (id: string) => api.delete(`/portfolio/${id}`)
};

export const applicationsAPI = {
  apply: (job_id: string, cover_letter?: string) => api.post('/applications/apply', { job_id, cover_letter }),
  getMyApplications: () => api.get<{ success: boolean; applications: Application[] }>('/applications/my'),
  getJobApplicants: (jobId: string, status?: string) =>
    api.get<{ success: boolean; job_title: string; total_applicants: number; applicants: Application[] }>(`/applications/job/${jobId}`, { params: { status } }),
  updateStatus: (id: string, status: string) => api.put(`/applications/${id}/status`, { status }),
  getTimeline: (id: string) => api.get<{ success: boolean; events: any[]; current: string }>(`/applications/${id}/timeline`),
  withdraw: (id: string) => api.post(`/applications/${id}/withdraw`)
};

export const recruiterAPI = {
  getDashboard: () =>
    api.get<{
      success: boolean;
      stats: { total_jobs: number; active_jobs: number; applications: number; shortlisted: number; interviews: number; hired: number };
      recent_applications: any[];
      active_jobs: any[];
      job_performance: any[];
    }>('/recruiter/dashboard'),
  getCompany: () => api.get<{ success: boolean; company: Company }>('/recruiter/company'),
  getMyCompany: () => api.get<{ success: boolean; company: Company }>('/recruiter/company'),
  updateCompany: (data: Partial<Company>) => api.put('/recruiter/company', data),
  getMyJobs: () => api.get<{ success: boolean; jobs: any[] }>('/recruiter/jobs'),
  createJob: (data: any) => {
    const payload = {
      ...data,
      job_type: data.job_type || data.type || 'Full-time',
      salary_range: data.salary_range || (data.salary_min && data.salary_max ? `${data.salary_min} - ${data.salary_max} ${data.currency || 'USD'}` : 'Competitive')
    };
    return api.post('/recruiter/jobs', payload);
  },
  updateJob: (id: string | number, data: any) => {
    const payload = {
      ...data,
      job_type: data.job_type || data.type,
      salary_range: data.salary_range || (data.salary_min && data.salary_max ? `${data.salary_min} - ${data.salary_max} ${data.currency || 'USD'}` : undefined)
    };
    return api.put(`/recruiter/jobs/${id}`, payload);
  },
  deleteJob: (id: string | number) => api.delete(`/recruiter/jobs/${id}`),
  updateJobStatus: (id: string | number, status: string) => api.put(`/recruiter/jobs/${id}/status`, { status }),
  getApplications: (params?: { job?: string; status?: string; min_score?: number; search?: string }) =>
    api.get<{ success: boolean; applications: any[] }>('/recruiter/applications', { params }),
  updateApplicationStatus: (id: string | number, status: string) => applicationsAPI.updateStatus(String(id), status),
  searchCandidates: (params?: { skills?: string; location?: string; role?: string; education?: string; min_score?: number; job_id?: string; experience?: string }) =>
    api.get<{ success: boolean; candidates: RecruiterCandidate[] }>('/recruiter/candidates', { params }),
  getCandidate: (candidateId: string | number) => api.get<{ success: boolean; candidate: any }>(`/recruiter/candidates/${candidateId}`),
  getCandidateProfile: (candidateId: string | number) => api.get<{ success: boolean; candidate: any }>(`/recruiter/candidates/${candidateId}`),
  shortlistCandidate: (application_id: string | number) => api.post('/recruiter/shortlist', { application_id }),
  getShortlisted: () => api.get<{ success: boolean; applications: any[] }>('/recruiter/shortlisted'),
  scheduleInterview: (data: { candidate_id: string; job_id: string; application_id?: string; interview_date: string; interview_time: string; interview_type: string; meeting_link?: string; location?: string; notes?: string }) =>
    api.post('/recruiter/interviews', data),
  getInterviews: () => api.get<{ success: boolean; interviews: ScheduledInterview[] }>('/recruiter/interviews'),
  updateInterview: (id: string | number, data: Partial<ScheduledInterview>) => api.put(`/recruiter/interviews/${id}`, data),
  updateInterviewStatus: (id: string | number, data: Partial<ScheduledInterview>) => api.put(`/recruiter/interviews/${id}`, data),
  getConversations: () => api.get<{ success: boolean; conversations: Conversation[] }>('/recruiter/conversations'),
  getMessages: (convoId: string | number) => api.get<{ success: boolean; messages: Message[] }>(`/recruiter/messages/${convoId}`),
  sendMessage: (data: { recipient_id?: string; conversation_id?: string; body: string }) => api.post('/recruiter/messages', data)
};

export const notificationsAPI = {
  getNotifications: () => api.get<{ success: boolean; notifications: PlatformNotification[] }>('/notifications'),
  getAll: () => api.get<{ success: boolean; notifications: PlatformNotification[] }>('/notifications'),
  markAsRead: (id: string | number) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
};

export const reportsAPI = {
  createReport: (data: { target_type: string; target_id: string; reason: string; details?: string }) =>
    api.post('/reports', data)
};

export const adminAPI = {
  getDashboard: () =>
    api.get<{
      success: boolean;
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
      kpis?: any;
      top_demanded_skills: Array<{ name: string; count: number; percentage: number }>;
      funnel: any;
      company_verifications?: any[];
      job_moderations?: any[];
      flagged_reports?: any[];
      recent_activity?: any[];
    }>('/admin/dashboard'),
  getUsers: (params?: { search?: string; role?: string; status?: string }) =>
    api.get<{ success: boolean; users: any[] }>('/admin/users', { params }),
  updateUser: (id: string | number, data: { status?: string; role?: string }) => api.put(`/admin/users/${id}/status`, data),
  updateUserStatus: (id: string | number, status: string) => api.put(`/admin/users/${id}/status`, { status }),
  deleteUser: (id: string | number) => api.delete(`/admin/users/${id}`),
  getRecruiters: () => api.get<{ success: boolean; recruiters: any[] }>('/admin/recruiters'),
  getCompanies: () => api.get<{ success: boolean; companies: Company[] }>('/admin/companies'),
  verifyCompany: (id: string | number, data: { verification_status?: string; status?: string; rejection_reason?: string; reason?: string }) => {
    const payload = {
      verification_status: data.verification_status || data.status || 'verified',
      rejection_reason: data.rejection_reason || data.reason
    };
    return api.put(`/admin/companies/${id}/verify`, payload);
  },
  getJobs: (params?: { moderation_status?: string; search?: string }) =>
    api.get<{ success: boolean; jobs: any[] }>('/admin/jobs', { params }),
  moderateJob: (id: string | number, data: { moderation_status?: string; status?: string; rejection_reason?: string; reason?: string }) => {
    const moderation_status = data.moderation_status || (data.status === 'approved' || data.status === 'rejected' ? data.status : undefined) || 'approved';
    const payload = {
      moderation_status,
      status: data.status,
      rejection_reason: data.rejection_reason || data.reason
    };
    return api.put(`/admin/jobs/${id}/moderate`, payload);
  },
  getApplications: () => api.get<{ success: boolean; applications: any[] }>('/admin/applications'),
  getSkills: () => api.get<{ success: boolean; skills: SkillTaxonomyItem[] }>('/admin/skills'),
  createSkill: (data: Partial<SkillTaxonomyItem>) => api.post('/admin/skills', data),
  updateSkill: (id: string | number, data: Partial<SkillTaxonomyItem>) => api.put(`/admin/skills/${id}`, data),
  deleteSkill: (id: string | number) => api.delete(`/admin/skills/${id}`),
  getAssessments: () => api.get<{ success: boolean; assessments: any[] }>('/admin/assessments'),
  saveAssessment: (data: any) => api.post('/admin/assessments', data),
  createAssessment: (data: any) => api.post('/admin/assessments', data),
  updateAssessment: (id: string | number, data: any) => api.post('/admin/assessments', { ...data, id }),
  deleteAssessment: (id: string | number) => api.delete(`/admin/assessments/${id}`),
  getBadges: () => api.get<{ success: boolean; templates: BadgeTemplateItem[]; issued_count: number }>('/admin/badges'),
  getBadgeTemplates: () => api.get<{ success: boolean; templates: BadgeTemplateItem[]; issued_count: number }>('/admin/badges'),
  saveBadge: (data: any) => api.post('/admin/badges', data),
  createBadgeTemplate: (data: any) => api.post('/admin/badges', data),
  updateBadgeTemplate: (id: string | number, data: any) => api.post('/admin/badges', { ...data, id }),
  deleteBadge: (id: string | number) => api.delete(`/admin/badges/${id}`),
  deleteBadgeTemplate: (id: string | number) => api.delete(`/admin/badges/${id}`),
  getReports: () => api.get<{ success: boolean; reports: PlatformReport[] }>('/admin/reports'),
  resolveReport: (id: string | number, data: { status: string; admin_note?: string }) => api.put(`/admin/reports/${id}`, data),
  getAnalytics: () =>
    api.get<{
      success: boolean;
      user_analytics: any;
      job_analytics: any;
      application_analytics: any;
      hiring_analytics: any;
      skill_analytics: any[];
    }>('/admin/analytics'),
  getAuditLogs: (category?: string) => api.get<{ success: boolean; count: number; logs: AuditLog[] }>('/admin/audit-logs', { params: { category } }),
  getSettings: () => api.get<{ success: boolean; settings: Record<string, string> }>('/admin/settings'),
  updateSettings: (data: Record<string, string>) => api.put('/admin/settings', data),

  // Compatibility
  getSkillsTaxonomy: () => api.get<{ success: boolean; count: number; skills: any[] }>('/skills/taxonomy'),
  addSkillTaxonomy: (data: any) => api.post('/skills/taxonomy', data)
};

export const candidateAPI = {
  getDashboard: () => api.get<{ success: boolean; dashboard: CandidateDashboardData }>('/candidate/dashboard'),
  getProfile: () => api.get<{ success: boolean; user: any; profile: CandidateDetailedProfile; profile_completion: number; missing_fields: string[] }>('/candidate/profile'),
  updateProfile: (data: Partial<CandidateDetailedProfile> & { name?: string; avatar_url?: string }) => api.put('/candidate/profile', data),
  getSkills: () => api.get<{ success: boolean; skills: CandidateSkillItem[]; badges: any[] }>('/candidate/skills'),
  addSkill: (data: { skill_name: string; proficiency: string; category?: string }) => api.post('/candidate/skills', data),
  updateSkillProficiency: (id: string, proficiency: string) => api.put(`/candidate/skills/${id}/proficiency`, { proficiency }),
  removeSkill: (id: string) => api.delete(`/candidate/skills/${id}`),
  getSavedJobs: () => api.get<{ success: boolean; saved_jobs: any[] }>('/candidate/saved-jobs'),
  saveJob: (job_id: string) => api.post('/candidate/saved-jobs', { job_id }),
  unsaveJob: (jobId: string) => api.delete(`/candidate/saved-jobs/${jobId}`),
  getResumes: () => api.get<{ success: boolean; resumes: CandidateResumeItem[] }>('/candidate/resumes'),
  uploadResume: (data: { file_name: string; content_text?: string; is_primary?: boolean }) => api.post('/candidate/resumes', data),
  setPrimaryResume: (id: string) => api.put(`/candidate/resumes/${id}/primary`),
  deleteResume: (id: string) => api.delete(`/candidate/resumes/${id}`),
  getSettings: () => api.get<{ success: boolean; user: any; settings: CandidateSettingsData }>('/candidate/settings'),
  updateSettings: (data: any) => api.put('/candidate/settings', data),
  getInterviewPrepProgress: () => api.get<{ success: boolean; progress: any[] }>('/candidate/interview-prep/progress'),
  toggleInterviewPrepQuestion: (data: { question_id: string; category: string; is_completed?: boolean; notes?: string }) => api.post('/candidate/interview-prep/toggle', data),
  getInterviews: () => api.get<{ success: boolean; interviews: ScheduledInterview[] }>('/candidate/interviews')
};

export const mockInterviewAPI = {
  start: (data: { role?: string; interview_type?: string; difficulty?: string; duration_minutes?: number; job_id?: string | null }) =>
    api.post<{
      success: boolean;
      session: {
        id: string;
        role: string;
        job_id?: string | null;
        interview_type: string;
        difficulty: string;
        duration_minutes: number;
        greeting: string;
        total_questions: number;
        current_question_index: number;
        current_question: MockInterviewQuestion;
        status: string;
      };
    }>('/mock-interview/start', data),
  submitAnswer: (id: string, data: { answer: string; question_id: string }) =>
    api.post<{
      success: boolean;
      evaluation: MockInterviewAnswerEvaluation;
      next_question: MockInterviewQuestion | null;
      current_question_index: number;
      total_questions: number;
      is_complete: boolean;
      session?: MockInterviewSession;
    }>(`/mock-interview/${id}/answer`, data),
  complete: (id: string) => api.post<{ success: boolean; message: string; is_complete: boolean; session: MockInterviewSession }>(`/mock-interview/${id}/complete`),
  getHistory: () => api.get<{ success: boolean; history: MockInterviewSession[] }>('/mock-interview/history'),
  getSession: (id: string) => api.get<{ success: boolean; session: MockInterviewSession }>(`/mock-interview/${id}`),
  deleteSession: (id: string) => api.delete(`/mock-interview/${id}`)
};

export const platformAPI = {
  getStats: () => api.get<{ success: boolean; stats: { jobs: number; companies: number; seekers: number; badges: number } }>('/stats'),
  getCompanies: () => api.get<{ success: boolean; companies: Company[] }>('/companies'),
  getCompany: (id: string) => api.get<{ success: boolean; company: Company & { jobs: Job[] } }>(`/companies/${id}`)
};

export default api;


