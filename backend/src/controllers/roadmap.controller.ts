import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { AIService } from '../services/ai.service.js';
import { computeJobFitScore } from '../services/matching.service.js';

export class RoadmapController {
  static generateRoadmap(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id;
      const { target_role, target_job_id } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const profile = db.prepare('SELECT skills FROM profiles WHERE user_id = ?').get(userId) as any;
      const currentSkills: string[] = profile?.skills ? JSON.parse(profile.skills) : [];

      let missingSkills: string[] = [];
      let jobTitle = target_role;

      if (target_job_id) {
        try {
          const fit = computeJobFitScore(userId, target_job_id);
          missingSkills = fit.missing_skills.map(m => m.name);
          const job = db.prepare('SELECT title FROM jobs WHERE id = ?').get(target_job_id) as any;
          if (job) jobTitle = job.title;
        } catch (e) {
          // ignore
        }
      }

      const generated = AIService.generateSkillGapRoadmap(target_role || 'Full Stack Engineer', currentSkills, missingSkills, jobTitle);

      const roadmapId = `road-${uuidv4()}`;
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO roadmaps (id, user_id, target_role, target_job_id, overall_progress, stages, ai_coaching_advice, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        roadmapId,
        userId,
        generated.target_role,
        target_job_id || null,
        0,
        JSON.stringify(generated.stages),
        generated.ai_coaching_advice,
        now
      );

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

  static getMyRoadmaps(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id;
      const roadmaps = db.prepare('SELECT * FROM roadmaps WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];

      const formatted = roadmaps.map(r => ({
        ...r,
        stages: JSON.parse(r.stages || '[]')
      }));

      res.json({ success: true, roadmaps: formatted });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch roadmaps', error: error.message });
    }
  }

  static toggleStepItem(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { itemId, completed } = req.body;

      const roadmap = db.prepare('SELECT * FROM roadmaps WHERE id = ? AND user_id = ?').get(id, userId) as any;
      if (!roadmap) {
        res.status(404).json({ success: false, message: 'Roadmap not found' });
        return;
      }

      const stages = JSON.parse(roadmap.stages || '[]');
      let totalItems = 0;
      let completedItems = 0;

      stages.forEach((stage: any) => {
        stage.items.forEach((item: any) => {
          if (item.id === itemId) {
            item.completed = completed;
          }
          totalItems++;
          if (item.completed) completedItems++;
        });
      });

      const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      db.prepare(`
        UPDATE roadmaps
        SET stages = ?, overall_progress = ?
        WHERE id = ?
      `).run(JSON.stringify(stages), overallProgress, id);

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
