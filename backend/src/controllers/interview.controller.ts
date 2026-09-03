import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { AIService } from '../services/ai.service.js';
import { logAuditEvent } from '../middleware/audit.middleware.js';

export class InterviewController {
  static getQuestions(req: AuthRequest, res: Response): void {
    try {
      const { role = 'Full Stack Developer', difficulty = 'Intermediate' } = req.query;
      const questions = AIService.getMockInterviewQuestions(role as string, difficulty as string);
      res.json({ success: true, role, difficulty, questions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to generate interview questions', error: error.message });
    }
  }

  static evaluateResponse(req: AuthRequest, res: Response): void {
    try {
      const { question, answer, expected_keywords = [] } = req.body;

      if (!question || !answer) {
        res.status(400).json({ success: false, message: 'Question and answer are required' });
        return;
      }

      const evaluation = AIService.evaluateInterviewAnswer(question, answer, expected_keywords);

      res.json({
        success: true,
        evaluation
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to evaluate answer', error: error.message });
    }
  }

  static saveSession(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id;
      const { target_role, difficulty, overall_score, feedback, conversation_log } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const interviewId = `mock-${uuidv4()}`;
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO mock_interviews (id, user_id, target_role, difficulty, overall_score, feedback, conversation_log, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        interviewId,
        userId,
        target_role || 'General Role',
        difficulty || 'Intermediate',
        overall_score || 75,
        JSON.stringify(feedback || {}),
        JSON.stringify(conversation_log || []),
        now
      );

      logAuditEvent(userId, 'MOCK_INTERVIEW_COMPLETED', 'AUTH', req.ip || '127.0.0.1', {
        interviewId,
        target_role,
        score: overall_score
      });

      res.status(201).json({
        success: true,
        message: 'Mock interview session saved successfully',
        interviewId
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to save session', error: error.message });
    }
  }

  static getHistory(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id;
      const records = db.prepare('SELECT * FROM mock_interviews WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];

      const formatted = records.map(r => ({
        ...r,
        feedback: JSON.parse(r.feedback || '{}'),
        conversation_log: JSON.parse(r.conversation_log || '[]')
      }));

      res.json({ success: true, interviews: formatted });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve interview history', error: error.message });
    }
  }
}
