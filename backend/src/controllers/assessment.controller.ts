import { Request, Response } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { logAuditEvent } from '../middleware/audit.middleware.js';

const BADGE_SECRET_KEY = process.env.BADGE_SECRET_KEY || 'SKILLBRIDGE_SECRET_KEY';

export class AssessmentController {
  static getAssessments(req: Request, res: Response): void {
    try {
      const assessments = db.prepare('SELECT id, skill_name, title, category, duration_minutes, pass_percentage, questions FROM assessments').all() as any[];

      const formatted = assessments.map(a => {
        const questionsList = JSON.parse(a.questions || '[]');
        return {
          id: a.id,
          skill_name: a.skill_name,
          title: a.title,
          category: a.category,
          duration_minutes: a.duration_minutes,
          pass_percentage: a.pass_percentage,
          total_questions: questionsList.length
        };
      });

      res.json({ success: true, assessments: formatted });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch assessments', error: error.message });
    }
  }

  static getAssessmentById(req: AuthRequest, res: Response): void {
    try {
      const { id } = req.params;
      const assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(id) as any;

      if (!assessment) {
        res.status(404).json({ success: false, message: 'Assessment not found' });
        return;
      }

      const questionsList = JSON.parse(assessment.questions || '[]');
      // Strip correct_index for test-taking integrity
      const sanitizedQuestions = questionsList.map((q: any) => ({
        id: q.id,
        question: q.question,
        options: q.options
      }));

      res.json({
        success: true,
        assessment: {
          id: assessment.id,
          skill_name: assessment.skill_name,
          title: assessment.title,
          category: assessment.category,
          duration_minutes: assessment.duration_minutes,
          pass_percentage: assessment.pass_percentage,
          total_questions: sanitizedQuestions.length,
          questions: sanitizedQuestions
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to load assessment', error: error.message });
    }
  }

  static submitAssessment(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { answers } = req.body; // Array of { question_id: string, selected_index: number }

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(id) as any;
      if (!assessment) {
        res.status(404).json({ success: false, message: 'Assessment not found' });
        return;
      }

      const questionsList = JSON.parse(assessment.questions || '[]');
      const answerMap = new Map<string, number>();
      if (Array.isArray(answers)) {
        answers.forEach((ans: any) => answerMap.set(ans.question_id, ans.selected_index));
      }

      let correctCount = 0;
      const questionResults = questionsList.map((q: any) => {
        const userSelected = answerMap.get(q.id);
        const isCorrect = userSelected === q.correct_index;
        if (isCorrect) correctCount++;

        return {
          id: q.id,
          question: q.question,
          options: q.options,
          user_selected: userSelected !== undefined ? userSelected : -1,
          correct_index: q.correct_index,
          is_correct: isCorrect,
          explanation: q.explanation
        };
      });

      const totalQuestions = questionsList.length;
      const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
      const passed = scorePercentage >= assessment.pass_percentage;

      let badge = null;
      if (passed) {
        const level = scorePercentage >= 90 ? 'Expert' : scorePercentage >= 80 ? 'Advanced' : 'Intermediate';
        const badgeCode = `SKB-${assessment.skill_name.toUpperCase().substring(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;
        const issuedAt = new Date().toISOString();
        const badgeId = `badge-${uuidv4()}`;

        // Cryptographic HMAC-SHA256 verification hash
        const verificationHash = crypto
          .createHmac('sha256', BADGE_SECRET_KEY)
          .update(`${badgeCode}:${userId}:${assessment.skill_name}:${scorePercentage}:${issuedAt}`)
          .digest('hex');

        // Check if existing badge for this skill already exists
        const existingBadge = db.prepare('SELECT id FROM badges WHERE user_id = ? AND skill_name = ?').get(userId, assessment.skill_name) as any;

        if (existingBadge) {
          db.prepare(`
            UPDATE badges
            SET score_percentage = ?, level = ?, issued_at = ?, verification_hash = ?, badge_code = ?
            WHERE id = ?
          `).run(scorePercentage, level, issuedAt, verificationHash, badgeCode, existingBadge.id);
          badge = { id: existingBadge.id, badge_code: badgeCode, skill_name: assessment.skill_name, score_percentage: scorePercentage, level, issued_at: issuedAt, verification_hash: verificationHash };
        } else {
          db.prepare(`
            INSERT INTO badges (id, badge_code, user_id, skill_name, assessment_id, score_percentage, level, issued_at, verification_hash, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
          `).run(badgeId, badgeCode, userId, assessment.skill_name, assessment.id, scorePercentage, level, issuedAt, verificationHash);
          badge = { id: badgeId, badge_code: badgeCode, skill_name: assessment.skill_name, score_percentage: scorePercentage, level, issued_at: issuedAt, verification_hash: verificationHash };
        }

        // Add skill to user claimed skills list if not already present
        const profile = db.prepare('SELECT skills FROM profiles WHERE user_id = ?').get(userId) as any;
        if (profile) {
          const currentSkills: string[] = JSON.parse(profile.skills || '[]');
          if (!currentSkills.includes(assessment.skill_name)) {
            currentSkills.push(assessment.skill_name);
            db.prepare('UPDATE profiles SET skills = ? WHERE user_id = ?').run(JSON.stringify(currentSkills), userId);
          }
        }

        logAuditEvent(userId, 'BADGE_ISSUED', 'BADGE_ISSUED', req.ip || '127.0.0.1', {
          badge_code: badgeCode,
          skill: assessment.skill_name,
          score: scorePercentage
        });
      }

      res.json({
        success: true,
        result: {
          assessment_id: assessment.id,
          skill_name: assessment.skill_name,
          total_questions: totalQuestions,
          correct_count: correctCount,
          score_percentage: scorePercentage,
          pass_percentage: assessment.pass_percentage,
          passed,
          badge,
          breakdown: questionResults
        }
      });
    } catch (error: any) {
      console.error('Submit assessment error:', error);
      res.status(500).json({ success: false, message: 'Failed to evaluate assessment', error: error.message });
    }
  }

  static getMyBadges(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id;
      const badges = db.prepare("SELECT * FROM badges WHERE user_id = ? AND status = 'active' ORDER BY issued_at DESC").all(userId) as any[];
      res.json({ success: true, badges });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve badges', error: error.message });
    }
  }

  /**
   * Public Micro-Credential Digital Badge Verification Endpoint
   */
  static verifyBadgePublic(req: Request, res: Response): void {
    try {
      const { badgeCode } = req.params;

      const badge = db.prepare(`
        SELECT b.*, u.name as recipient_name, u.avatar_url, a.title as assessment_title, a.category
        FROM badges b
        JOIN users u ON b.user_id = u.id
        JOIN assessments a ON b.assessment_id = a.id
        WHERE b.badge_code = ? OR b.id = ?
      `).get(badgeCode, badgeCode) as any;

      if (!badge) {
        res.status(404).json({
          success: false,
          verified: false,
          message: 'Invalid badge code or micro-credential not found in immutable registry.'
        });
        return;
      }

      // Re-compute hash to verify cryptographic integrity
      const expectedHash = crypto
        .createHmac('sha256', BADGE_SECRET_KEY)
        .update(`${badge.badge_code}:${badge.user_id}:${badge.skill_name}:${badge.score_percentage}:${badge.issued_at}`)
        .digest('hex');

      const isCryptographicallyValid = expectedHash === badge.verification_hash;

      res.json({
        success: true,
        verified: isCryptographicallyValid && badge.status === 'active',
        badge: {
          badge_code: badge.badge_code,
          skill_name: badge.skill_name,
          assessment_title: badge.assessment_title,
          category: badge.category,
          recipient_name: badge.recipient_name,
          recipient_avatar: badge.avatar_url,
          score_percentage: badge.score_percentage,
          level: badge.level,
          issued_at: badge.issued_at,
          verification_hash: badge.verification_hash,
          issuer: 'SkillBridge Micro-Credentialing Engine',
          cryptographic_algorithm: 'HMAC-SHA256 (256-bit)',
          status: badge.status
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Badge verification error', error: error.message });
    }
  }
}
