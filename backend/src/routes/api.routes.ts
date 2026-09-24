import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { JobController } from '../controllers/job.controller.js';
import { MatchController } from '../controllers/match.controller.js';
import { AssessmentController } from '../controllers/assessment.controller.js';
import { RoadmapController } from '../controllers/roadmap.controller.js';
import { PortfolioController } from '../controllers/portfolio.controller.js';
import { ApplicationController } from '../controllers/application.controller.js';
import { AdminController } from '../controllers/admin.controller.js';
import { PlatformController } from '../controllers/platform.controller.js';
import { CandidateProfileController } from '../controllers/candidateProfile.controller.js';
import { MockInterviewController } from '../controllers/mockInterview.controller.js';
import { authenticateToken, optionalAuthenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// --- Auth Routes ---
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', authenticateToken, AuthController.getMe);
router.put('/auth/profile', authenticateToken, AuthController.updateProfile);

// --- Biometric (WebAuthn / Passkey) Auth Routes ---
router.post('/auth/biometric/register-options', authenticateToken, AuthController.biometricRegisterOptions);
router.get('/auth/biometric/register-options', authenticateToken, AuthController.biometricRegisterOptions);
router.post('/auth/biometric/register-verify', authenticateToken, AuthController.biometricRegisterVerify);
router.post('/auth/biometric/register', authenticateToken, AuthController.biometricRegisterVerify);
router.post('/auth/biometric/login-options', AuthController.biometricLoginOptions);
router.post('/auth/biometric/login-verify', AuthController.biometricLoginVerify);
router.post('/auth/biometric/login', AuthController.biometricLoginVerify);

// --- Public Badge Verification & Platform Stats / Companies ---
router.get('/badges/verify/:badgeCode', AssessmentController.verifyBadgePublic);
router.get('/stats', PlatformController.publicStats);
router.get('/companies', PlatformController.listCompanies);
router.get('/companies/:id', PlatformController.getCompanyPublic);

// --- Jobs & Matching (Public, with optional auth for candidate fit scoring) ---
router.get('/jobs', optionalAuthenticateToken, JobController.getAllJobs);
router.get('/jobs/recommendations', authenticateToken, MatchController.getRecommendations);
router.get('/jobs/:id', optionalAuthenticateToken, JobController.getJobById);
router.get('/jobs/:jobId/match-explanation', authenticateToken, MatchController.getJobFitExplanation);
router.post('/jobs', authenticateToken, requireRole(['employer', 'admin']), JobController.createJob);
router.get('/employer/my-jobs', authenticateToken, requireRole(['employer', 'admin']), JobController.getMyPostedJobs);

// --- Micro-Credentials & Assessments ---
router.get('/assessments', AssessmentController.getAssessments);
router.get('/assessments/:id', authenticateToken, AssessmentController.getAssessmentById);
router.post('/assessments/:id/submit', authenticateToken, AssessmentController.submitAssessment);
router.get('/badges/my', authenticateToken, AssessmentController.getMyBadges);

// --- Skill Gap Roadmap ---
router.post('/roadmap/generate', authenticateToken, RoadmapController.generateRoadmap);
router.get('/roadmap/my', authenticateToken, RoadmapController.getMyRoadmaps);
router.put('/roadmap/:id/step', authenticateToken, RoadmapController.toggleStepItem);

// --- Dedicated AI Mock Interview Engine ---
router.get('/interview/questions', MockInterviewController.getQuestions);
router.post('/mock-interview/start', authenticateToken, requireRole(['job_seeker', 'admin']), MockInterviewController.startSession);
router.post('/mock-interview/:id/answer', authenticateToken, requireRole(['job_seeker', 'admin']), MockInterviewController.submitAnswer);
router.post('/mock-interview/:id/complete', authenticateToken, requireRole(['job_seeker', 'admin']), MockInterviewController.completeSession);
router.get('/mock-interview/history', authenticateToken, requireRole(['job_seeker', 'admin']), MockInterviewController.getHistory);
router.get('/mock-interview/:id', authenticateToken, MockInterviewController.getSession);
router.delete('/mock-interview/:id', authenticateToken, requireRole(['job_seeker', 'admin']), MockInterviewController.deleteSession);

// --- Non-Traditional Portfolio Builder ---
router.get('/portfolio/my', authenticateToken, PortfolioController.getMyPortfolios);
router.get('/portfolio/user/:userId', authenticateToken, PortfolioController.getPortfoliosByUser);
router.post('/portfolio', authenticateToken, PortfolioController.createPortfolio);
router.delete('/portfolio/:id', authenticateToken, PortfolioController.deletePortfolio);

// --- Applications & ATS Pipeline ---
router.post('/applications/apply', authenticateToken, requireRole(['job_seeker']), ApplicationController.apply);
router.get('/applications/my', authenticateToken, requireRole(['job_seeker']), ApplicationController.getMyApplications);
router.get('/applications/job/:jobId', authenticateToken, requireRole(['employer', 'admin']), ApplicationController.getJobApplicants);
router.put('/applications/:id/status', authenticateToken, requireRole(['employer', 'admin']), ApplicationController.updateStatus);
router.get('/applications/:id/timeline', authenticateToken, PlatformController.applicationTimeline);
router.post('/applications/:id/withdraw', authenticateToken, requireRole(['job_seeker']), PlatformController.withdrawApplication);

// --- Recruiter Workspace Routes ---
router.get('/recruiter/dashboard', authenticateToken, requireRole(['employer', 'admin']), PlatformController.recruiterDashboard);
router.get('/recruiter/company', authenticateToken, requireRole(['employer', 'admin']), PlatformController.getCompanyMine);
router.put('/recruiter/company', authenticateToken, requireRole(['employer', 'admin']), PlatformController.updateCompany);
router.get('/recruiter/jobs', authenticateToken, requireRole(['employer', 'admin']), JobController.getMyPostedJobs);
router.post('/recruiter/jobs', authenticateToken, requireRole(['employer', 'admin']), JobController.createJob);
router.put('/recruiter/jobs/:id', authenticateToken, requireRole(['employer', 'admin']), PlatformController.updateJob);
router.delete('/recruiter/jobs/:id', authenticateToken, requireRole(['employer', 'admin']), PlatformController.deleteJob);
router.put('/recruiter/jobs/:id/status', authenticateToken, requireRole(['employer', 'admin']), PlatformController.updateJobStatus);
router.get('/recruiter/applications', authenticateToken, requireRole(['employer', 'admin']), PlatformController.recruiterApplications);
router.get('/recruiter/candidates', authenticateToken, requireRole(['employer', 'admin']), PlatformController.searchCandidates);
router.get('/recruiter/candidates/:candidateId', authenticateToken, requireRole(['employer', 'admin']), PlatformController.recruiterViewCandidate);
router.post('/recruiter/shortlist', authenticateToken, requireRole(['employer', 'admin']), PlatformController.shortlist);
router.get('/recruiter/shortlisted', authenticateToken, requireRole(['employer', 'admin']), PlatformController.getShortlisted);
router.post('/recruiter/interviews', authenticateToken, requireRole(['employer', 'admin']), PlatformController.scheduleInterview);
router.get('/recruiter/interviews', authenticateToken, requireRole(['employer', 'admin']), PlatformController.listInterviews);
router.put('/recruiter/interviews/:id', authenticateToken, requireRole(['employer', 'admin']), PlatformController.updateInterview);
router.get('/recruiter/conversations', authenticateToken, requireRole(['employer', 'admin', 'job_seeker']), PlatformController.listConversations);
router.get('/recruiter/messages/:id', authenticateToken, requireRole(['employer', 'admin', 'job_seeker']), PlatformController.getMessages);
router.post('/recruiter/messages', authenticateToken, requireRole(['employer', 'admin', 'job_seeker']), PlatformController.sendMessage);

// --- Candidate Workspace & Profile Routes ---
router.get('/candidate/dashboard', authenticateToken, requireRole(['job_seeker', 'admin']), CandidateProfileController.getDashboard);
router.get('/candidate/profile', authenticateToken, requireRole(['job_seeker', 'admin']), CandidateProfileController.getProfile);
router.put('/candidate/profile', authenticateToken, requireRole(['job_seeker', 'admin']), CandidateProfileController.updateProfile);
router.get('/candidate/skills', authenticateToken, requireRole(['job_seeker', 'admin']), CandidateProfileController.getSkills);
router.post('/candidate/skills', authenticateToken, requireRole(['job_seeker', 'admin']), CandidateProfileController.addSkill);
router.put('/candidate/skills/:id/proficiency', authenticateToken, requireRole(['job_seeker', 'admin']), CandidateProfileController.updateSkillProficiency);
router.delete('/candidate/skills/:id', authenticateToken, requireRole(['job_seeker', 'admin']), CandidateProfileController.removeSkill);
router.get('/candidate/saved-jobs', authenticateToken, requireRole(['job_seeker', 'admin']), CandidateProfileController.getSavedJobs);
router.post('/candidate/saved-jobs', authenticateToken, requireRole(['job_seeker', 'admin']), CandidateProfileController.saveJob);
router.delete('/candidate/saved-jobs/:jobId', authenticateToken, requireRole(['job_seeker', 'admin']), CandidateProfileController.unsaveJob);
router.get('/candidate/resumes', authenticateToken, requireRole(['job_seeker', 'admin']), CandidateProfileController.getResumes);
router.post('/candidate/resumes', authenticateToken, requireRole(['job_seeker', 'admin']), CandidateProfileController.uploadResume);
router.put('/candidate/resumes/:id/primary', authenticateToken, requireRole(['job_seeker', 'admin']), CandidateProfileController.setPrimaryResume);
router.delete('/candidate/resumes/:id', authenticateToken, requireRole(['job_seeker', 'admin']), CandidateProfileController.deleteResume);
router.get('/candidate/settings', authenticateToken, requireRole(['job_seeker', 'admin']), CandidateProfileController.getSettings);
router.put('/candidate/settings', authenticateToken, requireRole(['job_seeker', 'admin']), CandidateProfileController.updateSettings);
router.get('/candidate/interview-prep/progress', authenticateToken, requireRole(['job_seeker', 'admin']), CandidateProfileController.getInterviewPrepProgress);
router.post('/candidate/interview-prep/toggle', authenticateToken, requireRole(['job_seeker', 'admin']), CandidateProfileController.toggleInterviewPrepQuestion);

// --- Candidate Interviews & Notifications ---
router.get('/candidate/interviews', authenticateToken, requireRole(['job_seeker', 'admin']), PlatformController.listInterviews);
router.get('/notifications', authenticateToken, PlatformController.getNotifications);
router.put('/notifications/:id/read', authenticateToken, PlatformController.markNotificationRead);
router.put('/notifications/read-all', authenticateToken, PlatformController.markAllNotificationsRead);

// --- User Reporting ---
router.post('/reports', authenticateToken, PlatformController.createReport);

// --- Admin Portal & Governance Routes ---
router.get('/admin/dashboard', authenticateToken, requireRole(['admin']), PlatformController.adminDashboard);
router.get('/admin/users', authenticateToken, requireRole(['admin']), PlatformController.adminUsers);
router.put('/admin/users/:id/status', authenticateToken, requireRole(['admin']), PlatformController.adminUpdateUser);
router.delete('/admin/users/:id', authenticateToken, requireRole(['admin']), PlatformController.adminDeleteUser);
router.get('/admin/recruiters', authenticateToken, requireRole(['admin']), PlatformController.adminRecruiters);
router.get('/admin/companies', authenticateToken, requireRole(['admin']), PlatformController.adminCompanies);
router.put('/admin/companies/:id/verify', authenticateToken, requireRole(['admin']), PlatformController.adminVerifyCompany);
router.get('/admin/jobs', authenticateToken, requireRole(['admin']), PlatformController.adminJobs);
router.put('/admin/jobs/:id/moderate', authenticateToken, requireRole(['admin']), PlatformController.adminModerateJob);
router.get('/admin/applications', authenticateToken, requireRole(['admin']), PlatformController.adminApplications);
router.get('/admin/skills', authenticateToken, requireRole(['admin']), PlatformController.adminSkills);
router.post('/admin/skills', authenticateToken, requireRole(['admin']), PlatformController.adminCreateSkill);
router.put('/admin/skills/:id', authenticateToken, requireRole(['admin']), PlatformController.adminUpdateSkill);
router.delete('/admin/skills/:id', authenticateToken, requireRole(['admin']), PlatformController.adminDeleteSkill);
router.get('/admin/assessments', authenticateToken, requireRole(['admin']), PlatformController.adminAssessments);
router.post('/admin/assessments', authenticateToken, requireRole(['admin']), PlatformController.adminSaveAssessment);
router.delete('/admin/assessments/:id', authenticateToken, requireRole(['admin']), PlatformController.adminDeleteAssessment);
router.get('/admin/badges', authenticateToken, requireRole(['admin']), PlatformController.adminBadges);
router.post('/admin/badges', authenticateToken, requireRole(['admin']), PlatformController.adminSaveBadgeTemplate);
router.delete('/admin/badges/:id', authenticateToken, requireRole(['admin']), PlatformController.adminDeleteBadgeTemplate);
router.get('/admin/reports', authenticateToken, requireRole(['admin']), PlatformController.adminReports);
router.put('/admin/reports/:id', authenticateToken, requireRole(['admin']), PlatformController.adminResolveReport);
router.get('/admin/analytics', authenticateToken, requireRole(['admin']), PlatformController.adminAnalytics);
router.get('/admin/audit-logs', authenticateToken, requireRole(['admin']), AdminController.getAuditLogs);
router.get('/admin/settings', authenticateToken, requireRole(['admin']), PlatformController.adminSettingsGet);
router.put('/admin/settings', authenticateToken, requireRole(['admin']), PlatformController.adminSettingsUpdate);

// Compatibility endpoints
router.get('/skills/taxonomy', AdminController.getSkillsTaxonomy);
router.post('/skills/taxonomy', authenticateToken, requireRole(['admin']), AdminController.addSkillTaxonomy);

export default router;
