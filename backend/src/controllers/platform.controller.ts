import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { ApplicationEvent } from '../models/ApplicationEvent.js';
import { ScheduledInterview } from '../models/ScheduledInterview.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Notification } from '../models/Notification.js';
import { Report } from '../models/Report.js';
import { Badge } from '../models/Badge.js';
import { BadgeTemplate } from '../models/BadgeTemplate.js';
import { SkillTaxonomy } from '../models/SkillTaxonomy.js';
import { PlatformSetting } from '../models/PlatformSetting.js';
import { AuditLog } from '../models/AuditLog.js';
import { Assessment } from '../models/Assessment.js';
import { CandidateSkill } from '../models/CandidateSkill.js';
import { SavedJob } from '../models/SavedJob.js';
import { Resume } from '../models/Resume.js';
import { Portfolio } from '../models/Portfolio.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { logAuditEvent } from '../middleware/audit.middleware.js';
import { createNotification } from '../services/notify.service.js';
import { computeJobFitScore, computeDeterministicMatch } from '../services/matching.service.js';
import { sendAdminActionEmail, sendApplicationStatusEmail } from '../services/email.service.js';

function parseJson<T>(raw: any, fallback: T): T {
  try {
    if (raw === undefined || raw === null) return fallback;
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return fallback;
  }
}

function profileCompletion(profile: any, user: any): { percent: number; missing: string[] } {
  const missing: string[] = [];
  if (!user?.name) missing.push('Name');
  if (!user?.email) missing.push('Email');
  if (!profile?.phone) missing.push('Phone');
  if (!profile?.location) missing.push('Location');
  if (!profile?.headline) missing.push('Headline');
  if (!profile?.bio) missing.push('Career summary');
  if (!profile?.preferred_job_role) missing.push('Preferred role');
  const skills = parseJson<string[]>(profile?.skills, []);
  if (!skills || skills.length === 0) missing.push('Skills');
  const edu = parseJson<any[]>(profile?.education_entries, []);
  if (edu.length === 0 && !profile?.education) missing.push('Education');
  const exp = parseJson<any[]>(profile?.experience_entries, []);
  if (exp.length === 0) missing.push('Experience');
  const social = profile?.linkedin_url || profile?.github_url || profile?.portfolio_website;
  if (!social) missing.push('Social links');
  const total = 10;
  const filled = total - missing.length;
  return { percent: Math.round((filled / total) * 100), missing };
}

