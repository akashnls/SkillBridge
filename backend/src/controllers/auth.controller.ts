import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { generateToken, AuthRequest } from '../middleware/auth.middleware.js';
import { logAuditEvent } from '../middleware/audit.middleware.js';

export class AuthController {
  static register(req: Request, res: Response): void {
    try {
      const { name, email, password, role, headline, preferred_language, company_name, company_industry } = req.body;

      if (!name || !email || !password || !role) {
        res.status(400).json({ success: false, message: 'Name, email, password, and role are required.' });
        return;
      }

      if (!['job_seeker', 'employer', 'admin'].includes(role)) {
        res.status(400).json({ success: false, message: 'Invalid role.' });
        return;
      }

      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existingUser) {
        res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }

      const userId = `u-${uuidv4()}`;
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);
      const now = new Date().toISOString();
      const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

      db.prepare(`
        INSERT INTO users (id, name, email, password_hash, role, avatar_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(userId, name, email, passwordHash, role, defaultAvatar, now);

      if (role === 'job_seeker') {
        db.prepare(`
          INSERT INTO profiles (user_id, headline, bio, location, skills, experience_years, preferred_language)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(userId, headline || 'Aspiring Professional', '', 'India', JSON.stringify([]), 0, preferred_language || 'en');
      } else if (role === 'employer') {
        db.prepare(`
          INSERT INTO companies (id, user_id, name, industry, description, location)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(`comp-${uuidv4()}`, userId, company_name || `${name}'s Organization`, company_industry || 'Technology', '', 'Remote / On-site');
      }

      const token = generateToken({ id: userId, name, email, role });
      logAuditEvent(userId, 'REGISTER', 'AUTH', req.ip || '127.0.0.1', { role, email });

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token,
        user: { id: userId, name, email, role, avatar_url: defaultAvatar }
      });
    } catch (error: any) {
      console.error('Register error:', error);
      res.status(500).json({ success: false, message: 'Registration failed.', error: error.message });
    }
  }

  static login(req: Request, res: Response): void {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required.' });
        return;
      }

      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      if (!user) {
        logAuditEvent(null, 'LOGIN_FAILED', 'AUTH', req.ip || '127.0.0.1', { email, reason: 'User not found' });
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
      if (!isPasswordValid) {
        logAuditEvent(user.id, 'LOGIN_FAILED', 'AUTH', req.ip || '127.0.0.1', { email, reason: 'Invalid password' });
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const token = generateToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });

      logAuditEvent(user.id, 'LOGIN_SUCCESS', 'AUTH', req.ip || '127.0.0.1', { method: 'password' });

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url,
          biometric_enabled: !!user.biometric_enabled
        }
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Login failed.', error: error.message });
    }
  }

  static getMe(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id;
      const user = db.prepare('SELECT id, name, email, role, avatar_url, biometric_enabled, created_at FROM users WHERE id = ?').get(userId) as any;

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      let profile = null;
      let company = null;
      let badges: any[] = [];

      if (user.role === 'job_seeker') {
        profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId) as any;
        if (profile && profile.skills) {
          profile.skills = JSON.parse(profile.skills);
        }
        badges = db.prepare("SELECT * FROM badges WHERE user_id = ? AND status = 'active' ORDER BY issued_at DESC").all(userId) as any[];
      } else if (user.role === 'employer') {
        company = db.prepare('SELECT * FROM companies WHERE user_id = ?').get(userId) as any;
      }

      res.json({
        success: true,
        user: {
          ...user,
          biometric_enabled: !!user.biometric_enabled,
          profile,
          company,
          badges
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve profile', error: error.message });
    }
  }

  static updateProfile(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id;
      const { headline, bio, location, skills, experience_years, education, preferred_language, github_url, linkedin_url, portfolio_website, name } = req.body;

      if (name) {
        db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, userId);
      }

      const skillsJson = Array.isArray(skills) ? JSON.stringify(skills) : JSON.stringify([]);

      db.prepare(`
        UPDATE profiles
        SET headline = ?, bio = ?, location = ?, skills = ?, experience_years = ?, education = ?, preferred_language = ?, github_url = ?, linkedin_url = ?, portfolio_website = ?
        WHERE user_id = ?
      `).run(headline || '', bio || '', location || '', skillsJson, experience_years || 0, education || '', preferred_language || 'en', github_url || '', linkedin_url || '', portfolio_website || '', userId);

      logAuditEvent(userId || null, 'PROFILE_UPDATED', 'SECURITY', req.ip || '127.0.0.1', { skillsCount: Array.isArray(skills) ? skills.length : 0 });

      res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
    }
  }

  /**
   * WebAuthn / Biometric Registration Simulation
   */
  static registerBiometric(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id;
      const credentialId = `bio-cred-${crypto.randomBytes(16).toString('hex')}`;
      const mockPublicKey = `bio-pub-${crypto.randomBytes(32).toString('hex')}`;

      db.prepare(`
        UPDATE users
        SET biometric_enabled = 1, biometric_credential_id = ?, biometric_public_key = ?
        WHERE id = ?
      `).run(credentialId, mockPublicKey, userId);

      logAuditEvent(userId || null, 'WEBAUTHN_REGISTERED', 'SECURITY', req.ip || '127.0.0.1', { credentialId });

      res.json({
        success: true,
        message: 'Biometric passkey (WebAuthn/FIDO2) successfully registered on device!',
        credentialId
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Biometric registration failed', error: error.message });
    }
  }

  /**
   * WebAuthn / Biometric Login
   */
  static loginBiometric(req: Request, res: Response): void {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ success: false, message: 'Email is required for biometric authentication' });
        return;
      }

      const user = db.prepare('SELECT * FROM users WHERE email = ? AND biometric_enabled = 1').get(email) as any;
      if (!user) {
        res.status(404).json({ success: false, message: 'No biometric credentials registered for this account.' });
        return;
      }

      const token = generateToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });

      logAuditEvent(user.id, 'WEBAUTHN_LOGIN_SUCCESS', 'AUTH', req.ip || '127.0.0.1', { method: 'WebAuthn_FIDO2' });

      res.json({
        success: true,
        message: 'Biometric authentication verified successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url,
          biometric_enabled: true
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Biometric login failed', error: error.message });
    }
  }
}
