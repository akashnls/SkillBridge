import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { logAuditEvent } from '../middleware/audit.middleware.js';

export class PortfolioController {
  static getMyPortfolios(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id;
      const portfolios = db.prepare('SELECT * FROM portfolios WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];

      const formatted = portfolios.map(p => ({
        ...p,
        skills_used: JSON.parse(p.skills_used || '[]')
      }));

      res.json({ success: true, portfolios: formatted });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch portfolios', error: error.message });
    }
  }

  static getPortfoliosByUser(req: AuthRequest, res: Response): void {
    try {
      const { userId } = req.params;
      const portfolios = db.prepare('SELECT * FROM portfolios WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];

      const formatted = portfolios.map(p => ({
        ...p,
        skills_used: JSON.parse(p.skills_used || '[]')
      }));

      res.json({ success: true, portfolios: formatted });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch user portfolios', error: error.message });
    }
  }

  static createPortfolio(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id;
      const { title, description, problem_solved, skills_used, github_url, live_demo_url, screenshot_url } = req.body;

      if (!title || !description || !skills_used) {
        res.status(400).json({ success: false, message: 'Title, description, and skills used are required' });
        return;
      }

      const portfolioId = `port-${uuidv4()}`;
      const now = new Date().toISOString();
      const skillsArray = Array.isArray(skills_used) ? skills_used : [skills_used];

      db.prepare(`
        INSERT INTO portfolios (id, user_id, title, description, problem_solved, skills_used, github_url, live_demo_url, screenshot_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        portfolioId,
        userId,
        title,
        description,
        problem_solved || '',
        JSON.stringify(skillsArray),
        github_url || '',
        live_demo_url || '',
        screenshot_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
        now
      );

      // Auto-add newly demonstrated project skills to user claimed skills
      const profile = db.prepare('SELECT skills FROM profiles WHERE user_id = ?').get(userId) as any;
      if (profile) {
        const currentSkills: string[] = JSON.parse(profile.skills || '[]');
        let updated = false;
        skillsArray.forEach(sk => {
          if (!currentSkills.includes(sk)) {
            currentSkills.push(sk);
            updated = true;
          }
        });
        if (updated) {
          db.prepare('UPDATE profiles SET skills = ? WHERE user_id = ?').run(JSON.stringify(currentSkills), userId);
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

  static deletePortfolio(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const result = db.prepare('DELETE FROM portfolios WHERE id = ? AND user_id = ?').run(id, userId);

      if (result.changes === 0) {
        res.status(404).json({ success: false, message: 'Portfolio item not found or unauthorized' });
        return;
      }

      res.json({ success: true, message: 'Portfolio project deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete portfolio', error: error.message });
    }
  }
}