export class PlatformController {
  static async publicStats(_req: Request, res: Response): Promise<void> {
    try {
      const [jobs, companies, seekers, badges] = await Promise.all([
        Job.countDocuments({ status: { $in: ['open', 'active'] } }),
        Company.countDocuments({ status: 'active' }),
        User.countDocuments({ role: 'job_seeker', status: { $ne: 'suspended' }, account_deleted: { $ne: true } }),
        Badge.countDocuments({ status: 'active' })
      ]);
      res.json({ success: true, stats: { jobs, companies, seekers, badges } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve stats', error: error.message });
    }
  }

  static async listCompanies(_req: Request, res: Response): Promise<void> {
    try {
      const companies = await Company.find({ status: 'active' }).sort({ name: 1 }).lean();
      const formatted = await Promise.all(
        companies.map(async c => {
          const user = await User.findOne({ id: c.user_id }, { name: 1 }).lean();
          return {
            id: c.id,
            name: c.name,
            industry: c.industry,
            website: c.website || null,
            description: c.description || '',
            location: c.location || null,
            logo_url: c.logo_url || null,
            company_size: c.company_size || null,
            founded_year: c.founded_year || null,
            verification_status: c.verification_status || 'pending',
            status: c.status || 'active',
            email: c.email || null,
            phone: c.phone || null,
            culture_text: c.culture_text || null,
            recruiter_name: user?.name || 'Recruiter',
            benefits: parseJson(c.benefits, []),
            social_links: parseJson(c.social_links, {})
          };
        })
      );
      res.json({ success: true, companies: formatted });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to list companies', error: error.message });
    }
  }

  static async getCompanyPublic(req: Request, res: Response): Promise<void> {
    try {
      const company = await Company.findOne({ id: req.params.id, status: 'active' }).lean() || await Company.findOne({ id: req.params.id }).lean();
      if (!company) {
        res.status(404).json({ success: false, message: 'Company not found' });
        return;
      }
      const user = await User.findOne({ id: company.user_id }, { name: 1 }).lean();
      const jobs = await Job.find(
        { company_name: company.name, status: { $in: ['open', 'active'] } },
        { id: 1, title: 1, location: 1, job_type: 1, salary_range: 1, created_at: 1 }
      ).lean();

      res.json({
        success: true,
        company: {
          id: company.id,
          name: company.name,
          industry: company.industry,
          website: company.website || null,
          description: company.description || '',
          location: company.location || null,
          logo_url: company.logo_url || null,
          company_size: company.company_size || null,
          founded_year: company.founded_year || null,
          verification_status: company.verification_status || 'pending',
          status: company.status || 'active',
          email: company.email || null,
          phone: company.phone || null,
          culture_text: company.culture_text || null,
          recruiter_name: user?.name || 'Recruiter',
          benefits: parseJson(company.benefits, []),
          social_links: parseJson(company.social_links, {}),
          jobs
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to get company', error: error.message });
    }
  }

  static async candidateDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await User.findOne({ id: userId }).lean();
      const profile = user?.profile || {};
      const completion = profileCompletion(profile, user);
      const apps = await Application.find({ user_id: userId }).lean();
      const badgesCount = await Badge.countDocuments({ user_id: userId, status: 'active' });
      const skills = parseJson<string[]>(profile?.skills, []);

      const rawInterviews = await ScheduledInterview.find({ candidate_id: userId, status: 'scheduled' })
        .sort({ interview_date: 1 }).lean();
      const interviews = await Promise.all(
        rawInterviews.map(async si => {
          const job = await Job.findOne({ id: si.job_id }).lean();
          return {
            ...si,
            job_title: job?.title || 'Interview',
            company_name: job?.company_name || 'Company'
          };
        })
      );

      const recommendations = await Job.find({ status: { $in: ['open', 'active'] } }).limit(20).lean();
      const recsWithFit = await Promise.all(
        recommendations.map(async job => {
          try {
            const fit = await computeJobFitScore(userId, job.id);
            return {
              job: {
                ...job,
                required_skills: parseJson(job.required_skills, []),
                preferred_skills: parseJson(job.preferred_skills, [])
              },
              fit
            };
          } catch {
            return null;
          }
        })
      );

      const validRecs = recsWithFit
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .sort((a, b) => b.fit.overall_percentage - a.fit.overall_percentage)
        .slice(0, 5);

      res.json({
        success: true,
        dashboard: {
          completion,
          profile_views: profile?.profile_views || 0,
          applications: {
            total: apps.length,
            submitted: apps.length,
            under_review: apps.filter(a => a.status === 'Under Review').length,
            shortlisted: apps.filter(a => a.status === 'Shortlisted').length,
            interviews: apps.filter(a => a.status === 'Interviewing').length,
            selected: apps.filter(a => a.status === 'Offered').length,
            rejected: apps.filter(a => a.status === 'Rejected').length
          },
          verified_skills: badgesCount,
          earned_badges: badgesCount,
          claimed_skills: skills.length,
          upcoming_interviews: interviews,
          recommended_jobs: validRecs,
          skill_gaps: validRecs[0] ? validRecs[0].fit.missing_skills : []
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to load dashboard', error: error.message });
    }
  }

  static async getCandidateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await User.findOne({ id: userId }).lean();
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      const profile = user.profile ? {
        ...user.profile,
        skills: parseJson(user.profile.skills, []),
        education_entries: parseJson(user.profile.education_entries, []),
        experience_entries: parseJson(user.profile.experience_entries, []),
        certifications: parseJson(user.profile.certifications, []),
        achievements: parseJson(user.profile.achievements, []),
        languages: parseJson(user.profile.languages, []),
        privacy_settings: parseJson(user.profile.privacy_settings, {}),
        job_preferences: parseJson(user.profile.job_preferences, {}),
        notification_prefs: parseJson(user.profile.notification_prefs, {})
      } : null;

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
          phone: user.phone,
          role: user.role
        },
        profile,
        completion: profileCompletion(profile, user)
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to get profile', error: error.message });
    }
  }

  static async updateCandidateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const b = req.body || {};
      const user = await User.findOne({ id: userId });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      if (b.name) user.name = b.name;
      if (b.phone !== undefined) user.phone = b.phone;
      if (b.avatar_url) user.avatar_url = b.avatar_url;

      if (!user.profile) {
        user.profile = {};
      }

      const directProps = [
        'headline', 'bio', 'location', 'phone', 'career_objective',
        'preferred_job_role', 'preferred_location', 'work_preference',
        'expected_salary', 'education', 'github_url', 'linkedin_url', 'portfolio_website'
      ];

      directProps.forEach(p => {
        if (b[p] !== undefined) {
          user.profile[p] = b[p];
        }
      });

      const jsonProps = [
        'education_entries', 'experience_entries', 'certifications',
        'achievements', 'languages', 'privacy_settings', 'job_preferences', 'notification_prefs'
      ];

      jsonProps.forEach(p => {
        if (b[p] !== undefined) {
          user.profile[p] = typeof b[p] === 'string' ? parseJson(b[p], null) : b[p];
        }
      });

      user.markModified('profile');
      await user.save();

      res.json({ success: true, message: 'Profile updated' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
    }
  }

  static async getCandidateSkills(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      let rows = await CandidateSkill.find({ user_id: userId }).lean();
      const user = await User.findOne({ id: userId }).lean();
      const claimed = parseJson<string[]>(user?.profile?.skills, []);
      const badges = await Badge.find({ user_id: userId, status: 'active' }).lean();
      const existingNames = new Set(rows.map(r => r.skill_name.toLowerCase()));

      for (const name of claimed) {
        if (!existingNames.has(name.toLowerCase())) {
          await CandidateSkill.create({
            id: uuidv4(),
            user_id: userId,
            skill_name: name,
            category: 'General',
            proficiency: 'Intermediate',
            is_verified: false,
            source: 'self'
          });
          existingNames.add(name.toLowerCase());
        }
      }

      rows = await CandidateSkill.find({ user_id: userId }).lean();
      const verifiedMap = new Map(badges.map(b => [b.skill_name.toLowerCase(), b]));
      const formatted = rows.map(r => {
        const badge = verifiedMap.get(r.skill_name.toLowerCase());
        return {
          ...r,
          is_verified: badge ? 1 : (r.is_verified ? 1 : 0),
          verified_level: badge?.level,
          verified_score: badge?.score_percentage
        };
      });

      res.json({
        success: true,
        skills: formatted,
        verified: formatted.filter(s => s.is_verified === 1),
        unverified: formatted.filter(s => s.is_verified === 0),
        needs_improvement: formatted.filter(s => s.is_verified === 0 || ['Beginner', 'Intermediate'].includes(s.proficiency))
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve candidate skills', error: error.message });
    }
  }

  static async addCandidateSkill(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { skill_name, category, proficiency } = req.body;
      if (!skill_name) {
        res.status(400).json({ success: false, message: 'Skill name is required' });
        return;
      }
      const id = uuidv4();
      await CandidateSkill.create({
        id,
        user_id: userId,
        skill_name,
        category: category || 'General',
        proficiency: proficiency || 'Beginner',
        is_verified: false,
        source: 'self'
      });

      const user = await User.findOne({ id: userId });
      if (user) {
        if (!user.profile) user.profile = {};
        const skills = parseJson<string[]>(user.profile.skills, []);
        if (!skills.includes(skill_name)) {
          skills.push(skill_name);
          user.profile.skills = skills;
          user.markModified('profile');
          await user.save();
        }
      }
      res.status(201).json({ success: true, id });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to add skill', error: error.message });
    }
  }

  static async updateCandidateSkill(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { proficiency, category } = req.body;
      const row = await CandidateSkill.findOne({ id, user_id: req.user!.id });
      if (!row) {
        res.status(404).json({ success: false, message: 'Skill not found' });
        return;
      }
      if (proficiency) row.proficiency = proficiency;
      if (category) row.category = category;
      await row.save();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update skill', error: error.message });
    }
  }

  static async deleteCandidateSkill(req: AuthRequest, res: Response): Promise<void> {
    try {
      await CandidateSkill.deleteOne({ id: req.params.id, user_id: req.user!.id });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete skill', error: error.message });
    }
  }

  static async saveJob(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { job_id } = req.body;
      if (!job_id) {
        res.status(400).json({ success: false, message: 'job_id required' });
        return;
      }
      const existing = await SavedJob.findOne({ user_id: userId, job_id });
      if (existing) {
        res.status(409).json({ success: false, message: 'Job already saved' });
        return;
      }
      await SavedJob.create({
        id: uuidv4(),
        user_id: userId,
        job_id,
        created_at: new Date().toISOString()
      });
      res.status(201).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to save job', error: error.message });
    }
  }

  static async unsaveJob(req: AuthRequest, res: Response): Promise<void> {
    try {
      await SavedJob.deleteOne({ user_id: req.user!.id, job_id: req.params.jobId });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to unsave job', error: error.message });
    }
  }

  static async getSavedJobs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const saved = await SavedJob.find({ user_id: req.user!.id }).sort({ created_at: -1 }).lean();
      const jobs = await Promise.all(
        saved.map(async s => {
          const j = await Job.findOne({ id: s.job_id }).lean();
          if (!j) return null;
          return {
            ...j,
            saved_id: s.id,
            required_skills: parseJson(j.required_skills, []),
            preferred_skills: parseJson(j.preferred_skills, [])
          };
        })
      );
      res.json({ success: true, jobs: jobs.filter(Boolean) });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to get saved jobs', error: error.message });
    }
  }

  static async withdrawApplication(req: AuthRequest, res: Response): Promise<void> {
    try {
      const app = await Application.findOne({ id: req.params.id, user_id: req.user!.id });
      if (!app) {
        res.status(404).json({ success: false, message: 'Application not found' });
        return;
      }
      if (['Offered', 'Rejected'].includes(app.status)) {
        res.status(400).json({ success: false, message: 'This application can no longer be withdrawn' });
        return;
      }
      const now = new Date().toISOString();
      app.status = 'Rejected';
      app.additional_info = 'Withdrawn by candidate';
      app.updated_at = now;
      await app.save();

      await ApplicationEvent.create({
        id: uuidv4(),
        application_id: app.id,
        status: 'Withdrawn',
        actor_id: req.user!.id,
        note: 'Candidate withdrew',
        created_at: now
      });
      res.json({ success: true, message: 'Application withdrawn' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to withdraw application', error: error.message });
    }
  }

  static async applicationTimeline(req: AuthRequest, res: Response): Promise<void> {
    try {
      const app = await Application.findOne({ id: req.params.id }).lean();
      if (!app) {
        res.status(404).json({ success: false, message: 'Not found' });
        return;
      }
      if (req.user!.role === 'job_seeker' && app.user_id !== req.user!.id) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }
      const events = await ApplicationEvent.find({ application_id: app.id }).sort({ created_at: 1 }).lean();
      res.json({ success: true, events, current: app.status });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to get timeline', error: error.message });
    }
  }

  static async recruiterDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const employerId = req.user!.id;
      const jobs = await Job.find({ employer_id: employerId }).sort({ created_at: -1 }).lean();
      const jobIds = jobs.map(j => j.id);

      const apps = jobIds.length > 0 ? await Application.find({ job_id: { $in: jobIds } }).lean() : [];
      const interviewCount = await ScheduledInterview.countDocuments({ recruiter_id: employerId, status: 'scheduled' });

      const recentApps = apps.slice(0, 8);
      const recentWithScores = await Promise.all(
        recentApps.map(async a => {
          const user = await User.findOne({ id: a.user_id }).lean();
          const job = jobs.find(j => j.id === a.job_id) || await Job.findOne({ id: a.job_id }).lean();
          const profile = user?.profile || {};

          let matchInfo: any = null;
          try {
            matchInfo = await computeDeterministicMatch(a.user_id, a.job_id);
          } catch {
            // Fallback
          }

          return {
            ...a,
            candidate_name: user?.name || 'Applicant',
            candidate_avatar: user?.avatar_url || null,
            candidate_email: user?.email || '',
            job_title: job?.title || 'Position',
            candidate_skills: parseJson(profile.skills, []),
            candidate_exp: profile.experience_years || 0,
            candidate_headline: profile.headline || '',
            candidate_location: profile.location || '',
            fit_score_breakdown: parseJson(a.fit_score_breakdown, {}),
            match_details: matchInfo,
            match_percentage: matchInfo ? matchInfo.overall_percentage : Math.round(a.fit_score)
          };
        })
      );

      const jobPerformance = await Promise.all(
        jobs.map(async j => {
          const jobApps = apps.filter(a => a.job_id === j.id);
          const jobInts = await ScheduledInterview.countDocuments({ job_id: j.id });
          return {
            id: j.id,
            title: j.title,
            status: j.status,
            moderation_status: j.moderation_status || 'approved',
            created_at: j.created_at,
            views_count: j.views_count || 0,
            application_deadline: j.application_deadline,
            total_applications: jobApps.length,
            shortlisted_count: jobApps.filter(a => a.status === 'Shortlisted').length,
            interviews_count: jobInts,
            hired_count: jobApps.filter(a => ['Offered', 'Selected'].includes(a.status)).length
          };
        })
      );

      res.json({
        success: true,
        stats: {
          total_jobs: jobs.length,
          active_jobs: jobs.filter(j => ['open', 'active'].includes(j.status)).length,
          applications: apps.length,
          shortlisted: apps.filter(a => a.status === 'Shortlisted').length,
          interviews: interviewCount,
          hired: apps.filter(a => ['Offered', 'Selected'].includes(a.status)).length
        },
        recent_applications: recentWithScores,
        active_jobs: jobs.filter(j => ['open', 'active'].includes(j.status)).slice(0, 6),
        job_performance: jobPerformance
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to load recruiter dashboard', error: error.message });
    }
  }

  static async getCompanyMine(req: AuthRequest, res: Response): Promise<void> {
    try {
      const company = await Company.findOne({ user_id: req.user!.id }).lean();
      if (!company) {
        res.status(404).json({ success: false, message: 'No company profile' });
        return;
      }
      res.json({
        success: true,
        company: {
          ...company,
          benefits: parseJson(company.benefits, []),
          social_links: parseJson(company.social_links, {})
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to get company profile', error: error.message });
    }
  }

  static async updateCompany(req: AuthRequest, res: Response): Promise<void> {
    try {
      const b = req.body;
      let company = await Company.findOne({ user_id: req.user!.id });
      if (!company) {
        company = await Company.create({
          id: `comp-${uuidv4()}`,
          user_id: req.user!.id,
          name: b.name || 'My Company',
          industry: b.industry || 'Technology',
          description: b.description || '',
          location: b.location || '',
          verification_status: 'pending'
        });
      }

      const directProps = ['name', 'industry', 'website', 'description', 'location', 'logo_url', 'company_size', 'founded_year', 'email', 'phone', 'culture_text'];
      directProps.forEach(p => {
        if (b[p] !== undefined) {
          (company as any)[p] = b[p];
        }
      });

      if (b.benefits !== undefined) {
        company.benefits = Array.isArray(b.benefits) ? b.benefits : parseJson(b.benefits, []);
      }
      if (b.social_links !== undefined) {
        company.social_links = typeof b.social_links === 'object' ? b.social_links : parseJson(b.social_links, {});
      }

      await company.save();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update company', error: error.message });
    }
  }

  static async updateJob(req: AuthRequest, res: Response): Promise<void> {
    try {
      const job = await Job.findOne({ id: req.params.id });
      if (!job) {
        res.status(404).json({ success: false, message: 'Job not found' });
        return;
      }
      if (req.user!.role !== 'admin' && job.employer_id !== req.user!.id) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      const b = req.body;
      const directProps = ['title', 'description', 'location', 'job_type', 'experience_level', 'salary_range', 'work_mode', 'education_requirement', 'openings', 'application_deadline', 'responsibilities', 'benefits_text', 'status'];
      directProps.forEach(p => {
        if (b[p] !== undefined) {
          (job as any)[p] = b[p];
        }
      });

      if (b.required_skills !== undefined) {
        job.required_skills = Array.isArray(b.required_skills)
          ? b.required_skills.map((s: any) => (typeof s === 'string' ? { skill: s, weight: 1 } : s))
          : parseJson(b.required_skills, []);
      }
      if (b.preferred_skills !== undefined) {
        job.preferred_skills = Array.isArray(b.preferred_skills) ? b.preferred_skills : parseJson(b.preferred_skills, []);
      }

      await job.save();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update job', error: error.message });
    }
  }

  static async deleteJob(req: AuthRequest, res: Response): Promise<void> {
    try {
      const job = await Job.findOne({ id: req.params.id });
      if (!job) {
        res.status(404).json({ success: false, message: 'Job not found' });
        return;
      }
      if (req.user!.role !== 'admin' && job.employer_id !== req.user!.id) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      await Job.deleteOne({ id: req.params.id });
      logAuditEvent(req.user!.id, 'JOB_DELETED', 'JOB_POSTED', req.ip, { jobId: req.params.id });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete job', error: error.message });
    }
  }

  static async recruiterApplications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { job, skill, status, min_score } = req.query;
      const employerJobs = await Job.find({ employer_id: req.user!.id }).lean();
      const jobIds = employerJobs.map(j => j.id);

      const filter: any = { job_id: { $in: jobIds } };
      if (job) {
        filter.job_id = job;
      }
      if (status) {
        filter.status = status;
      }
      if (min_score) {
        filter.fit_score = { $gte: Number(min_score) };
      }

      const apps = await Application.find(filter).sort({ fit_score: -1 }).lean();

      let formatted = await Promise.all(
        apps.map(async a => {
          const user = await User.findOne({ id: a.user_id }).lean();
          const j = employerJobs.find(item => item.id === a.job_id) || await Job.findOne({ id: a.job_id }).lean();
          const profile = user?.profile || {};

          return {
            ...a,
            candidate_name: user?.name || 'Applicant',
            candidate_email: user?.email || '',
            candidate_avatar: user?.avatar_url || null,
            candidate_headline: profile.headline || '',
            experience_years: profile.experience_years || 0,
            candidate_location: profile.location || '',
            education: profile.education || '',
            job_title: j?.title || 'Job',
            company_name: j?.company_name || 'Company',
            fit_score_breakdown: parseJson(a.fit_score_breakdown, {})
          };
        })
      );

      if (skill) {
        const s = String(skill).toLowerCase();
        formatted = formatted.filter(a => JSON.stringify(a.fit_score_breakdown || '').toLowerCase().includes(s));
      }

      res.json({ success: true, applications: formatted });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve applications', error: error.message });
    }
  }

  static async searchCandidates(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { skills, location, role, education, min_score, job_id, experience } = req.query;

      const filter: any = {
        role: 'job_seeker',
        account_deleted: { $ne: true },
        status: { $ne: 'suspended' }
      };

      if (location) {
        filter['profile.location'] = { $regex: new RegExp(String(location).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') };
      }
      if (role) {
        const roleRegex = new RegExp(String(role).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [
          { 'profile.preferred_job_role': roleRegex },
          { 'profile.headline': roleRegex }
        ];
      }
      if (education) {
        filter['profile.education'] = { $regex: new RegExp(String(education).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') };
      }

      const users = await User.find(filter).lean();
      const skillTerms = skills ? String(skills).split(/[,+]/).map(s => s.trim().toLowerCase()).filter(Boolean) : [];

      let scored = await Promise.all(
        users.map(async u => {
          const profile = u.profile || {};
          const claimed = parseJson<string[]>(profile.skills, []);
          const badges = await Badge.find({ user_id: u.id, status: 'active' }, { skill_name: 1, level: 1, badge_code: 1, score_percentage: 1 }).lean();

          let matchResult: any = null;
          let relevance = 50;

          if (job_id) {
            try {
              matchResult = await computeDeterministicMatch(u.id, String(job_id));
              relevance = matchResult.overall_percentage;
            } catch {
              // fallback
            }
          }

          if (!matchResult) {
            const lowerClaimed = claimed.map(s => s.toLowerCase());
            const matchCount = skillTerms.filter(t => lowerClaimed.some(c => c.includes(t) || t.includes(c))).length;
            const skillScore = skillTerms.length ? (matchCount / skillTerms.length) * 50 : 35;
            const expYears = profile.experience_years || 0;
            const expScore = expYears >= 1 ? 15 : 10;
            const eduScore = profile.education ? 10 : 5;
            const locScore = location && profile.location?.toLowerCase().includes(String(location).toLowerCase()) ? 5 : 4;
            relevance = Math.round(skillScore + 20 + expScore + eduScore + locScore);
          }

          return {
            id: u.id,
            name: u.name,
            avatar_url: u.avatar_url,
            email: u.email,
            headline: profile.headline,
            location: profile.location,
            skills: claimed,
            experience_years: profile.experience_years || 0,
            education: profile.education,
            preferred_job_role: profile.preferred_job_role,
            work_preference: profile.work_preference,
            relevance,
            match_details: matchResult,
            badges
          };
        })
      );

      if (min_score) {
        scored = scored.filter(c => c.relevance >= Number(min_score));
      }

      if (experience) {
        const expTerm = String(experience).toLowerCase();
        if (expTerm.includes('0-2') || expTerm.includes('entry')) {
          scored = scored.filter(c => c.experience_years <= 2);
        } else if (expTerm.includes('3-5') || expTerm.includes('mid')) {
          scored = scored.filter(c => c.experience_years >= 2 && c.experience_years <= 5);
        } else if (expTerm.includes('5+') || expTerm.includes('senior')) {
          scored = scored.filter(c => c.experience_years >= 5);
        }
      }

      scored.sort((a, b) => b.relevance - a.relevance);
      res.json({ success: true, candidates: scored });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Candidate search failed', error: error.message });
    }
  }

  static async recruiterViewCandidate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { candidateId } = req.params;
      const user = await User.findOne({ id: candidateId, role: 'job_seeker' }).lean();
      if (!user) {
        res.status(404).json({ success: false, message: 'Candidate not found' });
        return;
      }

      await User.updateOne({ id: candidateId }, { $inc: { 'profile.profile_views': 1 } });

      const profile = user.profile ? {
        ...user.profile,
        skills: parseJson(user.profile.skills, []),
        education_entries: parseJson(user.profile.education_entries, []),
        experience_entries: parseJson(user.profile.experience_entries, []),
        certifications: parseJson(user.profile.certifications, [])
      } : null;

      const privacy = parseJson<any>(profile?.privacy_settings, {});
      const userResult = { ...user };
      if (privacy.hide_email) {
        delete (userResult as any).email;
      }

      const badges = await Badge.find(
        { user_id: candidateId, status: 'active' },
        { badge_code: 1, skill_name: 1, level: 1, score_percentage: 1, issued_at: 1 }
      ).lean();
      const portfolios = await Portfolio.find({ user_id: candidateId }).lean();
      const resumes = await Resume.find(
        { user_id: candidateId },
        { id: 1, file_name: 1, is_primary: 1, created_at: 1 }
      ).lean();

      res.json({
        success: true,
        candidate: {
          ...userResult,
          profile,
          badges,
          portfolios: portfolios.map(p => ({ ...p, skills_used: parseJson(p.skills_used, []) })),
          resumes: privacy.share_resume === false ? [] : resumes
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to view candidate', error: error.message });
    }
  }

  static async shortlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { application_id } = req.body;
      const app = await Application.findOne({ id: application_id });
      if (!app) {
        res.status(404).json({ success: false, message: 'Application not found' });
        return;
      }

      let job = await Job.findOne({ id: app.job_id, employer_id: req.user!.id }).lean();
      if (!job) {
        if (req.user!.role === 'admin') {
          job = await Job.findOne({ id: app.job_id }).lean();
        } else {
          res.status(404).json({ success: false, message: 'Application not found' });
          return;
        }
      }

      const now = new Date().toISOString();
      app.status = 'Shortlisted';
      app.updated_at = now;
      await app.save();

      await ApplicationEvent.create({
        id: uuidv4(),
        application_id,
        status: 'Shortlisted',
        actor_id: req.user!.id,
        note: 'Shortlisted by recruiter',
        created_at: now
      });

      const candidate = await User.findOne({ id: app.user_id }).lean();
      createNotification(app.user_id, 'shortlisted', 'You were shortlisted', `Your application for ${job?.title || 'the role'} was shortlisted.`, '/candidate/applications');

      if (candidate?.email) {
        sendApplicationStatusEmail(
          candidate.email,
          candidate.name || 'Applicant',
          job?.title || 'Unknown Position',
          job?.company_name || 'Unknown Company',
          'Shortlisted'
        ).then(result => {
          if (!result.success) {
            console.warn(`[shortlist] Email not sent to ${candidate?.email}: ${result.error}`);
          }
        });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to shortlist', error: error.message });
    }
  }

  static async getShortlisted(req: AuthRequest, res: Response): Promise<void> {
    try {
      const employerJobs = await Job.find({ employer_id: req.user!.id }).lean();
      const jobIds = employerJobs.map(j => j.id);

      const apps = await Application.find({ job_id: { $in: jobIds }, status: 'Shortlisted' })
        .sort({ updated_at: -1 })
        .lean();

      const formatted = await Promise.all(
        apps.map(async a => {
          const user = await User.findOne({ id: a.user_id }).lean();
          const job = employerJobs.find(j => j.id === a.job_id) || await Job.findOne({ id: a.job_id }).lean();
          return {
            ...a,
            candidate_name: user?.name || 'Applicant',
            avatar_url: user?.avatar_url || null,
            job_title: job?.title || 'Job'
          };
        })
      );

      res.json({ success: true, applications: formatted });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to get shortlisted', error: error.message });
    }
  }

  static async scheduleInterview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { candidate_id, job_id, application_id, interview_date, interview_time, interview_type, meeting_link, notes } = req.body;
      if (!candidate_id || !job_id || !interview_date || !interview_time) {
        res.status(400).json({ success: false, message: 'Candidate, job, date and time are required' });
        return;
      }
      const job = await Job.findOne({ id: job_id, employer_id: req.user!.id }).lean();
      if (!job && req.user!.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Job not found' });
        return;
      }

      const id = `int-${uuidv4()}`;
      const now = new Date().toISOString();

      await ScheduledInterview.create({
        id,
        application_id: application_id || null,
        job_id,
        candidate_id,
        recruiter_id: req.user!.id,
        interview_date,
        interview_time,
        interview_type: interview_type || 'Video',
        meeting_link: meeting_link || '',
        notes: notes || '',
        status: 'scheduled',
        created_at: now
      });

      if (application_id) {
        await Application.updateOne({ id: application_id }, { status: 'Interviewing', updated_at: now });
      }

      createNotification(candidate_id, 'interview_scheduled', 'Interview scheduled', `Interview for ${job?.title || 'Position'} on ${interview_date} at ${interview_time}.`, '/candidate/interviews');
      res.status(201).json({ success: true, id });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to schedule interview', error: error.message });
    }
  }

  static async updateInterview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const interview = await ScheduledInterview.findOne({ id: req.params.id });
      if (!interview) {
        res.status(404).json({ success: false, message: 'Interview not found' });
        return;
      }
      if (req.user!.role !== 'admin' && interview.recruiter_id !== req.user!.id) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      const b = req.body;
      if (b.interview_date !== undefined) interview.interview_date = b.interview_date;
      if (b.interview_time !== undefined) interview.interview_time = b.interview_time;
      if (b.interview_type !== undefined) interview.interview_type = b.interview_type;
      if (b.meeting_link !== undefined) interview.meeting_link = b.meeting_link;
      if (b.notes !== undefined) interview.notes = b.notes;
      if (b.status !== undefined) interview.status = b.status;

      await interview.save();

      if (b.status === 'cancelled') {
        createNotification(interview.candidate_id, 'interview_cancelled', 'Interview cancelled', 'An interview was cancelled.', '/candidate/interviews');
      } else if (b.interview_date || b.interview_time) {
        createNotification(interview.candidate_id, 'interview_rescheduled', 'Interview rescheduled', 'Check your interview details.', '/candidate/interviews');
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update interview', error: error.message });
    }
  }

  static async listInterviews(req: AuthRequest, res: Response): Promise<void> {
    try {
      const role = req.user!.role;
      let raw: any[];

      if (role === 'job_seeker') {
        raw = await ScheduledInterview.find({ candidate_id: req.user!.id }).sort({ interview_date: -1 }).lean();
        const formatted = await Promise.all(
          raw.map(async si => {
            const job = await Job.findOne({ id: si.job_id }).lean();
            return {
              ...si,
              job_title: job?.title || 'Job',
              company_name: job?.company_name || 'Company'
            };
          })
        );
        res.json({ success: true, interviews: formatted });
      } else {
        raw = await ScheduledInterview.find({ recruiter_id: req.user!.id }).sort({ interview_date: -1 }).lean();
        const formatted = await Promise.all(
          raw.map(async si => {
            const job = await Job.findOne({ id: si.job_id }).lean();
            const candidate = await User.findOne({ id: si.candidate_id }).lean();
            return {
              ...si,
              job_title: job?.title || 'Job',
              candidate_name: candidate?.name || 'Candidate'
            };
          })
        );
        res.json({ success: true, interviews: formatted });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to list interviews', error: error.message });
    }
  }

  static async getNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const rows = await Notification.find({ user_id: req.user!.id }).sort({ created_at: -1 }).limit(100).lean();
      res.json({ success: true, notifications: rows });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to get notifications', error: error.message });
    }
  }

  static async markNotificationRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      await Notification.updateOne({ id: req.params.id, user_id: req.user!.id }, { is_read: true });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to mark notification read', error: error.message });
    }
  }

  static async markAllNotificationsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      await Notification.updateMany({ user_id: req.user!.id }, { is_read: true });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to mark all read', error: error.message });
    }
  }

  static async listConversations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const uid = req.user!.id;
      const convos = await Conversation.find({
        $or: [{ participant_a: uid }, { participant_b: uid }]
      }).sort({ last_message_at: -1 }).lean();

      const decorated = await Promise.all(
        convos.map(async c => {
          const otherId = c.participant_a === uid ? c.participant_b : c.participant_a;
          const other = await User.findOne({ id: otherId }, { id: 1, name: 1, avatar_url: 1, role: 1 }).lean();
          const last = await Message.findOne({ conversation_id: c.id }).sort({ created_at: -1 }).lean();
          return { ...c, other, last_message: last ? { body: last.body, created_at: last.created_at } : null };
        })
      );
      res.json({ success: true, conversations: decorated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to list conversations', error: error.message });
    }
  }

  static async getMessages(req: AuthRequest, res: Response): Promise<void> {
    try {
      const convo = await Conversation.findOne({ id: req.params.id }).lean();
      if (!convo || (convo.participant_a !== req.user!.id && convo.participant_b !== req.user!.id)) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }
      const messages = await Message.find({ conversation_id: convo.id }).sort({ created_at: 1 }).lean();
      res.json({ success: true, messages });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to get messages', error: error.message });
    }
  }

  static async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { recipient_id, body, conversation_id } = req.body;
      if (!body) {
        res.status(400).json({ success: false, message: 'Message body required' });
        return;
      }

      let convoId = conversation_id;
      if (!convoId) {
        if (!recipient_id) {
          res.status(400).json({ success: false, message: 'recipient_id required' });
          return;
        }
        const existing = await Conversation.findOne({
          $or: [
            { participant_a: req.user!.id, participant_b: recipient_id },
            { participant_a: recipient_id, participant_b: req.user!.id }
          ]
        });

        if (existing) {
          convoId = existing.id;
        } else {
          convoId = `conv-${uuidv4()}`;
          const now = new Date().toISOString();
          await Conversation.create({
            id: convoId,
            participant_a: req.user!.id,
            participant_b: recipient_id,
            last_message_at: now,
            created_at: now
          });
        }
      } else {
        const convo = await Conversation.findOne({ id: convoId });
        if (!convo || (convo.participant_a !== req.user!.id && convo.participant_b !== req.user!.id)) {
          res.status(403).json({ success: false, message: 'Forbidden' });
          return;
        }
      }

      const msgId = uuidv4();
      const now = new Date().toISOString();

      await Message.create({
        id: msgId,
        conversation_id: convoId,
        sender_id: req.user!.id,
        body,
        created_at: now
      });

      await Conversation.updateOne({ id: convoId }, { last_message_at: now });
      const convoDoc = await Conversation.findOne({ id: convoId }).lean();
      if (convoDoc) {
        const otherId = convoDoc.participant_a === req.user!.id ? convoDoc.participant_b : convoDoc.participant_a;
        createNotification(otherId, 'message', 'New message', body.slice(0, 80), req.user!.role === 'employer' ? '/recruiter/messages' : '/candidate/notifications');
      }

      res.status(201).json({ success: true, conversation_id: convoId, message_id: msgId });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
    }
  }

  static async getResumes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const rows = await Resume.find({ user_id: req.user!.id }).sort({ is_primary: -1, created_at: -1 }).lean();
      res.json({
        success: true,
        resumes: rows.map(r => ({ ...r, suggestions: parseJson(r.suggestions, []) }))
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to get resumes', error: error.message });
    }
  }

  static async uploadResume(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { file_name, content_text, is_primary } = req.body;
      if (!file_name) {
        res.status(400).json({ success: false, message: 'file_name required' });
        return;
      }
      const id = `res-${uuidv4()}`;
      const text = content_text || '';
      const suggestions: string[] = [];
      const lower = text.toLowerCase();
      if (!lower.includes('education')) suggestions.push('Add an Education section');
      if (!lower.includes('experience') && !lower.includes('project')) suggestions.push('Add Experience or Projects');
      if (!lower.includes('skill')) suggestions.push('List your skills clearly');
      const score = Math.max(40, 100 - suggestions.length * 15);

      if (is_primary) {
        await Resume.updateMany({ user_id: req.user!.id }, { is_primary: false });
      }

      await Resume.create({
        id,
        user_id: req.user!.id,
        file_name,
        content_text: text,
        is_primary: !!is_primary,
        score,
        suggestions,
        created_at: new Date().toISOString()
      });

      res.status(201).json({ success: true, id, score, suggestions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to upload resume', error: error.message });
    }
  }

  static async setPrimaryResume(req: AuthRequest, res: Response): Promise<void> {
    try {
      await Resume.updateMany({ user_id: req.user!.id }, { is_primary: false });
      await Resume.updateOne({ id: req.params.id, user_id: req.user!.id }, { is_primary: true });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to set primary resume', error: error.message });
    }
  }

  static async deleteResume(req: AuthRequest, res: Response): Promise<void> {
    try {
      await Resume.deleteOne({ id: req.params.id, user_id: req.user!.id });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete resume', error: error.message });
    }
  }

  static async updatePortfolio(req: AuthRequest, res: Response): Promise<void> {
    try {
      const b = req.body;
      const portfolio = await Portfolio.findOne({ id: req.params.id, user_id: req.user!.id });
      if (!portfolio) {
        res.status(404).json({ success: false, message: 'Not found' });
        return;
      }

      const direct = ['title', 'description', 'problem_solved', 'github_url', 'live_demo_url', 'screenshot_url', 'role_on_project', 'duration', 'project_status', 'sort_order'];
      direct.forEach(p => {
        if (b[p] !== undefined) {
          (portfolio as any)[p] = b[p];
        }
      });

      if (b.skills_used !== undefined) {
        portfolio.skills_used = Array.isArray(b.skills_used) ? b.skills_used : parseJson(b.skills_used, []);
      }

      await portfolio.save();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update portfolio', error: error.message });
    }
  }

  static async reorderPortfolio(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { order } = req.body as { order: string[] };
      if (!Array.isArray(order)) {
        res.status(400).json({ success: false, message: 'order array required' });
        return;
      }
      await Promise.all(
        order.map((id, idx) => Portfolio.updateOne({ id, user_id: req.user!.id }, { sort_order: idx }))
      );
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to reorder portfolio', error: error.message });
    }
  }

  static async createReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { target_type, target_id, reason, details } = req.body;
      if (!target_type || !target_id || !reason) {
        res.status(400).json({ success: false, message: 'target_type, target_id and reason are required' });
        return;
      }
      await Report.create({
        id: uuidv4(),
        reporter_id: req.user?.id || undefined,
        target_type,
        target_id,
        reason,
        details: details || '',
        status: 'open',
        created_at: new Date().toISOString()
      });
      res.status(201).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to create report', error: error.message });
    }
  }

  static interviewPrep(_req: Request, res: Response): void {
    res.json({
      success: true,
      categories: [
        {
          id: 'technical',
          name: 'Technical',
          questions: [
            { q: 'Explain REST vs GraphQL.', a: 'REST uses resource URLs and HTTP verbs; GraphQL uses a single endpoint with a typed query language.', e: 'Mention caching, over-fetching, and schema evolution.' },
            { q: 'What is a database index?', a: 'A data structure that speeds up lookups at the cost of write overhead and storage.', e: 'Talk about B-trees and when indexes hurt.' }
          ]
        },
        {
          id: 'hr',
          name: 'HR',
          questions: [
            { q: 'Tell me about yourself.', a: 'Present a 60-second career story tied to the role.', e: 'Past → present → why this role.' },
            { q: 'Why this company?', a: 'Connect their product, stage, and your skills.', e: 'Avoid generic praise.' }
          ]
        },
        {
          id: 'behavioral',
          name: 'Behavioral',
          questions: [
            { q: 'Describe a conflict on a team.', a: 'Use STAR: situation, task, action, result.', e: 'Show empathy and ownership.' }
          ]
        },
        {
          id: 'coding',
          name: 'Coding',
          questions: [
            { q: 'How do you approach a coding interview problem?', a: 'Clarify, examples, brute force, optimize, test.', e: 'Talk out loud and check edge cases.' }
          ]
        },
        {
          id: 'role',
          name: 'Role-specific',
          questions: [
            { q: 'How would you debug a production outage?', a: 'Stabilize, gather signals, isolate, fix, postmortem.', e: 'Mention observability and rollback.' }
          ]
        }
      ]
    });
  }

  static async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { current_password, new_password } = req.body;
      if (!current_password || !new_password || String(new_password).length < 8) {
        res.status(400).json({ success: false, message: 'Current password and a new password (8+ chars) are required' });
        return;
      }
      const user = await User.findOne({ id: req.user!.id });
      if (!user || !bcrypt.compareSync(current_password, user.password_hash)) {
        res.status(401).json({ success: false, message: 'Current password is incorrect' });
        return;
      }
      user.password_hash = bcrypt.hashSync(new_password, 10);
      await user.save();
      logAuditEvent(req.user!.id, 'PASSWORD_CHANGED', 'SECURITY', req.ip, {});
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to change password', error: error.message });
    }
  }

  static async deleteAccount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await User.findOne({ id: req.user!.id });
      if (user) {
        user.account_deleted = true;
        user.status = 'suspended';
        user.email = `${user.email}.deleted.${user.id}`;
        await user.save();
      }
      logAuditEvent(req.user!.id, 'ACCOUNT_DELETED', 'SECURITY', req.ip, {});
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete account', error: error.message });
    }
  }

  static async adminUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { search, role, status } = req.query;
      const filter: any = { account_deleted: { $ne: true } };

      if (search) {
        const sRegex = new RegExp(String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [{ name: sRegex }, { email: sRegex }];
      }
      if (role) {
        filter.role = role;
      }
      if (status) {
        filter.status = status;
      }

      const users = await User.find(filter, { id: 1, name: 1, email: 1, role: 1, avatar_url: 1, status: 1, created_at: 1 })
        .sort({ created_at: -1 })
        .lean();

      res.json({ success: true, users });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to list users', error: error.message });
    }
  }

  static async adminUpdateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status, role } = req.body;
      const target = await User.findOne({ id: req.params.id });
      if (!target) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      if (status) target.status = status;
      if (role && ['job_seeker', 'employer', 'admin'].includes(role)) {
        target.role = role as any;
      }
      await target.save();

      logAuditEvent(req.user!.id, status === 'suspended' ? 'USER_SUSPENDED' : 'USER_UPDATED', 'SECURITY', req.ip, { target: req.params.id, status, role });

      // Send email
      if (target.email) {
        if (status === 'suspended') {
          sendAdminActionEmail(target.email, target.name || 'User', 'user_suspended').then(result => {
            if (!result.success) console.warn(`[adminUpdateUser] Suspend email not sent to ${target.email}: ${result.error}`);
          });
        } else if (status === 'active') {
          sendAdminActionEmail(target.email, target.name || 'User', 'user_activated').then(result => {
            if (!result.success) console.warn(`[adminUpdateUser] Activate email not sent to ${target.email}: ${result.error}`);
          });
        }
        if (role && role !== target.role) {
          sendAdminActionEmail(target.email, target.name || 'User', 'user_role_changed', { newRole: role }).then(result => {
            if (!result.success) console.warn(`[adminUpdateUser] Role-change email not sent to ${target.email}: ${result.error}`);
          });
        }
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
    }
  }

  static async adminDeleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.params.id === req.user!.id) {
        res.status(400).json({ success: false, message: 'Cannot delete your own admin account' });
        return;
      }
      const user = await User.findOne({ id: req.params.id });
      if (user) {
        user.account_deleted = true;
        user.status = 'suspended';
        await user.save();
      }

      logAuditEvent(req.user!.id, 'USER_DELETED', 'SECURITY', req.ip, { target: req.params.id });

      if (user?.email) {
        sendAdminActionEmail(user.email, user.name || 'User', 'user_deleted').then(result => {
          if (!result.success) console.warn(`[adminDeleteUser] Email not sent to ${user?.email}: ${result.error}`);
        });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
    }
  }

  static async adminRecruiters(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const recruiters = await User.find({ role: 'employer' }).sort({ created_at: -1 }).lean();
      const rows = await Promise.all(
        recruiters.map(async u => {
          const company = await Company.findOne({ user_id: u.id }).lean();
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            status: u.status,
            created_at: u.created_at,
            company_id: company?.id || null,
            company_name: company?.name || null,
            verification_status: company?.verification_status || 'pending',
            industry: company?.industry || null
          };
        })
      );
      res.json({ success: true, recruiters: rows });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to list recruiters', error: error.message });
    }
  }

  static async adminVerifyCompany(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { verification_status, rejection_reason } = req.body;
      if (!['pending', 'verified', 'rejected', 'suspended'].includes(verification_status)) {
        res.status(400).json({ success: false, message: 'Invalid status' });
        return;
      }
      const company = await Company.findOne({ id: req.params.id });
      if (!company) {
        res.status(404).json({ success: false, message: 'Company not found' });
        return;
      }
      company.verification_status = verification_status;
      company.rejection_reason = rejection_reason || undefined;
      await company.save();

      createNotification(
        company.user_id,
        'company_verification',
        `Company Verification: ${verification_status.toUpperCase()}`,
        `Your company verification status is now: ${verification_status}${rejection_reason ? `. Reason: ${rejection_reason}` : ''}`,
        '/recruiter/company'
      );
      logAuditEvent(req.user!.id, 'COMPANY_VERIFICATION', 'SECURITY', req.ip, { company: req.params.id, verification_status, rejection_reason });

      const companyOwner = await User.findOne({ id: company.user_id }).lean();
      if (companyOwner?.email) {
        const emailAction = verification_status === 'verified' ? 'company_verified' as const
          : verification_status === 'rejected' ? 'company_rejected' as const
          : 'company_pending' as const;
        sendAdminActionEmail(companyOwner.email, companyOwner.name || 'Employer', emailAction, { companyName: company.name }).then(result => {
          if (!result.success) console.warn(`[verifyCompany] Email not sent to ${companyOwner?.email}: ${result.error}`);
        });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to verify company', error: error.message });
    }
  }

  static async adminJobs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { moderation_status, search } = req.query;
      const filter: any = {};

      if (moderation_status) {
        filter.moderation_status = moderation_status;
      }
      if (search) {
        const sRegex = new RegExp(String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [{ title: sRegex }, { company_name: sRegex }];
      }

      const jobs = await Job.find(filter).sort({ created_at: -1 }).lean();
      const formatted = await Promise.all(
        jobs.map(async j => {
          const user = await User.findOne({ id: j.employer_id }).lean();
          const company = await Company.findOne({ user_id: j.employer_id }).lean();
          const applicantCount = await Application.countDocuments({ job_id: j.id });

          return {
            ...j,
            company_display_name: company?.name || j.company_name,
            recruiter_name: user?.name || 'Recruiter',
            recruiter_email: user?.email || '',
            applicant_count: applicantCount,
            required_skills: parseJson(j.required_skills, []),
            preferred_skills: parseJson(j.preferred_skills, [])
          };
        })
      );

      res.json({ success: true, jobs: formatted });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to list admin jobs', error: error.message });
    }
  }

  static async adminModerateJob(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { moderation_status, status, rejection_reason } = req.body;
      const job = await Job.findOne({ id: req.params.id });
      if (!job) {
        res.status(404).json({ success: false, message: 'Job not found' });
        return;
      }

      if (moderation_status === 'approved') {
        job.status = 'open';
        job.moderation_status = 'approved';
        job.rejection_reason = undefined;
        await job.save();
        createNotification(job.employer_id, 'job_approved', 'Job Approved', `Your job posting "${job.title}" has been approved and is now publicly visible.`, '/recruiter/jobs');
      } else if (moderation_status === 'rejected') {
        const reason = rejection_reason || 'Job description does not meet platform guidelines.';
        job.status = 'closed';
        job.moderation_status = 'rejected';
        job.rejection_reason = reason;
        await job.save();
        createNotification(job.employer_id, 'job_rejected', 'Job Rejected', `Your job posting "${job.title}" was rejected. Reason: ${reason}`, '/recruiter/jobs');
      } else {
        if (moderation_status) job.moderation_status = moderation_status;
        if (status) job.status = status;
        await job.save();
      }

      logAuditEvent(req.user!.id, 'JOB_MODERATED', 'JOB_POSTED', req.ip, { job: job.id, moderation_status, status, rejection_reason });

      const jobOwner = await User.findOne({ id: job.employer_id }).lean();
      if (jobOwner?.email && moderation_status) {
        const emailAction = moderation_status === 'approved' ? 'job_approved' as const : 'job_rejected' as const;
        sendAdminActionEmail(jobOwner.email, jobOwner.name || 'Employer', emailAction, { jobTitle: job.title }).then(result => {
          if (!result.success) console.warn(`[moderateJob] Email not sent to ${jobOwner?.email}: ${result.error}`);
        });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to moderate job', error: error.message });
    }
  }

  static async adminUpdateSkill(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const b = req.body;
      if (b.name && b.name.trim()) {
        const existing = await SkillTaxonomy.findOne({
          name: { $regex: new RegExp(`^${b.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
          id: { $ne: id }
        });
        if (existing) {
          res.status(400).json({ success: false, message: `Skill "${b.name.trim()}" already exists` });
          return;
        }
      }

      const skill = await SkillTaxonomy.findOne({ id });
      if (!skill) {
        res.status(404).json({ success: false, message: 'Skill not found' });
        return;
      }

      if (b.name) skill.name = b.name.trim();
      if (b.category) skill.category = b.category;
      if (b.description !== undefined) skill.description = b.description;
      if (b.difficulty_level) skill.difficulty_level = b.difficulty_level;
      if (b.synonyms !== undefined) skill.synonyms = Array.isArray(b.synonyms) ? b.synonyms : parseJson(b.synonyms, []);
      if (b.aliases !== undefined) skill.aliases = Array.isArray(b.aliases) ? b.aliases : parseJson(b.aliases, []);

      await skill.save();

      if (req.user?.id) {
        logAuditEvent(req.user.id, 'SKILL_UPDATED', 'SECURITY', req.ip, { skill: id });
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error updating skill:', error);
      res.status(500).json({ success: false, message: 'Failed to update skill', error: error.message });
    }
  }

  static async adminDeleteSkill(req: AuthRequest, res: Response): Promise<void> {
    try {
      await SkillTaxonomy.deleteOne({ id: req.params.id });
      logAuditEvent(req.user!.id, 'SKILL_DELETED', 'SECURITY', req.ip, { skill: req.params.id });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete skill', error: error.message });
    }
  }

  static async adminAssessments(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const rows = await Assessment.find().lean();
      res.json({
        success: true,
        assessments: rows.map(a => ({ ...a, questions: parseJson(a.questions, []) }))
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to list assessments', error: error.message });
    }
  }

  static async adminSaveAssessment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const b = req.body;
      if (!b.title || !b.skill_name || !b.questions) {
        res.status(400).json({ success: false, message: 'title, skill_name and questions required' });
        return;
      }
      const id = b.id || `assess-${uuidv4()}`;
      const questionsData = Array.isArray(b.questions) ? b.questions : parseJson(b.questions, []);

      let assessment = await Assessment.findOne({ id });
      if (assessment) {
        assessment.skill_name = b.skill_name;
        assessment.title = b.title;
        assessment.category = b.category || 'General';
        assessment.duration_minutes = b.duration_minutes || 15;
        assessment.pass_percentage = b.pass_percentage || 70;
        assessment.questions = questionsData;
        await assessment.save();
      } else {
        await Assessment.create({
          id,
          skill_name: b.skill_name,
          title: b.title,
          category: b.category || 'General',
          duration_minutes: b.duration_minutes || 15,
          pass_percentage: b.pass_percentage || 70,
          questions: questionsData
        });
      }

      logAuditEvent(req.user!.id, 'ASSESSMENT_SAVED', 'SECURITY', req.ip, { id });
      res.json({ success: true, id });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to save assessment', error: error.message });
    }
  }

  static async adminDeleteAssessment(req: AuthRequest, res: Response): Promise<void> {
    try {
      await Assessment.deleteOne({ id: req.params.id });
      logAuditEvent(req.user!.id, 'ASSESSMENT_DELETED', 'SECURITY', req.ip, { id: req.params.id });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete assessment', error: error.message });
    }
  }

  static async adminBadges(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const [templates, issuedCount] = await Promise.all([
        BadgeTemplate.find().lean(),
        Badge.countDocuments()
      ]);
      res.json({ success: true, templates, issued_count: issuedCount });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to list badges', error: error.message });
    }
  }

  static async adminSaveBadgeTemplate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const b = req.body;
      const id = b.id || `bt-${uuidv4()}`;

      let tmpl = await BadgeTemplate.findOne({ id });
      if (tmpl) {
        tmpl.name = b.name;
        tmpl.skill_name = b.skill_name;
        tmpl.level = b.level;
        tmpl.description = b.description || '';
        tmpl.criteria = b.criteria || '';
        tmpl.icon = b.icon || '';
        tmpl.is_active = b.is_active !== 0;
        await tmpl.save();
      } else {
        await BadgeTemplate.create({
          id,
          name: b.name,
          skill_name: b.skill_name,
          level: b.level,
          description: b.description || '',
          criteria: b.criteria || '',
          icon: b.icon || '🏅',
          is_active: true
        });
      }
      res.json({ success: true, id });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to save badge template', error: error.message });
    }
  }

  static async adminReports(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const reports = await Report.find().sort({ created_at: -1 }).lean();
      res.json({ success: true, reports });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to list reports', error: error.message });
    }
  }

  static async adminResolveReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      await Report.updateOne({ id: req.params.id }, { status: status || 'resolved', resolved_at: new Date().toISOString() });
      logAuditEvent(req.user!.id, 'REPORT_RESOLVED', 'SECURITY', req.ip, { report: req.params.id, status });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to resolve report', error: error.message });
    }
  }

  static async adminSettingsGet(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const rows = await PlatformSetting.find().lean();
      const settings: Record<string, string> = {};
      rows.forEach(r => {
        settings[r.key] = r.value;
      });
      res.json({ success: true, settings });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to get settings', error: error.message });
    }
  }

  static async adminSettingsUpdate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const entries = Object.entries(req.body || {});
      await Promise.all(
        entries.map(([key, value]) => PlatformSetting.findOneAndUpdate({ key }, { value: String(value) }, { upsert: true }))
      );
      logAuditEvent(req.user!.id, 'SETTINGS_UPDATED', 'SECURITY', req.ip, { keys: entries.map(([k]) => k) });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update settings', error: error.message });
    }
  }

  static async updateJobStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const job = await Job.findOne({ id });
      if (!job) {
        res.status(404).json({ success: false, message: 'Job not found' });
        return;
      }
      if (req.user!.role !== 'admin' && job.employer_id !== req.user!.id) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }
      job.status = status;
      await job.save();
      res.json({ success: true, message: `Job status updated to ${status}` });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update job status', error: error.message });
    }
  }

  static async adminCompanies(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const companies = await Company.find().sort({ name: 1 }).lean();
      const formatted = await Promise.all(
        companies.map(async c => {
          const user = await User.findOne({ id: c.user_id }).lean();
          const jobsCount = await Job.countDocuments({
            $or: [{ company_name: c.name }, { employer_id: c.user_id }]
          });
          return {
            ...c,
            recruiter_name: user?.name || 'Recruiter',
            recruiter_email: user?.email || '',
            jobs_count: jobsCount,
            benefits: parseJson(c.benefits, []),
            social_links: parseJson(c.social_links, {})
          };
        })
      );
      res.json({ success: true, companies: formatted });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to list admin companies', error: error.message });
    }
  }

  static async adminDashboard(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const [
        totalUsers,
        totalCandidates,
        totalRecruiters,
        totalCompanies,
        activeJobs,
        pendingJobs,
        totalApplications,
        scheduledInterviews,
        totalHires,
        openReports,
        verifiedBadgesCount,
        pendingCompaniesCount,
        underReviewCount,
        shortlistedCount,
        interviewCount,
        rejectedCount
      ] = await Promise.all([
        User.countDocuments({ account_deleted: { $ne: true } }),
        User.countDocuments({ role: 'job_seeker', account_deleted: { $ne: true } }),
        User.countDocuments({ role: 'employer', account_deleted: { $ne: true } }),
        Company.countDocuments(),
        Job.countDocuments({ status: { $in: ['open', 'active'] } }),
        Job.countDocuments({ moderation_status: 'pending' }),
        Application.countDocuments(),
        ScheduledInterview.countDocuments({ status: 'scheduled' }),
        Application.countDocuments({ status: { $in: ['Offered', 'Selected'] } }),
        Report.countDocuments({ status: { $in: ['open', 'pending', 'investigating'] } }),
        Badge.countDocuments({ status: 'active' }),
        Company.countDocuments({ verification_status: 'pending' }),
        Application.countDocuments({ status: 'Under Review' }),
        Application.countDocuments({ status: 'Shortlisted' }),
        Application.countDocuments({ status: { $in: ['Interview', 'Interviewing'] } }),
        Application.countDocuments({ status: 'Rejected' })
      ]);

      const jobs = await Job.find({}, { required_skills: 1 }).lean();
      const skillCounts: Record<string, number> = {};
      jobs.forEach(j => {
        const skills = parseJson<any[]>(j.required_skills, []);
        skills.forEach(s => {
          const name = typeof s === 'string' ? s : s.skill;
          if (name) skillCounts[name] = (skillCounts[name] || 0) + 1;
        });
      });

      const topDemandedSkills = Object.entries(skillCounts)
        .map(([name, count]) => ({ name, count, percentage: Math.round((count / Math.max(1, jobs.length)) * 100) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      const funnel = {
        applied: totalApplications,
        under_review: underReviewCount,
        shortlisted: shortlistedCount,
        interview: interviewCount,
        selected: totalHires,
        rejected: rejectedCount
      };

      const rawCompVerifs = await Company.find({ verification_status: 'pending' }).limit(10).lean();
      const companyVerifications = await Promise.all(
        rawCompVerifs.map(async c => {
          const user = await User.findOne({ id: c.user_id }).lean();
          return {
            ...c,
            recruiter_name: user?.name || 'Recruiter',
            recruiter_email: user?.email || ''
          };
        })
      );

      const rawJobMods = await Job.find({ moderation_status: 'pending' }).sort({ created_at: -1 }).limit(10).lean();
      const jobModerations = await Promise.all(
        rawJobMods.map(async j => {
          const user = await User.findOne({ id: j.employer_id }).lean();
          const company = await Company.findOne({ user_id: j.employer_id }).lean();
          return {
            ...j,
            recruiter_name: user?.name || 'Recruiter',
            recruiter_email: user?.email || '',
            company_display_name: company?.name || j.company_name
          };
        })
      );

      const flaggedReports = await Report.find({ status: { $in: ['open', 'pending', 'investigating'] } })
        .sort({ created_at: -1 })
        .limit(10)
        .lean();

      const recentActivity = await AuditLog.find().sort({ timestamp: -1 }).limit(10).lean();

      const kpis = {
        total_users: totalUsers,
        candidates_count: totalCandidates,
        recruiters_count: totalRecruiters,
        companies_count: totalCompanies,
        pending_companies: pendingCompaniesCount,
        total_jobs: activeJobs + pendingJobs,
        active_jobs: activeJobs,
        pending_jobs: pendingJobs,
        total_applications: totalApplications,
        scheduled_interviews: scheduledInterviews,
        total_hires: totalHires,
        open_reports: openReports,
        verified_badges: verifiedBadgesCount
      };

      res.json({
        success: true,
        stats: kpis,
        kpis,
        company_verifications: companyVerifications,
        job_moderations: jobModerations,
        flagged_reports: flaggedReports,
        recent_activity: recentActivity.map(a => ({
          ...a,
          details: typeof a.details === 'string' ? parseJson(a.details, {}) : (a.details || {})
        })),
        top_demanded_skills: topDemandedSkills,
        funnel
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to load admin dashboard', error: error.message });
    }
  }

  static async adminAnalytics(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const [
        totalUsers,
        totalCandidates,
        totalRecruiters,
        totalJobs,
        activeJobs,
        closedJobs,
        approvedJobs,
        pendingJobs,
        rejectedJobs,
        totalApplications,
        totalHires,
        shortlistedCount,
        interviewCount
      ] = await Promise.all([
        User.countDocuments({ account_deleted: { $ne: true } }),
        User.countDocuments({ role: 'job_seeker', account_deleted: { $ne: true } }),
        User.countDocuments({ role: 'employer', account_deleted: { $ne: true } }),
        Job.countDocuments(),
        Job.countDocuments({ status: { $in: ['open', 'active'] } }),
        Job.countDocuments({ status: 'closed' }),
        Job.countDocuments({ moderation_status: 'approved' }),
        Job.countDocuments({ moderation_status: 'pending' }),
        Job.countDocuments({ moderation_status: 'rejected' }),
        Application.countDocuments(),
        Application.countDocuments({ status: { $in: ['Offered', 'Selected'] } }),
        Application.countDocuments({ status: 'Shortlisted' }),
        Application.countDocuments({ status: { $in: ['Interview', 'Interviewing'] } })
      ]);

      const jobsByModeAgg = await Job.aggregate([
        { $group: { _id: '$work_mode', count: { $sum: 1 } } }
      ]);
      const jobsByMode = jobsByModeAgg.map(item => ({ work_mode: item._id, count: item.count }));

      const jobsByTypeAgg = await Job.aggregate([
        { $group: { _id: '$job_type', count: { $sum: 1 } } }
      ]);
      const jobsByType = jobsByTypeAgg.map(item => ({ job_type: item._id, count: item.count }));

      const jobs = await Job.find({}, { required_skills: 1 }).lean();
      const demandedSkillsCount: Record<string, number> = {};
      jobs.forEach(j => {
        const skills = parseJson<any[]>(j.required_skills, []);
        skills.forEach(s => {
          const name = typeof s === 'string' ? s : s.skill;
          if (name) demandedSkillsCount[name] = (demandedSkillsCount[name] || 0) + 1;
        });
      });

      const candidateUsers = await User.find({ role: 'job_seeker' }, { profile: 1 }).lean();
      const candidateSkillsCount: Record<string, number> = {};
      candidateUsers.forEach(u => {
        const skills = parseJson<string[]>(u.profile?.skills, []);
        skills.forEach(s => {
          if (s) candidateSkillsCount[s] = (candidateSkillsCount[s] || 0) + 1;
        });
      });

      const skillKeys = Object.keys(demandedSkillsCount);
      const skillAnalytics = await Promise.all(
        skillKeys.map(async skill => {
          const demand = demandedSkillsCount[skill] || 0;
          const supply = candidateSkillsCount[skill] || 0;
          const verified = await Badge.countDocuments({
            skill_name: { $regex: new RegExp(`^${skill.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
            status: 'active'
          });
          const supplyGap = Math.max(0, demand * 3 - verified);
          return {
            skill,
            demand,
            demand_frequency: demand,
            supply,
            verified,
            verified_candidates: verified,
            gap: Math.max(0, demand * 2 - verified),
            supply_gap: supplyGap
          };
        })
      );

      skillAnalytics.sort((a, b) => b.supply_gap - a.supply_gap || b.demand - a.demand);

      const hiredApps = await Application.find({ status: { $in: ['Offered', 'Selected'] } }).lean();
      const hiresCountMap: Record<string, number> = {};
      await Promise.all(
        hiredApps.map(async a => {
          const job = await Job.findOne({ id: a.job_id }).lean();
          const compName = job?.company_name || 'Enterprise';
          hiresCountMap[compName] = (hiresCountMap[compName] || 0) + 1;
        })
      );

      const hiresByCompany = Object.entries(hiresCountMap)
        .map(([company_name, hire_count]) => ({ company_name, hire_count }))
        .sort((a, b) => b.hire_count - a.hire_count)
        .slice(0, 5);

      res.json({
        success: true,
        user_analytics: {
          total_users: totalUsers,
          candidates: totalCandidates,
          recruiters: totalRecruiters,
          candidate_growth: '+18%',
          recruiter_growth: '+12%'
        },
        job_analytics: {
          total_jobs: totalJobs,
          active_jobs: activeJobs,
          closed_jobs: closedJobs,
          approved_jobs: approvedJobs,
          pending_jobs: pendingJobs,
          rejected_jobs: rejectedJobs,
          jobs_by_mode: jobsByMode,
          jobs_by_type: jobsByType
        },
        application_analytics: {
          total_applications: totalApplications,
          avg_per_job: totalJobs > 0 ? Math.round((totalApplications / totalJobs) * 10) / 10 : 0,
          shortlisting_rate: totalApplications > 0 ? Math.round((shortlistedCount / totalApplications) * 100) : 0,
          interview_rate: totalApplications > 0 ? Math.round((interviewCount / totalApplications) * 100) : 0,
          selection_rate: totalApplications > 0 ? Math.round((totalHires / totalApplications) * 100) : 0
        },
        hiring_analytics: {
          total_hires: totalHires,
          hires_by_company: hiresByCompany
        },
        skill_analytics: skillAnalytics,
        skillMismatchComparison: skillAnalytics
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to load admin analytics', error: error.message });
    }
  }

  static async adminSkills(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const skills = await SkillTaxonomy.find().sort({ category: 1, name: 1 }).lean();
      res.json({
        success: true,
        skills: skills.map(s => ({
          ...s,
          synonyms: parseJson(s.synonyms, []),
          aliases: parseJson(s.aliases, [])
        }))
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to list admin skills', error: error.message });
    }
  }

  static async adminCreateSkill(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, category, description, difficulty_level, synonyms } = req.body;
      if (!name || !name.trim() || !category) {
        res.status(400).json({ success: false, message: 'Name and Category are required' });
        return;
      }

      const trimmedName = name.trim();
      const existing = await SkillTaxonomy.findOne({
        name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
      if (existing) {
        res.status(400).json({ success: false, message: `Skill "${trimmedName}" already exists in the taxonomy` });
        return;
      }

      const id = `sk-${uuidv4()}`;
      const desc = description ? description.trim() : '';
      const diff = difficulty_level || 'Intermediate';
      const synList = Array.isArray(synonyms) ? synonyms : [];

      await SkillTaxonomy.create({
        id,
        name: trimmedName,
        category,
        description: desc,
        difficulty_level: diff,
        synonyms: synList,
        aliases: [],
        is_active: true
      });

      if (req.user?.id) {
        logAuditEvent(req.user.id, 'SKILL_CREATED', 'SECURITY', req.ip, { skill: trimmedName, category });
      }

      const newSkill = {
        id,
        name: trimmedName,
        category,
        description: desc,
        difficulty_level: diff,
        synonyms: synList,
        aliases: [],
        is_active: 1
      };

      res.status(201).json({ success: true, id, skill: newSkill });
    } catch (error: any) {
      console.error('Error creating skill taxonomy entry:', error);
      res.status(500).json({ success: false, message: 'Failed to create skill entry', error: error.message });
    }
  }

  static async adminDeleteBadgeTemplate(req: AuthRequest, res: Response): Promise<void> {
    try {
      await BadgeTemplate.deleteOne({ id: req.params.id });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete badge template', error: error.message });
    }
  }

  static async adminApplications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const filter: any = {};
      if (req.query.status) {
        filter.status = req.query.status;
      }
      const apps = await Application.find(filter).sort({ created_at: -1 }).limit(200).lean();
      const rows = await Promise.all(
        apps.map(async a => {
          const job = await Job.findOne({ id: a.job_id }).lean();
          const user = await User.findOne({ id: a.user_id }).lean();
          return {
            id: a.id,
            status: a.status,
            fit_score: a.fit_score,
            created_at: a.created_at,
            job_title: job?.title || 'Unknown Job',
            company_name: job?.company_name || 'Unknown Company',
            candidate_name: user?.name || 'Applicant',
            candidate_email: user?.email || ''
          };
        })
      );
      res.json({ success: true, applications: rows });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to list admin applications', error: error.message });
    }
  }
}
