import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Job } from '../models/Job.js';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { Application } from '../models/Application.js';
import { PlatformSetting } from '../models/PlatformSetting.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { computeJobFitScore } from '../services/matching.service.js';
import { logAuditEvent } from '../middleware/audit.middleware.js';

export class JobController {
  static async getAllJobs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { search, job_type, experience_level, location, status } = req.query;

      const filter: any = {
        moderation_status: { $in: ['approved', null, undefined] }
      };

      if (status) {
        filter.status = { $regex: new RegExp(`^${String(status).trim()}$`, 'i') };
      } else {
        filter.status = { $in: ['open', 'active'] };
      }

      if (job_type) {
        filter.job_type = String(job_type);
      }
      if (experience_level) {
        filter.experience_level = String(experience_level);
      }
      if (location) {
        filter.location = { $regex: new RegExp(String(location).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') };
      }

      if (search) {
        const searchRegex = new RegExp(String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [
          { title: searchRegex },
          { description: searchRegex },
          { company_name: searchRegex }
        ];
      }

      const jobs = await Job.find(filter).sort({ created_at: -1 }).lean();

      const formattedJobs = await Promise.all(
        jobs.map(async job => {
          const recruiter = await User.findOne({ id: job.employer_id }, { name: 1, avatar_url: 1 }).lean();
          const requiredSkills = Array.isArray(job.required_skills)
            ? job.required_skills
            : (typeof job.required_skills === 'string' ? JSON.parse(job.required_skills || '[]') : []);
          const preferredSkills = Array.isArray(job.preferred_skills)
            ? job.preferred_skills
            : (typeof job.preferred_skills === 'string' ? JSON.parse(job.preferred_skills || '[]') : []);

          let userFitScore: number | null = null;
          let matchSummary: any = null;

          // If logged-in user is a job seeker, compute fit score
          if (req.user && req.user.role === 'job_seeker') {
            try {
              const fit = await computeJobFitScore(req.user.id, job.id);
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
            recruiter_name: recruiter?.name || 'Recruiter',
            required_skills: requiredSkills,
            preferred_skills: preferredSkills,
            user_fit_score: userFitScore,
            match_summary: matchSummary
          };
        })
      );

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

  static async getJobById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const job = await Job.findOne({ id }).lean();

      if (!job) {
        res.status(404).json({ success: false, message: 'Job posting not found' });
        return;
      }

      await Job.updateOne({ id }, { $inc: { views_count: 1 } });

      const recruiter = await User.findOne({ id: job.employer_id }, { name: 1, avatar_url: 1 }).lean();
      const requiredSkills = Array.isArray(job.required_skills)
        ? job.required_skills
        : (typeof job.required_skills === 'string' ? JSON.parse(job.required_skills || '[]') : []);
      const preferredSkills = Array.isArray(job.preferred_skills)
        ? job.preferred_skills
        : (typeof job.preferred_skills === 'string' ? JSON.parse(job.preferred_skills || '[]') : []);

      // Get applicant count
      const applicantCount = await Application.countDocuments({ job_id: id });

      let fitExplanation = null;
      let hasApplied = false;

      if (req.user && req.user.role === 'job_seeker') {
        try {
          fitExplanation = await computeJobFitScore(req.user.id, job.id);
          const existingApp = await Application.findOne({ job_id: job.id, user_id: req.user.id });
          hasApplied = !!existingApp;
        } catch (e) {
          // ignore
        }
      }

      res.json({
        success: true,
        job: {
          ...job,
          recruiter_name: recruiter?.name || 'Recruiter',
          recruiter_avatar: recruiter?.avatar_url || null,
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

  static async createJob(req: AuthRequest, res: Response): Promise<void> {
    try {
      const employerId = req.user?.id;
      const { title, description, location, job_type, experience_level, salary_range, required_skills, preferred_skills } = req.body;

      if (!title || !description || !location || !job_type || !experience_level || !salary_range || !required_skills) {
        res.status(400).json({ success: false, message: 'All job fields including required skills are required.' });
        return;
      }

      const company = await Company.findOne({ user_id: employerId }).lean();
      const companyName = company?.name || req.user?.name || 'Hiring Enterprise';

      const jobId = `job-${uuidv4()}`;
      const now = new Date().toISOString();

      // Format required skills
      const reqSkillsFormatted = Array.isArray(required_skills)
        ? required_skills.map(s => typeof s === 'string' ? { skill: s, weight: 1.0 } : s)
        : [];

      const prefSkillsFormatted = Array.isArray(preferred_skills) ? preferred_skills : [];

      const approval = await PlatformSetting.findOne({ key: 'job_approval_required' }).lean();
      const needsApproval = approval?.value === '1';
      const status = req.body.save_draft ? 'draft' : needsApproval ? 'pending' : 'open';
      const moderation = needsApproval && !req.body.save_draft ? 'pending' : 'approved';

      await Job.create({
        id: jobId,
        employer_id: employerId,
        company_name: companyName,
        title,
        description,
        location,
        job_type,
        experience_level,
        salary_range,
        required_skills: reqSkillsFormatted,
        preferred_skills: prefSkillsFormatted,
        status,
        created_at: now,
        work_mode: req.body.work_mode || 'Hybrid',
        education_requirement: req.body.education_requirement || '',
        openings: req.body.openings || 1,
        application_deadline: req.body.application_deadline || '',
        responsibilities: req.body.responsibilities || '',
        benefits_text: req.body.benefits_text || '',
        moderation_status: moderation,
        views_count: 0
      });

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

  static async getMyPostedJobs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const employerId = req.user?.id;
      const jobs = await Job.find({ employer_id: employerId }).sort({ created_at: -1 }).lean();

      const jobsWithMetrics = await Promise.all(
        jobs.map(async job => {
          const apps = await Application.find({ job_id: job.id }).lean();
          const totalApplicants = apps.length;
          const avgFit = totalApplicants > 0
            ? Math.round((apps.reduce((sum, a) => sum + (Number(a.fit_score) || 0), 0) / totalApplicants) * 10) / 10
            : 0;
          const interviewingCount = apps.filter(a => a.status === 'Interviewing').length;
          const offeredCount = apps.filter(a => a.status === 'Offered').length;

          return {
            ...job,
            required_skills: Array.isArray(job.required_skills)
              ? job.required_skills
              : (typeof job.required_skills === 'string' ? JSON.parse(job.required_skills || '[]') : []),
            preferred_skills: Array.isArray(job.preferred_skills)
              ? job.preferred_skills
              : (typeof job.preferred_skills === 'string' ? JSON.parse(job.preferred_skills || '[]') : []),
            total_applicants: totalApplicants,
            avg_fit_score: avgFit,
            interviewing_count: interviewingCount,
            offered_count: offeredCount
          };
        })
      );

      res.json({ success: true, jobs: jobsWithMetrics });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch employer jobs', error: error.message });
    }
  }
}
