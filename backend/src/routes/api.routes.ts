import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { JobController } from '../controllers/job.controller.js';
import { MatchController } from '../controllers/match.controller.js';
import { AssessmentController } from '../controllers/assessment.controller.js';
import { RoadmapController } from '../controllers/roadmap.controller.js';
import { InterviewController } from '../controllers/interview.controller.js';
import { PortfolioController } from '../controllers/portfolio.controller.js';
import { ApplicationController } from '../controllers/application.controller.js';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// --- Auth Routes ---
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', authenticateToken, AuthController.getMe);
router.put('/auth/profile', authenticateToken, AuthController.updateProfile);
router.post('/auth/biometric/register', authenticateToken, AuthController.registerBiometric);
router.post('/auth/biometric/login', AuthController.loginBiometric);

// --- Public Badge Verification ---
router.get('/badges/verify/:badgeCode', AssessmentController.verifyBadgePublic);

// --- Jobs & Matching ---
router.get('/jobs', (req, res, next) => {
  // Optional auth for calculating fit scores dynamically
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    authenticateToken(req as any, res, () => JobController.getAllJobs(req as any, res));
  } else {
    JobController.getAllJobs(req as any, res);
  }
});

router.get('/jobs/recommendations', authenticateToken, MatchController.getRecommendations);
router.get('/jobs/:id', (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    authenticateToken(req as any, res, () => JobController.getJobById(req as any, res));
  } else {
    JobController.getJobById(req as any, res);
  }
});
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

// --- AI Mock Interview Simulator ---
router.get('/interview/questions', authenticateToken, InterviewController.getQuestions);
router.post('/interview/evaluate', authenticateToken, InterviewController.evaluateResponse);
router.post('/interview/save', authenticateToken, InterviewController.saveSession);
router.get('/interview/history', authenticateToken, InterviewController.getHistory);

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

// --- Admin & Governance ---
router.get('/admin/analytics', authenticateToken, requireRole(['admin']), AdminController.getAnalytics);
router.get('/admin/audit-logs', authenticateToken, requireRole(['admin']), AdminController.getAuditLogs);
router.get('/skills/taxonomy', AdminController.getSkillsTaxonomy);
router.post('/skills/taxonomy', authenticateToken, requireRole(['admin']), AdminController.addSkillTaxonomy);

export default router;
