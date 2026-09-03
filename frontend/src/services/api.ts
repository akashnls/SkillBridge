import axios from 'axios';
import { User, Job, JobFitExplanation, Assessment, VerifiableBadge, PortfolioProject, Roadmap, Application, MockInterviewSession, AuditLog } from '../types/index.js';

const api = axios.create({
  baseURL: '/api',
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
  registerBiometric: () => api.post('/auth/biometric/register'),
  loginBiometric: (email: string) => api.post('/auth/biometric/login', { email })
};

export const jobsAPI = {
  getJobs: (params?: { search?: string; job_type?: string; experience_level?: string; location?: string }) =>
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

export const interviewAPI = {
  getQuestions: (role: string, difficulty: string) =>
    api.get<{ success: boolean; role: string; difficulty: string; questions: any[] }>('/interview/questions', { params: { role, difficulty } }),
  evaluateAnswer: (question: string, answer: string, expected_keywords?: string[]) =>
    api.post('/interview/evaluate', { question, answer, expected_keywords }),
  saveSession: (data: any) => api.post('/interview/save', data),
  getHistory: () => api.get<{ success: boolean; interviews: MockInterviewSession[] }>('/interview/history')
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
  updateStatus: (id: string, status: string) => api.put(`/applications/${id}/status`, { status })
};

export const adminAPI = {
  getAnalytics: () => api.get<{ success: boolean; stats: any; badgesBySkill: any[]; skillMismatchComparison: any[]; recentAudits: AuditLog[] }>('/admin/analytics'),
  getAuditLogs: (category?: string) => api.get<{ success: boolean; count: number; logs: AuditLog[] }>('/admin/audit-logs', { params: { category } }),
  getSkillsTaxonomy: () => api.get<{ success: boolean; count: number; skills: any[] }>('/skills/taxonomy'),
  addSkillTaxonomy: (data: any) => api.post('/skills/taxonomy', data)
};

export default api;
