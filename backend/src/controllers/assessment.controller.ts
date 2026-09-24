import { Request, Response } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { Assessment } from '../models/Assessment.js';
import { AssessmentAttempt } from '../models/AssessmentAttempt.js';
import { Badge } from '../models/Badge.js';
import { User } from '../models/User.js';
import { CandidateSkill } from '../models/CandidateSkill.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { logAuditEvent } from '../middleware/audit.middleware.js';
import { createNotification } from '../services/notify.service.js';

const BADGE_SECRET_KEY = process.env.BADGE_SECRET_KEY || 'SKILLBRIDGE_SECRET_KEY';

export class AssessmentController {
  static async getAssessments(req: Request, res: Response): Promise<void> {
    try {
      const assessments = await Assessment.find().lean();

      const formatted = assessments.map(a => {
        const questionsList = Array.isArray(a.questions)
          ? a.questions
          : (typeof a.questions === 'string' ? JSON.parse(a.questions || '[]') : []);
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

  static async getAssessmentById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const assessment = await Assessment.findOne({ id }).lean();

      if (!assessment) {
        res.status(404).json({ success: false, message: 'Assessment not found' });
        return;
      }

      const questionsList = Array.isArray(assessment.questions)
        ? assessment.questions
        : (typeof assessment.questions === 'string' ? JSON.parse(assessment.questions || '[]') : []);

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

  static async submitAssessment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { answers } = req.body; // Array of { question_id: string, selected_index: number }

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const assessment = await Assessment.findOne({ id }).lean();
      if (!assessment) {
        res.status(404).json({ success: false, message: 'Assessment not found' });
        return;
      }

      const questionsList = Array.isArray(assessment.questions)
        ? assessment.questions
        : (typeof assessment.questions === 'string' ? JSON.parse(assessment.questions || '[]') : []);

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
      const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
      const passed = scorePercentage >= assessment.pass_percentage;

      let badge: any = null;
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
        const existingBadge = await Badge.findOne({
          user_id: userId,
          skill_name: { $regex: new RegExp(`^${assessment.skill_name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });

        if (existingBadge) {
          existingBadge.score_percentage = scorePercentage;
          existingBadge.level = level;
          existingBadge.issued_at = issuedAt;
          existingBadge.verification_hash = verificationHash;
          existingBadge.badge_code = badgeCode;
          await existingBadge.save();
          badge = {
            id: existingBadge.id,
            badge_code: badgeCode,
            skill_name: assessment.skill_name,
            score_percentage: scorePercentage,
            level,
            issued_at: issuedAt,
            verification_hash: verificationHash
          };
        } else {
          await Badge.create({
            id: badgeId,
            badge_code: badgeCode,
            user_id: userId,
            skill_name: assessment.skill_name,
            assessment_id: assessment.id,
            score_percentage: scorePercentage,
            level,
            issued_at: issuedAt,
            verification_hash: verificationHash,
            status: 'active'
          });
          badge = {
            id: badgeId,
            badge_code: badgeCode,
            skill_name: assessment.skill_name,
            score_percentage: scorePercentage,
            level,
            issued_at: issuedAt,
            verification_hash: verificationHash
          };
        }

        // Add skill to user claimed skills list if not already present
        const user = await User.findOne({ id: userId });
        if (user) {
          if (!user.profile) {
            user.profile = {};
          }
          const currentSkills: string[] = Array.isArray(user.profile.skills) ? user.profile.skills : [];
          if (!currentSkills.some(s => s.toLowerCase() === assessment.skill_name.toLowerCase())) {
            currentSkills.push(assessment.skill_name);
            user.profile.skills = currentSkills;
            user.markModified('profile');
            await user.save();
          }
        }

        logAuditEvent(userId, 'BADGE_ISSUED', 'BADGE_ISSUED', req.ip || '127.0.0.1', {
          badge_code: badgeCode,
          skill: assessment.skill_name,
          score: scorePercentage
        });
      }

      const now = new Date().toISOString();
      const attemptId = `att-${uuidv4()}`;
      const timeTaken = typeof req.body.time_taken_seconds === 'number' ? req.body.time_taken_seconds : 0;
      const skillLevel = passed
        ? (scorePercentage >= 90 ? 'Expert' : scorePercentage >= 80 ? 'Advanced' : 'Intermediate')
        : 'Needs Improvement';

      await AssessmentAttempt.create({
        id: attemptId,
        assessment_id: assessment.id,
        user_id: userId,
        started_at: req.body.started_at || now,
        submitted_at: now,
        score_percentage: scorePercentage,
        correct_count: correctCount,
        incorrect_count: totalQuestions - correctCount,
        time_taken_seconds: timeTaken,
        passed,
        skill_level: skillLevel
      });

      createNotification(
        userId,
        'assessment_result',
        passed ? 'Assessment passed' : 'Assessment completed',
        `${assessment.skill_name}: ${scorePercentage}% (${skillLevel})`,
        '/candidate/assessments'
      );

      if (passed) {
        createNotification(userId, 'badge_earned', 'Badge earned', `You earned a ${assessment.skill_name} credential.`, '/candidate/badges');
        const skillRow = await CandidateSkill.findOne({
          user_id: userId,
          skill_name: { $regex: new RegExp(`^${assessment.skill_name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });

        if (skillRow) {
          skillRow.is_verified = true;
          skillRow.proficiency = skillLevel;
          await skillRow.save();
        } else {
          await CandidateSkill.create({
            id: uuidv4(),
            user_id: userId,
            skill_name: assessment.skill_name,
            category: assessment.category || 'Technical',
            proficiency: skillLevel,
            is_verified: true,
            source: 'assessment'
          });
        }
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

  static async getMyBadges(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const badges = await Badge.find({ user_id: userId, status: 'active' }).sort({ issued_at: -1 }).lean();
      res.json({ success: true, badges });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve badges', error: error.message });
    }
  }

  /**
   * Public Micro-Credential Digital Badge Verification Endpoint
   */
  static async verifyBadgePublic(req: Request, res: Response): Promise<void> {
    try {
      const { badgeCode } = req.params;

      const badge = await Badge.findOne({
        $or: [{ badge_code: badgeCode }, { id: badgeCode }]
      }).lean();

      if (!badge) {
        res.status(404).json({
          success: false,
          verified: false,
          message: 'Invalid badge code or micro-credential not found in immutable registry.'
        });
        return;
      }

      const recipient = await User.findOne({ id: badge.user_id }).lean();
      const assessment = await Assessment.findOne({ id: badge.assessment_id }).lean();

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
          assessment_title: assessment?.title || badge.skill_name,
          category: assessment?.category || 'Technical',
          recipient_name: recipient?.name || 'Candidate',
          recipient_avatar: recipient?.avatar_url || null,
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
