import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Portfolio } from '../models/Portfolio.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { logAuditEvent } from '../middleware/audit.middleware.js';

export class PortfolioController {
  static async getMyPortfolios(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const portfolios = await Portfolio.find({ user_id: userId }).sort({ created_at: -1 }).lean();

      const formatted = portfolios.map(p => ({
        ...p,
        skills_used: Array.isArray(p.skills_used) ? p.skills_used : JSON.parse((p.skills_used as any) || '[]')
      }));

      res.json({ success: true, portfolios: formatted });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch portfolios', error: error.message });
    }
  }

  static async getPortfoliosByUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const portfolios = await Portfolio.find({ user_id: userId }).sort({ created_at: -1 }).lean();

      const formatted = portfolios.map(p => ({
        ...p,
        skills_used: Array.isArray(p.skills_used) ? p.skills_used : JSON.parse((p.skills_used as any) || '[]')
      }));

      res.json({ success: true, portfolios: formatted });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch user portfolios', error: error.message });
    }
  }

  static async createPortfolio(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { title, description, problem_solved, skills_used, github_url, live_demo_url, screenshot_url } = req.body;

      if (!title || !description || !skills_used) {
        res.status(400).json({ success: false, message: 'Title, description, and skills used are required' });
        return;
      }

      const portfolioId = `port-${uuidv4()}`;
      const now = new Date().toISOString();
      const skillsArray: string[] = Array.isArray(skills_used) ? skills_used : [skills_used];

      await Portfolio.create({
        id: portfolioId,
        user_id: userId,
        title,
        description,
        problem_solved: problem_solved || '',
        skills_used: skillsArray,
        github_url: github_url || '',
        live_demo_url: live_demo_url || '',
        screenshot_url: screenshot_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
        created_at: now
      });

      // Auto-add newly demonstrated project skills to user claimed skills
      const user = await User.findOne({ id: userId });
      if (user && user.profile) {
        const currentSkills: string[] = Array.isArray(user.profile.skills) ? [...user.profile.skills] : [];
        let updated = false;
        skillsArray.forEach(sk => {
          if (!currentSkills.includes(sk)) {
            currentSkills.push(sk);
            updated = true;
          }
        });
        if (updated) {
          user.profile.skills = currentSkills;
          user.markModified('profile');
          await user.save();
        }
      }

      logAuditEvent(userId || null, 'PORTFOLIO_CREATED', 'PROFILE_ACCESS', req.ip || '127.0.0.1', {
        portfolioId,
        title,
        skills: skillsArray
      });

      res.status(201).json({
        success: true,
        message: 'Portfolio project added successfully',
        portfolioId
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to create portfolio item', error: error.message });
    }
  }

  static async deletePortfolio(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const result = await Portfolio.deleteOne({ id, user_id: userId });

      if (result.deletedCount === 0) {
        res.status(404).json({ success: false, message: 'Portfolio item not found or unauthorized' });
        return;
      }

      res.json({ success: true, message: 'Portfolio project deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete portfolio', error: error.message });
    }
  }
}
