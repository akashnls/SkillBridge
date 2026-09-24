import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { computeJobFitScore } from '../services/matching.service.js';
import { Job } from '../models/Job.js';
import { logAuditEvent } from '../middleware/audit.middleware.js';

export class MatchController {
  static async getJobFitExplanation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const jobId = req.params.jobId as string;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const explanation = await computeJobFitScore(userId, jobId);

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

  static async getRecommendations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const jobs = await Job.find({ status: 'open' }).lean();

      const matchPromises = jobs.map(async (job) => {
        try {
          const fit = await computeJobFitScore(userId, job.id);
          return {
            job: {
              id: job.id,
              title: job.title,
              company_name: job.company_name,
              location: job.location,
              job_type: job.job_type,
              salary_range: job.salary_range,
              required_skills: Array.isArray(job.required_skills) ? job.required_skills : JSON.parse((job.required_skills as any) || '[]')
            },
            fit
          };
        } catch (e) {
          return null;
        }
      });

      const results = await Promise.all(matchPromises);
      const matches = results.filter(Boolean) as any[];

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
