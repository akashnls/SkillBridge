import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Application } from '../models/Application.js';
import { ApplicationEvent } from '../models/ApplicationEvent.js';
import { Job } from '../models/Job.js';
import { User } from '../models/User.js';
import { Badge } from '../models/Badge.js';
import { Portfolio } from '../models/Portfolio.js';
import { Resume } from '../models/Resume.js';
import { CandidateSkill } from '../models/CandidateSkill.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { computeJobFitScore } from '../services/matching.service.js';
import { logAuditEvent } from '../middleware/audit.middleware.js';
import { createNotification } from '../services/notify.service.js';
import { sendApplicationStatusEmail, sendApplicationSummaryEmail } from '../services/email.service.js';

export class ApplicationController {
  static async apply(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { job_id, cover_letter, additional_info, resume_id } = req.body;

      if (!userId || !job_id) {
        res.status(400).json({ success: false, message: 'Job ID is required' });
        return;
      }

      const existingApp = await Application.findOne({ job_id, user_id: userId });
      if (existingApp) {
        res.status(409).json({ success: false, message: 'You have already applied for this position.' });
        return;
      }

      const fitScoreResult = await computeJobFitScore(userId, job_id);
      const appId = `app-${uuidv4()}`;
      const now = new Date().toISOString();

      await Application.create({
        id: appId,
        job_id,
        user_id: userId,
        fit_score: fitScoreResult.overall_percentage,
        fit_score_breakdown: fitScoreResult,
        status: 'Applied',
        cover_letter: cover_letter || '',
        created_at: now,
        updated_at: now,
        additional_info: additional_info || '',
        resume_id: resume_id || null
      });

      await ApplicationEvent.create({
        id: uuidv4(),
        application_id: appId,
        status: 'Applied',
        actor_id: userId,
        note: 'Application submitted',
        created_at: now
      });

      const job = await Job.findOne({ id: job_id }).lean();
      createNotification(userId, 'application_submitted', 'Application submitted', `You applied for ${job?.title || 'a role'}.`, '/candidate/applications');
      if (job?.employer_id) {
        createNotification(job.employer_id, 'new_application', 'New application', `${req.user?.name} applied for ${job.title}.`, '/recruiter/applications');
      }

      const candidate = await User.findOne({ id: userId }).lean();
      if (candidate?.email) {
        sendApplicationStatusEmail(
          candidate.email,
          candidate.name || 'Applicant',
          job?.title || 'Unknown Position',
          job?.company_name || 'Unknown Company',
          'Applied'
        ).then(result => {
          if (!result.success) {
            console.warn(`[apply] Email not sent to ${candidate.email}: ${result.error}`);
          }
        });
      }

      // Gather candidate profile & credentials to send application summary email to recruiter
      try {
        const [primaryResume, candidateSkills, activeBadges, recruiter] = await Promise.all([
          Resume.findOne({ user_id: userId, is_primary: true }).lean(),
          CandidateSkill.find({ user_id: userId }).select('skill_name proficiency category is_verified').lean(),
          Badge.find({ user_id: userId, status: 'active' }).select('skill_name level verification_hash badge_code score_percentage').lean(),
          job?.employer_id ? User.findOne({ id: job.employer_id }).select('name email').lean() : Promise.resolve(null)
        ]);

        if (recruiter?.email) {
          sendApplicationSummaryEmail({
            recruiterEmail: recruiter.email,
            recruiterName: recruiter.name || 'Hiring Team',
            candidateName: candidate?.name || req.user?.name || 'Applicant',
            candidateEmail: candidate?.email || req.user?.email,
            jobTitle: job?.title || 'Unknown Position',
            companyName: job?.company_name || 'Your Company',
            fitScore: fitScoreResult.overall_percentage,
            coverLetter: cover_letter || '',
            resumeText: primaryResume?.content_text || '',
            skills: candidateSkills || [],
            badges: activeBadges || []
          }).then(result => {
            if (!result.success) {
              console.warn(`[apply] Recruiter summary email not sent to ${recruiter.email}: ${result.error}`);
            }
          });
        }
      } catch (err) {
        console.error('Failed to prepare recruiter application summary email:', err);
      }

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

  static async getMyApplications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const apps = await Application.find({ user_id: userId }).sort({ created_at: -1 }).lean();

      const formatted = await Promise.all(
        apps.map(async a => {
          const job = await Job.findOne({ id: a.job_id }).lean();
          return {
            ...a,
            job_title: job?.title || 'Unknown Job',
            company_name: job?.company_name || 'Unknown Company',
            location: job?.location || 'Remote',
            job_type: job?.job_type || 'Full-time',
            salary_range: job?.salary_range || '',
            fit_score_breakdown: typeof a.fit_score_breakdown === 'string'
              ? JSON.parse(a.fit_score_breakdown || '{}')
              : (a.fit_score_breakdown || {})
          };
        })
      );

      res.json({ success: true, applications: formatted });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve applications', error: error.message });
    }
  }

  static async getJobApplicants(req: AuthRequest, res: Response): Promise<void> {
    try {
      const employerId = req.user?.id;
      const { jobId } = req.params;
      const { status } = req.query;

      // Verify job ownership
      const job = await Job.findOne({ id: jobId, employer_id: employerId }).lean();
      if (!job) {
        res.status(403).json({ success: false, message: 'Unauthorized or job not found' });
        return;
      }

      const filter: any = { job_id: jobId };
      if (status) {
        filter.status = status;
      }

      const apps = await Application.find(filter)
        .sort({ fit_score: -1, created_at: -1 })
        .lean();

      const formatted = await Promise.all(
        apps.map(async a => {
          const user = await User.findOne({ id: a.user_id }).lean();
          const profile = user?.profile || {};
          const badges = await Badge.find({ user_id: a.user_id, status: 'active' }).lean();
          const portfolios = await Portfolio.find({ user_id: a.user_id }).lean();

          return {
            ...a,
            candidate_name: user?.name || 'Applicant',
            candidate_email: user?.email || '',
            candidate_avatar: user?.avatar_url || null,
            candidate_headline: profile.headline || '',
            experience_years: profile.experience_years || 0,
            candidate_location: profile.location || '',
            education: profile.education || '',
            github_url: profile.github_url || '',
            linkedin_url: profile.linkedin_url || '',
            portfolio_website: profile.portfolio_website || '',
            fit_score_breakdown: typeof a.fit_score_breakdown === 'string'
              ? JSON.parse(a.fit_score_breakdown || '{}')
              : (a.fit_score_breakdown || {}),
            earned_badges_count: badges.length,
            badges,
            portfolios: portfolios.map(p => ({
              ...p,
              skills_used: Array.isArray(p.skills_used)
                ? p.skills_used
                : (typeof p.skills_used === 'string' ? JSON.parse(p.skills_used || '[]') : [])
            }))
          };
        })
      );

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

  static async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const employerId = req.user?.id;
      const id = req.params.id as string;
      const { status } = req.body;

      if (!['Applied', 'Under Review', 'Shortlisted', 'Interviewing', 'Offered', 'Rejected'].includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid status' });
        return;
      }

      // Check authorization
      const app = await Application.findOne({ id });
      if (!app) {
        res.status(403).json({ success: false, message: 'Unauthorized or application not found' });
        return;
      }

      const job = await Job.findOne({ id: app.job_id, employer_id: employerId }).lean();
      if (!job && req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Unauthorized or application not found' });
        return;
      }

      const now = new Date().toISOString();
      app.status = status;
      app.updated_at = now;
      await app.save();

      await ApplicationEvent.create({
        id: uuidv4(),
        application_id: id,
        status,
        actor_id: employerId,
        note: `Status changed to ${status}`,
        created_at: now
      });

      const candidate = await User.findOne({ id: app.user_id }).lean();
      createNotification(app.user_id, 'application_status', 'Application update', `Your application for ${job?.title || 'the position'} is now ${status}.`, '/candidate/applications');

      // Send professional email notification to the job seeker
      if (candidate?.email) {
        sendApplicationStatusEmail(
          candidate.email,
          candidate.name || 'Applicant',
          job?.title || 'Unknown Position',
          job?.company_name || 'Unknown Company',
          status
        ).then(result => {
          if (!result.success) {
            console.warn(`[updateStatus] Email not sent to ${candidate?.email}: ${result.error}`);
          }
        });
      }

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
