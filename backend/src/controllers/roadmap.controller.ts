import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Roadmap } from '../models/Roadmap.js';
import { User } from '../models/User.js';
import { Job } from '../models/Job.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { AIService } from '../services/ai.service.js';
import { computeJobFitScore } from '../services/matching.service.js';

export class RoadmapController {
  static async generateRoadmap(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { target_role, target_job_id } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const user = await User.findOne({ id: userId }).lean();
      const currentSkills: string[] = user?.profile?.skills || [];

      let missingSkills: string[] = [];
      let jobTitle = target_role;

      if (target_job_id) {
        try {
          const fit = await computeJobFitScore(userId, target_job_id);
          missingSkills = fit.missing_skills.map((m: any) => m.name);
          const job = await Job.findOne({ id: target_job_id }).lean();
          if (job) jobTitle = job.title;
        } catch (e) {
          // ignore
        }
      }

      const generated = AIService.generateSkillGapRoadmap(target_role || 'Full Stack Engineer', currentSkills, missingSkills, jobTitle);

      const roadmapId = `road-${uuidv4()}`;
      const now = new Date().toISOString();

      await Roadmap.create({
        id: roadmapId,
        user_id: userId,
        target_role: generated.target_role,
        target_job_id: target_job_id || null,
        overall_progress: 0,
        stages: generated.stages,
        ai_coaching_advice: generated.ai_coaching_advice,
        created_at: now
      });

      res.status(201).json({
        success: true,
        roadmap: {
          id: roadmapId,
          user_id: userId,
          target_role: generated.target_role,
          target_job_id,
          overall_progress: 0,
          stages: generated.stages,
          ai_coaching_advice: generated.ai_coaching_advice,
          created_at: now
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to generate roadmap', error: error.message });
    }
  }

  static async getMyRoadmaps(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const roadmaps = await Roadmap.find({ user_id: userId }).sort({ created_at: -1 }).lean();

      const formatted = roadmaps.map(r => ({
        ...r,
        stages: Array.isArray(r.stages) ? r.stages : JSON.parse((r.stages as any) || '[]')
      }));

      res.json({ success: true, roadmaps: formatted });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch roadmaps', error: error.message });
    }
  }

  static async toggleStepItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { itemId, completed } = req.body;

      const roadmap = await Roadmap.findOne({ id, user_id: userId });
      if (!roadmap) {
        res.status(404).json({ success: false, message: 'Roadmap not found' });
        return;
      }

      const stages = Array.isArray(roadmap.stages) ? roadmap.stages : JSON.parse((roadmap.stages as any) || '[]');
      let totalItems = 0;
      let completedItems = 0;

      stages.forEach((stage: any) => {
        stage.items?.forEach((item: any) => {
          if (item.id === itemId) {
            item.completed = completed;
          }
          totalItems++;
          if (item.completed) completedItems++;
        });
      });

      const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      roadmap.stages = stages;
      roadmap.overall_progress = overallProgress;
      roadmap.markModified('stages');
      await roadmap.save();

      res.json({
        success: true,
        overall_progress: overallProgress,
        stages
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update roadmap item', error: error.message });
    }
  }
}
