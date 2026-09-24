import bcrypt from 'bcryptjs';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User.js';
import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { ScheduledInterview } from '../models/ScheduledInterview.js';
import { Badge } from '../models/Badge.js';
import { AssessmentAttempt } from '../models/AssessmentAttempt.js';
import { Assessment } from '../models/Assessment.js';
import { CandidateSkill } from '../models/CandidateSkill.js';
import { MockInterview } from '../models/MockInterview.js';
import { SavedJob } from '../models/SavedJob.js';
import { Resume } from '../models/Resume.js';
import { InterviewPrepProgress } from '../models/InterviewPrepProgress.js';
import { Portfolio } from '../models/Portfolio.js';
import { Roadmap } from '../models/Roadmap.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { computeJobFitScore } from '../services/matching.service.js';

function parseJson<T>(raw: any, fallback: T): T {
  try {
    if (raw === undefined || raw === null) return fallback;
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return fallback;
  }
}

function calculateProfileCompletion(profile: any, user: any): { percent: number; missing: string[] } {
  const missing: string[] = [];
  if (!user?.name) missing.push('Full Name');
  if (!user?.email) missing.push('Email');
  if (!profile?.phone) missing.push('Phone Number');
  if (!profile?.location) missing.push('Location');
  if (!profile?.headline) missing.push('Professional Headline');
  if (!profile?.bio) missing.push('Career Summary / Bio');
  if (!profile?.preferred_job_role) missing.push('Target Job Role');

  const skills = parseJson<string[]>(profile?.skills, []);
  if (!skills || skills.length === 0) missing.push('Technical Skills');

  const softSkills = parseJson<string[]>(profile?.soft_skills, []);
  if (!softSkills || softSkills.length === 0) missing.push('Soft Skills');

  const edu = parseJson<any[]>(profile?.education_entries, []);
  if (edu.length === 0 && !profile?.education) missing.push('Education');

  const exp = parseJson<any[]>(profile?.experience_entries, []);
  if (exp.length === 0 && !profile?.experience_years) missing.push('Experience');

  const social = profile?.linkedin_url || profile?.github_url || profile?.portfolio_website;
  if (!social) missing.push('Portfolio or Social Links');

  const totalCriteria = 12;
  const completedCriteria = totalCriteria - missing.length;
  const percent = Math.max(0, Math.min(100, Math.round((completedCriteria / totalCriteria) * 100)));

  return { percent, missing };
}

export class CandidateProfileController {
  /**
   * Candidate Dashboard Data
   */
  static async getDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      let userDoc = await User.findOne({ id: userId });
      if (!userDoc) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      if (!userDoc.profile) {
        userDoc.profile = {
          headline: 'Aspiring Professional',
          bio: '',
          location: 'India',
          skills: [],
          experience_years: 0
        };
        userDoc.markModified('profile');
        await userDoc.save();
      }

      const profile = userDoc.profile || {};
      const { percent, missing } = calculateProfileCompletion(profile, userDoc);

      // Applications stats
      const applications = await Application.find({ user_id: userId }).sort({ created_at: -1 }).lean();
      const enrichedApps = await Promise.all(
        applications.map(async a => {
          const job = await Job.findOne({ id: a.job_id }).lean();
          return {
            ...a,
            job_title: job?.title || 'Unknown Job',
            company_name: job?.company_name || 'Unknown Company',
            job_location: job?.location || 'Remote',
            work_mode: job?.work_mode || 'Hybrid'
          };
        })
      );

      const appCounts = {
        total: applications.length,
        applied: applications.filter(a => (a.status || '').toLowerCase() === 'applied').length,
        under_review: applications.filter(a => {
          const st = (a.status || '').toLowerCase();
          return st === 'under review' || st === 'under_review' || st === 'reviewing';
        }).length,
        shortlisted: applications.filter(a => (a.status || '').toLowerCase() === 'shortlisted').length,
        interview: applications.filter(a => {
          const st = (a.status || '').toLowerCase();
          return st === 'interview' || st === 'interviewing';
        }).length,
        selected: applications.filter(a => {
          const st = (a.status || '').toLowerCase();
          return st === 'selected' || st === 'hired' || st === 'offered';
        }).length,
        rejected: applications.filter(a => (a.status || '').toLowerCase() === 'rejected').length
      };

