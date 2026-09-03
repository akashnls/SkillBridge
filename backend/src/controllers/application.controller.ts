import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { computeJobFitScore } from '../services/matching.service.js';
import { logAuditEvent } from '../middleware/audit.middleware.js';

export class ApplicationController {
  static apply(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id;
      const { job_id, cover_letter } = req.body;

      if (!userId || !job_id) {
        res.status(400).json({ success: false, message: 'Job ID is required' });
        return;
      }

      const existingApp = db.prepare('SELECT id FROM applications WHERE job_id = ? AND user_id = ?').get(job_id, userId);
      if (existingApp) {
        res.status(409).json({ success: false, message: 'You have already applied for this position.' });
        return;
      }

      const fitScoreResult = computeJobFitScore(userId, job_id);
      const appId = `app-${uuidv4()}`;
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO applications (id, job_id, user_id, fit_score, fit_score_breakdown, status, cover_letter, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'Applied', ?, ?, ?)
      `).run(
        appId,
        job_id,
        userId,
        fitScoreResult.overall_percentage,
        JSON.stringify(fitScoreResult),
        cover_letter || '',
        now,
        now
      );

      logAuditEvent(userId, 'APPLICATION_SUBMITTED', 'MATCH_COMPUTED', req.ip || '127.0.0.1', {
        job_id,
        appId,
        fit_score: fitScoreResult.overall_percentage
      });

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully with verified skill breakdown!',
        applicationId: appId,
        fit_score: fitScoreResult.overall_percentage
      });
    } catch (error: any) {
      console.error('Application submit error:', error);
      res.status(500).json({ success: false, message: 'Failed to submit application', error: error.message });
    }
  }

  static getMyApplications(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id;
      const apps = db.prepare(`
        SELECT a.*, j.title as job_title, j.company_name, j.location, j.job_type, j.salary_range
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        WHERE a.user_id = ?
        ORDER BY a.created_at DESC
      `).all(userId) as any[];

      const formatted = apps.map(a => ({
        ...a,
        fit_score_breakdown: JSON.parse(a.fit_score_breakdown || '{}')
      }));

      res.json({ success: true, applications: formatted });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve applications', error: error.message });
    }
  }

  static getJobApplicants(req: AuthRequest, res: Response): void {
    try {
      const employerId = req.user?.id;
      const { jobId } = req.params;
      const { status } = req.query;

      // Verify job ownership
      const job = db.prepare('SELECT * FROM jobs WHERE id = ? AND employer_id = ?').get(jobId, employerId) as any;
      if (!job) {
        res.status(403).json({ success: false, message: 'Unauthorized or job not found' });
        return;
      }

      let query = `
        SELECT a.*, u.name as candidate_name, u.email as candidate_email, u.avatar_url as candidate_avatar,
               p.headline as candidate_headline, p.experience_years, p.location as candidate_location,
               p.education, p.github_url, p.linkedin_url, p.portfolio_website
        FROM applications a
        JOIN users u ON a.user_id = u.id
        LEFT JOIN profiles p ON a.user_id = p.user_id
        WHERE a.job_id = ?
      `;
      const params: any[] = [jobId];

      if (status) {
        query += ' AND a.status = ?';
        params.push(status);
      }

      query += ' ORDER BY a.fit_score DESC, a.created_at DESC';

      const apps = db.prepare(query).all(...params) as any[];

      const formatted = apps.map(a => {
        // Fetch candidate's badges and portfolios
        const badges = db.prepare("SELECT * FROM badges WHERE user_id = ? AND status = 'active'").all(a.user_id) as any[];
        const portfolios = db.prepare('SELECT * FROM portfolios WHERE user_id = ?').all(a.user_id) as any[];

        return {
          ...a,
          fit_score_breakdown: JSON.parse(a.fit_score_breakdown || '{}'),
          earned_badges_count: badges.length,
          badges,
          portfolios: portfolios.map(p => ({ ...p, skills_used: JSON.parse(p.skills_used || '[]') }))
        };
      });

      res.json({
        success: true,
        job_title: job.title,
        total_applicants: formatted.length,
        applicants: formatted
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve applicants', error: error.message });
    }
  }

  static updateStatus(req: AuthRequest, res: Response): void {
    try {
      const employerId = req.user?.id;
      const { id } = req.params;
      const { status } = req.body;

      if (!['Applied', 'Under Review', 'Shortlisted', 'Interviewing', 'Offered', 'Rejected'].includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid status' });
        return;
      }

      // Check authorization
      const app = db.prepare(`
        SELECT a.id, a.user_id, a.job_id FROM applications a
        JOIN jobs j ON a.job_id = j.id
        WHERE a.id = ? AND j.employer_id = ?
      `).get(id, employerId);

      if (!app) {
        res.status(403).json({ success: false, message: 'Unauthorized or application not found' });
        return;
      }

      const now = new Date().toISOString();
      db.prepare('UPDATE applications SET status = ?, updated_at = ? WHERE id = ?').run(status, now, id);

      logAuditEvent(employerId || null, 'APPLICATION_STATUS_UPDATED', 'MATCH_COMPUTED', req.ip || '127.0.0.1', {
        applicationId: id,
        new_status: status
      });

      res.json({ success: true, message: `Application status updated to ${status}` });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
    }
  }
}
