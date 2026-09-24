import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { MockInterview } from '../models/MockInterview.js';
import { User } from '../models/User.js';
import { Job } from '../models/Job.js';
import { Portfolio } from '../models/Portfolio.js';
import { Badge } from '../models/Badge.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import {
  MockInterviewAIService,
  CandidateContext,
  JobContext,
  InterviewQuestion,
  AnswerEvaluation
} from '../services/mockInterviewAI.service.js';
import { createNotification } from '../services/notify.service.js';
import { logAuditEvent } from '../middleware/audit.middleware.js';

function parseJson<T>(raw: any, fallback: T): T {
  try {
    if (raw === undefined || raw === null) return fallback;
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return fallback;
  }
}

export class MockInterviewController {
  /**
   * GET /api/interview/questions
   * Generates or fetches role-specific mock interview questions
   */
  static async getQuestions(req: any, res: Response): Promise<void> {
    try {
      const role = (req.query.role as string) || 'Full Stack Developer';
      const difficulty = (req.query.difficulty as string) || 'Intermediate';
      const type = (req.query.type as string) || 'Technical';
      const numQuestions = Number(req.query.num) || 5;

      const questions = await MockInterviewAIService.selectQuestions(
        role,
        type,
        difficulty,
        numQuestions
      );

      res.json({
        success: true,
        role,
        difficulty,
        questions
      });
    } catch (error: any) {
      console.error('Interview getQuestions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate interview questions',
        error: error.message
      });
    }
  }

  /**
   * Start a new Mock Interview session
   */
  static async startSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const {
        role = 'Full Stack Developer',
        interview_type = 'Technical',
        difficulty = 'Intermediate',
        duration_minutes = 20,
        job_id = null
      } = req.body;

      // Fetch user & profile for personalization
      const user = await User.findOne({ id: userId }).lean();
      const profile = user?.profile || {};
      const portfolios = await Portfolio.find({ user_id: userId }).lean();
      const badges = await Badge.find({ user_id: userId, status: 'active' }).lean();

      const candidateContext: CandidateContext = {
        name: user?.name || 'Candidate',
        skills: parseJson(profile?.skills, []),
        experience_years: profile?.experience_years || 0,
        headline: profile?.headline,
        education: profile?.education,
        portfolio_projects: portfolios.map(p => ({
          title: p.title,
          skills_used: parseJson(p.skills_used, []),
          description: p.description || ''
        })),
        badges: badges.map(b => ({
          skill_name: b.skill_name,
          level: b.level,
          score_percentage: b.score_percentage
        }))
      };

      // If practicing for a specific job, fetch job details
      let jobContext: JobContext | null = null;
      let jobTitle = '';
      if (job_id) {
        const job = await Job.findOne({ id: job_id }).lean();
        if (job) {
          jobTitle = job.title;
          jobContext = {
            title: job.title,
            description: job.description || '',
            required_skills: parseJson(job.required_skills, []),
            preferred_skills: parseJson(job.preferred_skills, []),
            experience_level: job.experience_level || 'Mid-Level',
            responsibilities: job.responsibilities || ''
          };
        }
      }

      const targetRole = jobTitle || role;
      const numQuestions = MockInterviewAIService.questionsForDuration(Number(duration_minutes));
      const questions = await MockInterviewAIService.selectQuestions(
        targetRole,
        interview_type,
        difficulty,
        numQuestions,
        jobContext,
        candidateContext
      );

      const greeting = MockInterviewAIService.generateGreeting(
        targetRole,
        interview_type,
        difficulty,
        user?.name || 'there'
      );

      const sessionId = uuidv4();
      const now = new Date().toISOString();

      await MockInterview.create({
        id: sessionId,
        user_id: userId,
        target_role: targetRole,
        role: targetRole,
        job_id: job_id || null,
        interview_type,
        difficulty,
        duration_minutes: Number(duration_minutes),
        questions,
        answers: [],
        overall_score: 0,
        category_scores: {},
        feedback: {},
        strengths: [],
        areas_to_improve: [],
        recommendations: [],
        status: 'in_progress',
        conversation_log: [],
        created_at: now
      });

      res.status(201).json({
        success: true,
        session: {
          id: sessionId,
          role: targetRole,
          job_id,
          interview_type,
          difficulty,
          duration_minutes: Number(duration_minutes),
          greeting,
          total_questions: questions.length,
          current_question_index: 0,
          current_question: questions[0],
          status: 'in_progress'
        }
      });
    } catch (err: any) {
      console.error('Error starting mock interview session:', err);
      res.status(500).json({ success: false, message: 'Failed to initialize AI mock interview', error: err.message });
    }
  }

  /**
   * Submit an answer to the current question
   */
  static async submitAnswer(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const sessionId = String(req.params.id);
      const { answer, question_id } = req.body;

      if (!answer || !answer.trim()) {
        res.status(400).json({ success: false, message: 'Answer cannot be empty' });
        return;
      }

      const session = await MockInterview.findOne({ id: sessionId, user_id: userId });
      if (!session) {
        res.status(404).json({ success: false, message: 'Mock interview session not found' });
        return;
      }

      if (session.status === 'completed') {
        res.status(400).json({ success: false, message: 'This interview session is already completed' });
        return;
      }

      const questions: InterviewQuestion[] = parseJson(session.questions, []);
      const answers: Array<{
        question_id: string;
        question: string;
        answer: string;
        evaluation: AnswerEvaluation;
        answered_at: string;
      }> = parseJson(session.answers, []);

      // Find current question
      let currentQuestion = questions.find(q => q.id === question_id);
      if (!currentQuestion) {
        currentQuestion = questions[answers.length] || questions[0];
      }

      // Evaluate answer with AI engine
      const evaluation = await MockInterviewAIService.evaluateAnswer(
        currentQuestion.question,
        answer,
        currentQuestion.expected_keywords || [],
        session.difficulty || 'Intermediate',
        session.role || 'Software Professional'
      );

      // Save answer & evaluation
      answers.push({
        question_id: currentQuestion.id,
        question: currentQuestion.question,
        answer,
        evaluation,
        answered_at: new Date().toISOString()
      });

      let nextQuestion: InterviewQuestion | null = null;
      let isComplete = false;

      // Check if we should inject a follow-up question
      const alreadyHadFollowUp = questions.some(q => q.follow_up);
      let followUp: InterviewQuestion | null = null;

      if (!alreadyHadFollowUp && answers.length < questions.length) {
        followUp = MockInterviewAIService.generateFollowUp(
          currentQuestion.question,
          answer,
          currentQuestion.skill_focus,
          session.role || 'Software Engineer'
        );
      }

      if (followUp) {
        const insertIndex = answers.length;
        questions.splice(insertIndex, 0, followUp);
        nextQuestion = followUp;
      } else {
        const answeredIds = new Set(answers.map(a => a.question_id));
        nextQuestion = questions.find(q => !answeredIds.has(q.id)) || null;
      }

      if (!nextQuestion) {
        isComplete = true;
      }

      session.questions = questions;
      session.answers = answers;
      session.markModified('questions');
      session.markModified('answers');
      await session.save();

      if (isComplete) {
        await MockInterviewController.finalizeSession(sessionId, userId, res, req.ip);
        return;
      }

      const nextIndex = answers.length;

      res.json({
        success: true,
        evaluation,
        next_question: nextQuestion,
        current_question_index: nextIndex,
        total_questions: questions.length,
        is_complete: false
      });
    } catch (err: any) {
      console.error('Error submitting mock interview answer:', err);
      res.status(500).json({ success: false, message: 'Failed to evaluate answer', error: err.message });
    }
  }

  /**
   * Complete the session and calculate overall feedback
   */
  static async completeSession(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const sessionId = String(req.params.id);
    await MockInterviewController.finalizeSession(sessionId, userId, res, req.ip);
  }

  private static async finalizeSession(sessionId: string, userId: string, res: Response, ipAddress?: string | string[]): Promise<void> {
    try {
      const session = await MockInterview.findOne({ id: sessionId, user_id: userId });
      if (!session) {
        res.status(404).json({ success: false, message: 'Session not found' });
        return;
      }

      const answers: Array<{
        question_id: string;
        question: string;
        answer: string;
        evaluation: AnswerEvaluation;
      }> = parseJson(session.answers, []);

      const qaList = answers.map(a => ({
        question: a.question,
        answer: a.answer,
        evaluation: a.evaluation
      }));

      const feedback = MockInterviewAIService.generateSessionFeedback(qaList, session.role || 'Software Engineer');
      const now = new Date().toISOString();

      session.overall_score = feedback.overall_score;
      session.category_scores = feedback.category_scores;
      session.feedback = {
        summary: `Completed ${session.interview_type} mock interview for ${session.role}. Overall performance: ${feedback.overall_score}/100.`
      };
      session.strengths = feedback.strengths;
      session.areas_to_improve = feedback.areas_to_improve;
      session.recommendations = feedback.recommendations;
      session.status = 'completed';
      session.completed_at = now;

      session.markModified('category_scores');
      session.markModified('feedback');
      session.markModified('strengths');
      session.markModified('areas_to_improve');
      session.markModified('recommendations');
      await session.save();

      // Notify candidate
      createNotification(
        userId,
        'assessment_completed',
        'AI Mock Interview Completed',
        `You scored ${feedback.overall_score}/100 on your ${session.role} mock interview!`,
        `/candidate/mock-interview/history`
      );

      // Log audit event
      const targetRole = session.role || session.target_role || 'General Role';
      logAuditEvent(userId, 'MOCK_INTERVIEW_COMPLETED', 'AUTH', (Array.isArray(ipAddress) ? ipAddress[0] : ipAddress) || '127.0.0.1', {
        interviewId: sessionId,
        target_role: targetRole,
        overall_score: feedback.overall_score
      });

      const updated = await MockInterview.findOne({ id: sessionId }).lean();

      res.json({
        success: true,
        message: 'Interview session completed successfully',
        is_complete: true,
        session: {
          ...updated,
          questions: parseJson(updated?.questions, []),
          answers: parseJson(updated?.answers, []),
          category_scores: parseJson(updated?.category_scores, {}),
          strengths: parseJson(updated?.strengths, []),
          areas_to_improve: parseJson(updated?.areas_to_improve, []),
          recommendations: parseJson(updated?.recommendations, [])
        }
      });
    } catch (err: any) {
      console.error('Finalize mock interview session error:', err);
      res.status(500).json({ success: false, message: 'Failed to finalize session', error: err.message });
    }
  }

  /**
   * Get single session by ID
   */
  static async getSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const sessionId = String(req.params.id);

      const session = await MockInterview.findOne({ id: sessionId }).lean();
      if (!session) {
        res.status(404).json({ success: false, message: 'Session not found' });
        return;
      }

      // Privacy check: candidate can only view their own session
      // Recruiters/employers only allowed if user is admin
      if (session.user_id !== userId && req.user!.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Access denied to this mock interview' });
        return;
      }

      res.json({
        success: true,
        session: {
          ...session,
          questions: parseJson(session.questions, []),
          answers: parseJson(session.answers, []),
          category_scores: parseJson(session.category_scores, {}),
          strengths: parseJson(session.strengths, []),
          areas_to_improve: parseJson(session.areas_to_improve, []),
          recommendations: parseJson(session.recommendations, [])
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to get session', error: err.message });
    }
  }

  /**
   * Get history of mock interviews for current user
   */
  static async getHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const rows = await MockInterview.find({ user_id: userId }).sort({ created_at: -1 }).lean();

      const history = rows.map(r => ({
        id: r.id,
        role: r.role || r.target_role,
        job_id: r.job_id,
        interview_type: r.interview_type,
        difficulty: r.difficulty,
        duration_minutes: r.duration_minutes,
        overall_score: r.overall_score,
        category_scores: parseJson(r.category_scores, {}),
        feedback: r.feedback,
        status: r.status,
        created_at: r.created_at,
        completed_at: r.completed_at
      }));

      res.json({ success: true, history });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to get history', error: err.message });
    }
  }

  /**
   * Delete a mock interview session
   */
  static async deleteSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const sessionId = String(req.params.id);

      await MockInterview.deleteOne({ id: sessionId, user_id: userId });
      res.json({ success: true, message: 'Mock interview session deleted' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete session', error: err.message });
    }
  }
}