      // Scheduled Interviews
      const rawInterviews = await ScheduledInterview.find({
        candidate_id: userId,
        status: { $ne: 'cancelled' }
      }).sort({ interview_date: 1, interview_time: 1 }).limit(5).lean();

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

      // Badges & Skills
      const badges = await Badge.find({ user_id: userId, status: 'active' }).sort({ issued_at: -1 }).lean();
      const rawAttempts = await AssessmentAttempt.find({ user_id: userId }).sort({ started_at: -1 }).limit(5).lean();
      const assessmentAttempts = await Promise.all(
        rawAttempts.map(async aa => {
          const assm = await Assessment.findOne({ id: aa.assessment_id }).lean();
          return {
            ...aa,
            assessment_title: assm?.title || 'Assessment',
            category: assm?.category || 'Technical'
          };
        })
      );

      const candidateSkills = await CandidateSkill.find({ user_id: userId }).sort({ skill_name: 1 }).lean();

      // Mock Interviews
      const rawMockInterviews = await MockInterview.find({ user_id: userId }).sort({ created_at: -1 }).limit(5).lean();
      const mockInterviews = rawMockInterviews.map(m => ({
        id: m.id,
        role: m.target_role || m.role,
        interview_type: m.interview_type,
        overall_score: m.overall_score,
        status: m.status,
        created_at: m.created_at
      }));

      // Recommended jobs using actual matching
      const openJobs = await Job.find({ status: { $in: ['open', 'active'] } }).sort({ created_at: -1 }).limit(20).lean();
      const recommendedJobs = await Promise.all(
        openJobs.map(async job => {
          let matchScore = 0;
          let matchedSkills: any[] = [];
          let missingSkills: any[] = [];
          try {
            const fit = await computeJobFitScore(userId, job.id);
            matchScore = fit.overall_percentage;
            matchedSkills = fit.matched_skills;
            missingSkills = fit.missing_skills;
          } catch {
            matchScore = 50;
          }

          return {
            ...job,
            required_skills: parseJson(job.required_skills, []),
            preferred_skills: parseJson(job.preferred_skills, []),
            benefits: parseJson(job.benefits_text ? [job.benefits_text] : [], []),
            match_score: matchScore,
            matched_skills: matchedSkills,
            missing_skills: missingSkills
          };
        })
      );

      recommendedJobs.sort((a, b) => b.match_score - a.match_score);
      const topRecommendedJobs = recommendedJobs.slice(0, 6);

      // Saved Jobs IDs
      const savedJobsDocs = await SavedJob.find({ user_id: userId }).lean();
      const savedJobIds = savedJobsDocs.map(r => r.job_id);

      // Calculate average fit score across applications
      const avgFitScore = applications.length > 0
        ? Math.round(applications.reduce((sum, a) => sum + (Number(a.fit_score) || 0), 0) / applications.length)
        : 88.5;

      // Portfolio project count
      const portfolioCount = await Portfolio.countDocuments({ user_id: userId });

      // Active roadmap count
      const roadmapCount = await Roadmap.countDocuments({ user_id: userId });

