import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON
} from '@simplewebauthn/server';
import { isoBase64URL, isoUint8Array } from '@simplewebauthn/server/helpers';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { Badge } from '../models/Badge.js';
import { PasswordReset } from '../models/PasswordReset.js';
import { generateToken, AuthRequest } from '../middleware/auth.middleware.js';
import { logAuditEvent } from '../middleware/audit.middleware.js';

// Temporary challenge store with 5-minute TTL
const challengeStore = new Map<string, { challenge: string; expiresAt: number }>();

function setChallenge(key: string, challenge: string): void {
  const now = Date.now();
  for (const [k, v] of challengeStore.entries()) {
    if (v.expiresAt < now) {
      challengeStore.delete(k);
    }
  }
  challengeStore.set(key, {
    challenge,
    expiresAt: now + 5 * 60 * 1000
  });
}

function getAndConsumeChallenge(key: string): string | null {
  const stored = challengeStore.get(key);
  if (!stored) return null;
  challengeStore.delete(key);
  if (stored.expiresAt < Date.now()) return null;
  return stored.challenge;
}

function getRpSettings(req: Request) {
  const originHeader = req.get('origin') || req.get('referer');
  let expectedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
  let rpID = process.env.RP_ID || 'localhost';

  if (originHeader) {
    try {
      const url = new URL(originHeader);
      expectedOrigin = url.origin;
      rpID = url.hostname;
    } catch {
      // fallback
    }
  }

  const allowedOrigins = [
    expectedOrigin,
    'http://localhost:5173',
    'http://localhost:5001',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5001'
  ];

  return { rpID, expectedOrigin: Array.from(new Set(allowedOrigins)) };
}

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role, headline, preferred_language, company_name, company_industry } = req.body;

      if (!name || !email || !password || !role) {
        res.status(400).json({ success: false, message: 'Name, email, password, and role are required.' });
        return;
      }

      if (!['job_seeker', 'employer'].includes(role)) {
        res.status(400).json({ success: false, message: 'Invalid role. Choose Job Seeker or Employer.' });
        return;
      }

      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }

      const userId = `u-${uuidv4()}`;
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);
      const now = new Date().toISOString();
      const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

      let profileData = null;
      if (role === 'job_seeker') {
        profileData = {
          headline: headline || 'Aspiring Professional',
          bio: '',
          location: 'India',
          skills: [],
          experience_years: 0,
          preferred_language: preferred_language || 'en'
        };
      }

      await User.create({
        id: userId,
        name,
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        role,
        avatar_url: defaultAvatar,
        created_at: now,
        profile: profileData
      });

      if (role === 'employer') {
        await Company.create({
          id: `comp-${uuidv4()}`,
          user_id: userId,
          name: company_name || `${name}'s Organization`,
          industry: company_industry || 'Technology',
          description: '',
          location: 'Remote / On-site'
        });
      }

      const token = generateToken({ id: userId, name, email: email.toLowerCase().trim(), role });
      logAuditEvent(userId, 'REGISTER', 'AUTH', req.ip || '127.0.0.1', { role, email });

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token,
        user: { id: userId, name, email: email.toLowerCase().trim(), role, avatar_url: defaultAvatar }
      });
    } catch (error: any) {
      console.error('Register error:', error);
      res.status(500).json({ success: false, message: 'Registration failed.', error: error.message });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required.' });
        return;
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user || user.account_deleted) {
        logAuditEvent(null, 'LOGIN_FAILED', 'AUTH', req.ip || '127.0.0.1', { email, reason: 'User not found' });
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      if (user.status === 'suspended') {
        res.status(403).json({ success: false, message: 'This account has been suspended. Contact support.' });
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

  static async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const user = await User.findOne({ id: userId }).lean();

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      let profile = null;
      let company = null;
      let badges: any[] = [];

      if (user.role === 'job_seeker') {
        profile = user.profile || null;
        badges = await Badge.find({ user_id: userId, status: 'active' }).sort({ issued_at: -1 }).lean();
      } else if (user.role === 'employer') {
        company = await Company.findOne({ user_id: userId }).lean();
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
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

  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { headline, bio, location, skills, experience_years, education, preferred_language, github_url, linkedin_url, portfolio_website, name } = req.body;

      const user = await User.findOne({ id: userId });
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      if (name) {
        user.name = name;
      }

      const skillsList = Array.isArray(skills) ? skills : [];
      if (!user.profile) {
        user.profile = {};
      }

      user.profile.headline = headline || '';
      user.profile.bio = bio || '';
      user.profile.location = location || '';
      user.profile.skills = skillsList;
      user.profile.experience_years = experience_years || 0;
      user.profile.education = education || '';
      user.profile.preferred_language = preferred_language || 'en';
      user.profile.github_url = github_url || '';
      user.profile.linkedin_url = linkedin_url || '';
      user.profile.portfolio_website = portfolio_website || '';

      user.markModified('profile');
      await user.save();

      logAuditEvent(userId || null, 'PROFILE_UPDATED', 'SECURITY', req.ip || '127.0.0.1', { skillsCount: skillsList.length });

      res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
    }
  }

  static logout(req: AuthRequest, res: Response): void {
    logAuditEvent(req.user?.id || null, 'LOGOUT', 'AUTH', req.ip || '127.0.0.1', {});
    res.json({ success: true, message: 'Logged out' });
  }

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ success: false, message: 'Email is required' });
        return;
      }
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (user) {
        const token = crypto.randomBytes(24).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        
        await PasswordReset.create({
          id: uuidv4(),
          user_id: user.id,
          token_hash: tokenHash,
          expires_at: expires,
          used: false,
          created_at: new Date().toISOString()
        });

        res.json({
          success: true,
          message: 'If an account exists, a reset token was generated. Use it on the reset-password page.',
          reset_token: token
        });
        return;
      }
      res.json({ success: true, message: 'If an account exists, password reset instructions were issued.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to start password reset', error: error.message });
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, new_password } = req.body;
      if (!token || !new_password || String(new_password).length < 8) {
        res.status(400).json({ success: false, message: 'Valid token and a new password (8+ characters) are required.' });
        return;
      }
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const row = await PasswordReset.findOne({ token_hash: tokenHash, used: false });
      if (!row || new Date(row.expires_at).getTime() < Date.now()) {
        res.status(400).json({ success: false, message: 'Reset token is invalid or expired.' });
        return;
      }
      const passwordHash = bcrypt.hashSync(new_password, 10);
      await User.updateOne({ id: row.user_id }, { password_hash: passwordHash });
      row.used = true;
      await row.save();

      logAuditEvent(row.user_id, 'PASSWORD_RESET', 'SECURITY', req.ip || '127.0.0.1', {});
      res.json({ success: true, message: 'Password updated. You can sign in now.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to reset password', error: error.message });
    }
  }

  static async adminLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email?.toLowerCase()?.trim() });
      if (!user || user.role !== 'admin' || !bcrypt.compareSync(password, user.password_hash)) {
        logAuditEvent(user?.id || null, 'ADMIN_LOGIN_FAILED', 'AUTH', req.ip || '127.0.0.1', { email });
        res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
        return;
      }
      const token = generateToken({ id: user.id, name: user.name, email: user.email, role: user.role });
      logAuditEvent(user.id, 'ADMIN_LOGIN_SUCCESS', 'AUTH', req.ip || '127.0.0.1', {});
      res.json({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar_url: user.avatar_url }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Admin login failed', error: error.message });
    }
  }

  static async biometricRegisterOptions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const user = await User.findOne({ id: userId });
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const { rpID } = getRpSettings(req);
      const options = await generateRegistrationOptions({
        rpName: 'SkillBridge',
        rpID,
        userName: user.email,
        userDisplayName: user.name,
        userID: isoUint8Array.fromUTF8String(user.id),
        attestationType: 'none',
        excludeCredentials: user.biometric_credential_id ? [{
          id: user.biometric_credential_id,
          transports: user.biometric_transports || ['internal', 'hybrid', 'usb', 'ble', 'nfc']
        }] : [],
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred'
        }
      });

      setChallenge(`reg-${user.id}`, options.challenge);

      res.json({
        success: true,
        options
      });
    } catch (error: any) {
      console.error('Biometric register options error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate biometric registration options.', error: error.message });
    }
  }

  static async biometricRegisterVerify(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const response: RegistrationResponseJSON = req.body?.response || req.body;
      if (!response || !response.id) {
        res.status(400).json({ success: false, message: 'Attestation response is required.' });
        return;
      }

      const user = await User.findOne({ id: userId });
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const expectedChallenge = getAndConsumeChallenge(`reg-${user.id}`);
      if (!expectedChallenge) {
        res.status(400).json({ success: false, message: 'Registration challenge expired or invalid. Please request options again.' });
        return;
      }

      const { rpID, expectedOrigin } = getRpSettings(req);

      const verification = await verifyRegistrationResponse({
        response,
        expectedChallenge,
        expectedOrigin,
        expectedRPID: rpID,
        requireUserVerification: false
      });

      if (!verification.verified || !verification.registrationInfo) {
        res.status(400).json({ success: false, message: 'Biometric verification failed.' });
        return;
      }

      const { credential } = verification.registrationInfo;

      user.biometric_enabled = true;
      user.biometric_credential_id = credential.id;
      user.biometric_public_key = isoBase64URL.fromBuffer(credential.publicKey);
      user.biometric_counter = credential.counter;
      if (credential.transports) {
        user.biometric_transports = credential.transports;
      }
      await user.save();

      logAuditEvent(user.id, 'BIOMETRIC_REGISTERED', 'AUTH', req.ip || '127.0.0.1', {});

      res.json({
        success: true,
        message: 'Biometric passkey registered successfully.'
      });
    } catch (error: any) {
      console.error('Biometric register verify error:', error);
      res.status(500).json({ success: false, message: 'Failed to verify biometric registration.', error: error.message });
    }
  }

  static async biometricLoginOptions(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ success: false, message: 'Email is required.' });
        return;
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user || user.account_deleted) {
        logAuditEvent(null, 'BIOMETRIC_LOGIN_FAILED', 'AUTH', req.ip || '127.0.0.1', { email, reason: 'User not found' });
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      if (user.status === 'suspended') {
        res.status(403).json({ success: false, message: 'This account has been suspended. Contact support.' });
        return;
      }

      if (!user.biometric_enabled || !user.biometric_credential_id || !user.biometric_public_key) {
        res.status(400).json({ success: false, message: 'Biometric authentication is not enabled for this account.' });
        return;
      }

      const { rpID } = getRpSettings(req);

      const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: [{
          id: user.biometric_credential_id,
          transports: user.biometric_transports && user.biometric_transports.length > 0 ? user.biometric_transports : undefined
        }],
        userVerification: 'preferred'
      });

      setChallenge(`login-${user.email.toLowerCase().trim()}`, options.challenge);

      res.json({
        success: true,
        options
      });
    } catch (error: any) {
      console.error('Biometric login options error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate biometric login options.', error: error.message });
    }
  }

  static async biometricLoginVerify(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const response: AuthenticationResponseJSON = req.body?.response || req.body;

      if (!email || !response || !response.id) {
        res.status(400).json({ success: false, message: 'Email and biometric response are required.' });
        return;
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user || user.account_deleted) {
        logAuditEvent(null, 'BIOMETRIC_LOGIN_FAILED', 'AUTH', req.ip || '127.0.0.1', { email, reason: 'User not found' });
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      if (user.status === 'suspended') {
        res.status(403).json({ success: false, message: 'This account has been suspended. Contact support.' });
        return;
      }

      if (!user.biometric_enabled || !user.biometric_credential_id || !user.biometric_public_key) {
        res.status(400).json({ success: false, message: 'Biometric authentication is not enabled for this account.' });
        return;
      }

      const expectedChallenge = getAndConsumeChallenge(`login-${user.email.toLowerCase().trim()}`);
      if (!expectedChallenge) {
        res.status(400).json({ success: false, message: 'Authentication challenge expired or invalid. Please try again.' });
        return;
      }

      const { rpID, expectedOrigin } = getRpSettings(req);

      const credential = {
        id: user.biometric_credential_id,
        publicKey: isoBase64URL.toBuffer(user.biometric_public_key),
        counter: user.biometric_counter || 0,
        transports: user.biometric_transports
      };

      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge,
        expectedOrigin,
        expectedRPID: rpID,
        credential,
        requireUserVerification: false
      });

      if (!verification.verified || !verification.authenticationInfo) {
        logAuditEvent(user.id, 'BIOMETRIC_LOGIN_FAILED', 'AUTH', req.ip || '127.0.0.1', { reason: 'Verification failed' });
        res.status(401).json({ success: false, message: 'Biometric verification failed.' });
        return;
      }

      user.biometric_counter = verification.authenticationInfo.newCounter;
      await user.save();

      const token = generateToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });

      logAuditEvent(user.id, 'LOGIN_SUCCESS', 'AUTH', req.ip || '127.0.0.1', { method: 'biometric' });

      res.json({
        success: true,
        message: 'Biometric login successful',
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
      console.error('Biometric login verify error:', error);
      res.status(500).json({ success: false, message: 'Biometric login failed.', error: error.message });
    }
  }
}
