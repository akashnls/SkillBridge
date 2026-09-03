import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { computeJobFitScore } from '../services/matching.service.js';
import { db } from '../db/database.js';
import { logAuditEvent } from '../middleware/audit.middleware.js';

export class MatchController {
  static getJobFitExplanation(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id;
      const jobId = req.params.jobId as string;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const explanation = computeJobFitScore(userId, jobId);

      logAuditEvent(userId, 'MATCH_COMPUTED', 'MATCH_COMPUTED', req.ip, {
        jobId,
        fit_score: explanation.overall_percentage,
        verified_count: explanation.matched_skills.filter(s => s.is_verified).length
      });

      res.json({
        success: true,
        jobId,
        match: explanation
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to compute fit score', error: error.message });
    }
  }

  static getRecommendations(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const jobs = db.prepare("SELECT * FROM jobs WHERE status = 'open'").all() as any[];

      const matches = jobs.map(job => {
        try {
          const fit = computeJobFitScore(userId, job.id);
          return {
            job: {
              id: job.id,
              title: job.title,
              company_name: job.company_name,
              location: job.location,
              job_type: job.job_type,
              salary_range: job.salary_range,
              required_skills: JSON.parse(job.required_skills || '[]')
            },
            fit
          };
        } catch (e) {
          return null;
        }
      }).filter(Boolean) as any[];

      // Sort descending by match score
      matches.sort((a, b) => b.fit.overall_percentage - a.fit.overall_percentage);

      res.json({
        success: true,
        recommendations: matches.slice(0, 10)
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve recommendations', error: error.message });
    }
  }
}