      res.json({
        success: true,
        dashboard: {
          user: {
            id: userDoc.id,
            name: userDoc.name,
            email: userDoc.email,
            role: userDoc.role,
            avatar_url: userDoc.avatar_url,
            created_at: userDoc.created_at
          },
          profile_completion: percent,
          missing_fields: missing,
          application_stats: appCounts,
          recent_applications: enrichedApps.slice(0, 5),
          upcoming_interviews: interviews,
          badges,
          recent_assessments: assessmentAttempts,
          skills_count: candidateSkills.length,
          verified_skills_count: candidateSkills.filter(s => s.is_verified).length,
          mock_interviews: mockInterviews,
          recommended_jobs: topRecommendedJobs,
          saved_job_ids: savedJobIds,
          avg_fit_score: avgFitScore,
          portfolio_count: portfolioCount,
          roadmap_count: roadmapCount
        }
      });
    } catch (error: any) {
      console.error('Get candidate dashboard error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve candidate dashboard', error: error.message });
    }
  }

  /**
   * Get Candidate Profile
   */
  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      let user = await User.findOne({ id: userId });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      if (!user.profile) {
        user.profile = {
          headline: 'Aspiring Professional',
          bio: '',
          location: 'India',
          skills: [],
          experience_years: 0
        };
        user.markModified('profile');
        await user.save();
      }

      const profile = user.profile || {};
      const { percent, missing } = calculateProfileCompletion(profile, user);

      const prefLocations = parseJson(profile.preferred_locations, []);
      const locationsList = prefLocations.length > 0
        ? prefLocations
        : (profile.preferred_location
          ? profile.preferred_location.split(',').map((s: string) => s.trim()).filter(Boolean)
          : []);

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url,
          created_at: user.created_at
        },
        profile: {
          ...profile,
          target_role: profile.preferred_job_role || '',
          preferred_job_role: profile.preferred_job_role || '',
          work_mode: profile.work_preference || 'Remote',
          work_preference: profile.work_preference || 'Remote',
          expected_salary: Number(profile.expected_salary) || 0,
          linkedin_url: profile.linkedin_url || '',
          github_url: profile.github_url || '',
          portfolio_url: profile.portfolio_website || '',
          portfolio_website: profile.portfolio_website || '',
          preferred_locations: locationsList,
          skills: parseJson(profile.skills, []),
          soft_skills: parseJson(profile.soft_skills, []),
          internships: parseJson(profile.internships, []),
          education_entries: parseJson(profile.education_entries, []),
          experience_entries: parseJson(profile.experience_entries, []),
          certifications: parseJson(profile.certifications, []),
          achievements: parseJson(profile.achievements, [])
        },
        profile_completion: percent,
        missing_fields: missing
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve profile', error: error.message });
    }
  }

  /**
   * Update Candidate Profile
   */
  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const b = req.body;

      const user = await User.findOne({ id: userId });
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      if (b.name !== undefined) user.name = b.name;
      if (b.avatar_url !== undefined) user.avatar_url = b.avatar_url;

      if (!user.profile) {
        user.profile = {};
      }

      // Handle aliases
      if (b.target_role !== undefined && b.preferred_job_role === undefined) {
        b.preferred_job_role = b.target_role;
      }
      if (b.work_mode !== undefined && b.work_preference === undefined) {
        b.work_preference = b.work_mode;
      }
      if (b.portfolio_url !== undefined && b.portfolio_website === undefined) {
        b.portfolio_website = b.portfolio_url;
      }
      if (b.preferred_locations !== undefined) {
        if (Array.isArray(b.preferred_locations)) {
          b.preferred_location = b.preferred_locations.join(', ');
        }
      } else if (b.preferred_location !== undefined && b.preferred_locations === undefined) {
        b.preferred_locations = typeof b.preferred_location === 'string'
          ? b.preferred_location.split(',').map((s: string) => s.trim()).filter(Boolean)
          : b.preferred_location;
      }

      const directFields = [
        'phone', 'location', 'headline', 'bio', 'education', 'preferred_job_role',
        'preferred_location', 'work_preference', 'linkedin_url', 'github_url', 'portfolio_website'
      ];

      directFields.forEach(field => {
        if (b[field] !== undefined) {
          user.profile[field] = b[field];
        }
      });

      if (b.experience_years !== undefined) {
        user.profile.experience_years = b.experience_years === '' || b.experience_years === null ? 0 : Number(b.experience_years);
      }
      if (b.expected_salary !== undefined) {
        user.profile.expected_salary = b.expected_salary === '' || b.expected_salary === null ? 0 : Number(b.expected_salary);
      }

      const jsonFields = [
        'skills', 'soft_skills', 'internships', 'education_entries',
        'experience_entries', 'certifications', 'achievements', 'preferred_locations'
      ];

      jsonFields.forEach(field => {
        if (b[field] !== undefined) {
          user.profile[field] = Array.isArray(b[field])
            ? b[field]
            : (typeof b[field] === 'string' ? parseJson(b[field], []) : b[field]);
        }
      });

      user.markModified('profile');
      await user.save();

      // Sync technical skills to CandidateSkill table
      if (b.skills && Array.isArray(b.skills)) {
        const existingCandidateSkills = (await CandidateSkill.find({ user_id: userId })).map(s => s.skill_name.toLowerCase());
        for (const skill of b.skills) {
          if (typeof skill === 'string' && !existingCandidateSkills.includes(skill.trim().toLowerCase())) {
            await CandidateSkill.create({
              id: uuidv4(),
              user_id: userId,
              skill_name: skill.trim(),
              proficiency: 'Intermediate',
              is_verified: false,
              source: 'self'
            });
            existingCandidateSkills.push(skill.trim().toLowerCase());
          }
        }
      }

      await CandidateProfileController.getProfile(req, res);
    } catch (error: any) {
      console.error('Update candidate profile error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update candidate profile'
      });
    }
  }

  /**
   * Get Candidate Skills with Badges & Verification
   */
  static async getSkills(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const skills = await CandidateSkill.find({ user_id: userId }).sort({ skill_name: 1 }).lean();
      const badges = await Badge.find({ user_id: userId, status: 'active' }).lean();
      const verifiedSkillNames = new Set(badges.map(b => b.skill_name.toLowerCase()));

      const enriched = skills.map(s => {
        const isVerified = s.is_verified || verifiedSkillNames.has(s.skill_name.toLowerCase());
        const badge = badges.find(b => b.skill_name.toLowerCase() === s.skill_name.toLowerCase());
        return {
          ...s,
          is_verified: isVerified ? 1 : 0,
          badge_code: badge?.badge_code,
          badge_level: badge?.level || s.proficiency
        };
      });

      res.json({
        success: true,
        skills: enriched,
        badges
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve skills', error: error.message });
    }
  }

  /**
   * Add a Skill
   */
  static async addSkill(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { skill_name, proficiency, category } = req.body;

      if (!skill_name || !skill_name.trim()) {
        res.status(400).json({ success: false, message: 'Skill name is required' });
        return;
      }

      const trimmed = skill_name.trim();
      const existing = await CandidateSkill.findOne({
        user_id: userId,
        skill_name: { $regex: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
      if (existing) {
        res.status(400).json({ success: false, message: 'Skill already exists in your profile' });
        return;
      }

      // Check if verified by badge
      const badge = await Badge.findOne({
        user_id: userId,
        skill_name: { $regex: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        status: 'active'
      });
      const isVerified = !!badge;
      const initialProficiency = proficiency || (badge?.level ?? 'Intermediate');

      const id = uuidv4();
      await CandidateSkill.create({
        id,
        user_id: userId,
        skill_name: trimmed,
        category: category || 'Technical',
        proficiency: initialProficiency,
        is_verified: isVerified,
        source: 'self'
      });

      // Sync to profile skills array
      const user = await User.findOne({ id: userId });
      if (user) {
        if (!user.profile) user.profile = {};
        const profileSkills: string[] = Array.isArray(user.profile.skills) ? user.profile.skills : [];
        if (!profileSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
          profileSkills.push(trimmed);
          user.profile.skills = profileSkills;
          user.markModified('profile');
          await user.save();
        }
      }

      res.status(201).json({
        success: true,
        message: 'Skill added',
        skill: { id, skill_name: trimmed, proficiency: initialProficiency, is_verified: isVerified ? 1 : 0 }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to add skill', error: error.message });
    }
  }

  /**
   * Update Skill Proficiency
   */
  static async updateSkillProficiency(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const skillId = String(req.params.id);
      const { proficiency } = req.body;

      const validLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
      if (!validLevels.includes(proficiency)) {
        res.status(400).json({ success: false, message: 'Invalid proficiency level' });
        return;
      }

      await CandidateSkill.updateOne({ id: skillId, user_id: userId }, { proficiency });
      res.json({ success: true, message: 'Proficiency updated' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update proficiency', error: error.message });
    }
  }

  /**
   * Remove Skill
   */
  static async removeSkill(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const skillId = String(req.params.id);

      const skill = await CandidateSkill.findOne({ id: skillId, user_id: userId });
      if (skill) {
        await CandidateSkill.deleteOne({ id: skillId, user_id: userId });

        // Remove from profile skills array
        const user = await User.findOne({ id: userId });
        if (user && user.profile) {
          const profileSkills: string[] = Array.isArray(user.profile.skills) ? user.profile.skills : [];
          user.profile.skills = profileSkills.filter(s => s.toLowerCase() !== skill.skill_name.toLowerCase());
          user.markModified('profile');
          await user.save();
        }
      }

      res.json({ success: true, message: 'Skill removed' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to remove skill', error: error.message });
    }
  }

  /**
   * Saved Jobs
   */
  static async getSavedJobs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const rows = await SavedJob.find({ user_id: userId }).sort({ created_at: -1 }).lean();

      const savedJobs = await Promise.all(
        rows.map(async sj => {
          const job = await Job.findOne({ id: sj.job_id }).lean();
          if (!job) return null;

          let matchScore = 0;
          let matchedSkills: any[] = [];
          let missingSkills: any[] = [];
          try {
            const fit = await computeJobFitScore(userId, job.id);
            matchScore = fit.overall_percentage;
            matchedSkills = fit.matched_skills;
            missingSkills = fit.missing_skills;
          } catch {
            matchScore = 50;
          }

          return {
            ...job,
            saved_id: sj.id,
            saved_at: sj.created_at,
            required_skills: parseJson(job.required_skills, []),
            preferred_skills: parseJson(job.preferred_skills, []),
            benefits: parseJson(job.benefits_text ? [job.benefits_text] : [], []),
            match_score: matchScore,
            matched_skills: matchedSkills,
            missing_skills: missingSkills
          };
        })
      );

      res.json({ success: true, saved_jobs: savedJobs.filter(Boolean) });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve saved jobs', error: error.message });
    }
  }

  static async saveJob(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { job_id } = req.body;

      if (!job_id) {
        res.status(400).json({ success: false, message: 'job_id is required' });
        return;
      }

      const job = await Job.findOne({ id: job_id });
      if (!job) {
        res.status(404).json({ success: false, message: 'Job not found' });
        return;
      }

      const existing = await SavedJob.findOne({ user_id: userId, job_id });
      if (existing) {
        res.json({ success: true, message: 'Job already saved' });
        return;
      }

      await SavedJob.create({
        id: uuidv4(),
        user_id: userId,
        job_id,
        created_at: new Date().toISOString()
      });

      res.status(201).json({ success: true, message: 'Job saved successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to save job', error: error.message });
    }
  }

  static async unsaveJob(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const jobId = String(req.params.jobId);

      await SavedJob.deleteOne({ user_id: userId, job_id: jobId });
      res.json({ success: true, message: 'Job removed from saved' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to unsave job', error: error.message });
    }
  }

  /**
   * Resumes
   */
  static async getResumes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const resumes = await Resume.find({ user_id: userId }).sort({ is_primary: -1, created_at: -1 }).lean();
      res.json({
        success: true,
        resumes: resumes.map(r => ({
          ...r,
          suggestions: parseJson(r.suggestions, [])
        }))
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve resumes', error: error.message });
    }
  }

  static async uploadResume(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { file_name, content_text, is_primary } = req.body;

      if (!file_name) {
        res.status(400).json({ success: false, message: 'File name is required' });
        return;
      }

      const existingCount = await Resume.countDocuments({ user_id: userId });
      const shouldBePrimary = is_primary || existingCount === 0;

      if (shouldBePrimary) {
        await Resume.updateMany({ user_id: userId }, { is_primary: false });
      }

      const id = uuidv4();
      await Resume.create({
        id,
        user_id: userId,
        file_name,
        content_text: content_text || '',
        is_primary: shouldBePrimary,
        created_at: new Date().toISOString()
      });

      res.status(201).json({ success: true, message: 'Resume uploaded successfully', resume_id: id });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to upload resume', error: error.message });
    }
  }

  static async setPrimaryResume(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const resumeId = String(req.params.id);

      await Resume.updateMany({ user_id: userId }, { is_primary: false });
      await Resume.updateOne({ id: resumeId, user_id: userId }, { is_primary: true });
      res.json({ success: true, message: 'Primary resume updated' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to set primary resume', error: error.message });
    }
  }

  static async deleteResume(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const resumeId = String(req.params.id);

      await Resume.deleteOne({ id: resumeId, user_id: userId });

      // If no primary left, make the newest one primary
      const hasPrimary = await Resume.findOne({ user_id: userId, is_primary: true });
      if (!hasPrimary) {
        const newest = await Resume.findOne({ user_id: userId }).sort({ created_at: -1 });
        if (newest) {
          newest.is_primary = true;
          await newest.save();
        }
      }

      res.json({ success: true, message: 'Resume deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete resume', error: error.message });
    }
  }

  /**
   * Candidate Settings
   */
  static async getSettings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      let user = await User.findOne({ id: userId });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      if (!user.candidate_settings) {
        const defaultJobPrefs = {
          desired_roles: ['Software Engineer'],
          work_modes: ['Remote', 'Hybrid'],
          preferred_locations: ['Remote', 'Bangalore', 'New York'],
          min_salary: 0,
          currency: 'USD'
        };
        const defaultNotifPrefs = {
          email_job_alerts: true,
          email_application_updates: true,
          email_interview_invites: true,
          email_marketing: false
        };
        const defaultPrivacyPrefs = {
          profile_visibility: 'public', // 'public' | 'recruiters_only' | 'private'
          resume_visibility: 'applied_only', // 'public' | 'applied_only'
          share_mock_interview_scores: false
        };

        user.candidate_settings = {
          job_preferences: defaultJobPrefs,
          notification_preferences: defaultNotifPrefs,
          privacy_preferences: defaultPrivacyPrefs,
          updated_at: new Date().toISOString()
        };
        user.markModified('candidate_settings');
        await user.save();
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url
        },
        settings: {
          job_preferences: parseJson(user.candidate_settings?.job_preferences, {}),
          notification_preferences: parseJson(user.candidate_settings?.notification_preferences, {}),
          privacy_preferences: parseJson(user.candidate_settings?.privacy_preferences, {})
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve candidate settings', error: error.message });
    }
  }

  static async updateSettings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { job_preferences, notification_preferences, privacy_preferences, new_password, current_password, name } = req.body;

      const user = await User.findOne({ id: userId });
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      if (name) {
        user.name = name;
      }

      // Password change
      if (new_password) {
        if (!current_password) {
          res.status(400).json({ success: false, message: 'Current password is required to set a new password' });
          return;
        }
        if (!bcrypt.compareSync(current_password, user.password_hash)) {
          res.status(400).json({ success: false, message: 'Current password is incorrect' });
          return;
        }
        user.password_hash = bcrypt.hashSync(new_password, 10);
      }

      if (!user.candidate_settings) {
        user.candidate_settings = {};
      }

      if (job_preferences !== undefined) {
        user.candidate_settings.job_preferences = typeof job_preferences === 'string'
          ? parseJson(job_preferences, {})
          : job_preferences;
      }
      if (notification_preferences !== undefined) {
        user.candidate_settings.notification_preferences = typeof notification_preferences === 'string'
          ? parseJson(notification_preferences, {})
          : notification_preferences;
      }
      if (privacy_preferences !== undefined) {
        user.candidate_settings.privacy_preferences = typeof privacy_preferences === 'string'
          ? parseJson(privacy_preferences, {})
          : privacy_preferences;
      }

      user.candidate_settings.updated_at = new Date().toISOString();
      user.markModified('candidate_settings');
      await user.save();

      await CandidateProfileController.getSettings(req, res);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update settings', error: error.message });
    }
  }

  /**
   * Interview Prep Progress Tracking
   */
  static async getInterviewPrepProgress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const progress = await InterviewPrepProgress.find({ user_id: userId }).lean();
      res.json({ success: true, progress });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve prep progress', error: error.message });
    }
  }

  static async toggleInterviewPrepQuestion(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { question_id, category, is_completed, notes } = req.body;

      if (!question_id || !category) {
        res.status(400).json({ success: false, message: 'question_id and category are required' });
        return;
      }

      const existing = await InterviewPrepProgress.findOne({ user_id: userId, question_id });
      const now = new Date().toISOString();

      if (existing) {
        const nextCompleted = is_completed !== undefined ? !!is_completed : !existing.is_completed;
        existing.is_completed = nextCompleted;
        if (notes !== undefined) existing.notes = notes;
        existing.updated_at = now;
        await existing.save();
        res.json({ success: true, is_completed: nextCompleted });
      } else {
        const id = uuidv4();
        const completed = is_completed !== undefined ? !!is_completed : true;
        await InterviewPrepProgress.create({
          id,
          user_id: userId,
          question_id,
          category,
          is_completed: completed,
          notes: notes || '',
          updated_at: now
        });
        res.json({ success: true, is_completed: completed });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to toggle interview question', error: error.message });
    }
  }
}
