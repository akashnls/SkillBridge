import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { computeJobFitScore } from '../services/matching.service.js';
import { logAuditEvent } from '../middleware/audit.middleware.js';

export class JobController {
  static getAllJobs(req: AuthRequest, res: Response): void {
    try {
      const { search, job_type, experience_level, location } = req.query;

      let query = "SELECT j.*, u.name as recruiter_name FROM jobs j JOIN users u ON j.employer_id = u.id WHERE j.status = 'open'";
      const params: any[] = [];

      if (search) {
        query += ' AND (j.title LIKE ? OR j.description LIKE ? OR j.company_name LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      if (job_type) {
        query += ' AND j.job_type = ?';
        params.push(job_type);
      }
      if (experience_level) {
        query += ' AND j.experience_level = ?';
        params.push(experience_level);
      }
      if (location) {
        query += ' AND j.location LIKE ?';
        params.push(`%${location}%`);
      }

      query += ' ORDER BY j.created_at DESC';

      const jobs = db.prepare(query).all(...params) as any[];

      const formattedJobs = jobs.map(job => {
        const requiredSkills = JSON.parse(job.required_skills || '[]');
        const preferredSkills = JSON.parse(job.preferred_skills || '[]');

        let userFitScore: number | null = null;
        let matchSummary: any = null;

        // If logged-in user is a job seeker, compute fit score
        if (req.user && req.user.role === 'job_seeker') {
          try {
            const fit = computeJobFitScore(req.user.id, job.id);
            userFitScore = fit.overall_percentage;
            matchSummary = {
              matched_count: fit.matched_skills.length,
              verified_count: fit.matched_skills.filter(s => s.is_verified).length,
              missing_count: fit.missing_skills.length
            };
          } catch (e) {
            // Ignore if profile not fully initialized
          }
        }

        return {
          ...job,
          required_skills: requiredSkills,
          preferred_skills: preferredSkills,
          user_fit_score: userFitScore,
          match_summary: matchSummary
        };
      });

      // If user is candidate, sort by user_fit_score descending
      if (req.user && req.user.role === 'job_seeker') {
        formattedJobs.sort((a, b) => (b.user_fit_score || 0) - (a.user_fit_score || 0));
      }

      res.json({ success: true, count: formattedJobs.length, jobs: formattedJobs });
    } catch (error: any) {
      console.error('Get jobs error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch jobs', error: error.message });
    }
  }

  static getJobById(req: AuthRequest, res: Response): void {
    try {
      const { id } = req.params;
      const job = db.prepare('SELECT j.*, u.name as recruiter_name, u.avatar_url as recruiter_avatar FROM jobs j JOIN users u ON j.employer_id = u.id WHERE j.id = ?').get(id) as any;

      if (!job) {
        res.status(404).json({ success: false, message: 'Job posting not found' });
        return;
      }

      const requiredSkills = JSON.parse(job.required_skills || '[]');
      const preferredSkills = JSON.parse(job.preferred_skills || '[]');

      // Get applicant count
      const applicantCount = (db.prepare('SELECT COUNT(*) as count FROM applications WHERE job_id = ?').get(id) as any)?.count || 0;

      let fitExplanation = null;
      let hasApplied = false;

      if (req.user && req.user.role === 'job_seeker') {
        try {
          fitExplanation = computeJobFitScore(req.user.id, job.id);
          const existingApp = db.prepare('SELECT id, status, created_at FROM applications WHERE job_id = ? AND user_id = ?').get(job.id, req.user.id);
          hasApplied = !!existingApp;
        } catch (e) {
          // ignore
        }
      }

      res.json({
        success: true,
        job: {
          ...job,
          required_skills: requiredSkills,
          preferred_skills: preferredSkills,
          applicant_count: applicantCount,
          fit_explanation: fitExplanation,
          has_applied: hasApplied
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve job', error: error.message });
    }
  }

  static createJob(req: AuthRequest, res: Response): void {
    try {
      const employerId = req.user?.id;
      const { title, description, location, job_type, experience_level, salary_range, required_skills, preferred_skills } = req.body;

      if (!title || !description || !location || !job_type || !experience_level || !salary_range || !required_skills) {
        res.status(400).json({ success: false, message: 'All job fields including required skills are required.' });
        return;
      }

      const company = db.prepare('SELECT name FROM companies WHERE user_id = ?').get(employerId) as any;
      const companyName = company?.name || req.user?.name || 'Hiring Enterprise';

      const jobId = `job-${uuidv4()}`;
      const now = new Date().toISOString();

      // Format required skills
      const reqSkillsFormatted = Array.isArray(required_skills)
        ? required_skills.map(s => typeof s === 'string' ? { skill: s, weight: 1.0 } : s)
        : [];

      const prefSkillsFormatted = Array.isArray(preferred_skills) ? preferred_skills : [];

      db.prepare(`
        INSERT INTO jobs (id, employer_id, company_name, title, description, location, job_type, experience_level, salary_range, required_skills, preferred_skills, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)
      `).run(
        jobId,
        employerId,
        companyName,
        title,
        description,
        location,
        job_type,
        experience_level,
        salary_range,
        JSON.stringify(reqSkillsFormatted),
        JSON.stringify(prefSkillsFormatted),
        now
      );

      logAuditEvent(employerId || null, 'JOB_POSTED', 'JOB_POSTED', req.ip || '127.0.0.1', { jobId, title, companyName });

      res.status(201).json({
        success: true,
        message: 'Job posting created successfully',
        jobId
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to create job', error: error.message });
    }
  }

  static getMyPostedJobs(req: AuthRequest, res: Response): void {
    try {
      const employerId = req.user?.id;
      const jobs = db.prepare('SELECT * FROM jobs WHERE employer_id = ? ORDER BY created_at DESC').all(employerId) as any[];

      const jobsWithMetrics = jobs.map(job => {
        const applicantStats = db.prepare(`
          SELECT 
            COUNT(*) as total_applicants,
            AVG(fit_score) as avg_fit_score,
            SUM(CASE WHEN status = 'Offered' THEN 1 ELSE 0 END) as offered_count,
            SUM(CASE WHEN status = 'Interviewing' THEN 1 ELSE 0 END) as interviewing_count
          FROM applications WHERE job_id = ?
        `).get(job.id) as any;

        return {
          ...job,
          required_skills: JSON.parse(job.required_skills || '[]'),
          preferred_skills: JSON.parse(job.preferred_skills || '[]'),
          total_applicants: applicantStats.total_applicants || 0,
          avg_fit_score: applicantStats.avg_fit_score ? Math.round(applicantStats.avg_fit_score * 10) / 10 : 0,
          interviewing_count: applicantStats.interviewing_count || 0,
          offered_count: applicantStats.offered_count || 0
        };
      });

      res.json({ success: true, jobs: jobsWithMetrics });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch employer jobs', error: error.message });
    }
  }
}
