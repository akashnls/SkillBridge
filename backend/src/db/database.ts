import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.resolve(__dirname, '../../data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'skillbridge.db');
export const db = new Database(DB_PATH);

// Enable WAL mode for high concurrency & performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('job_seeker', 'employer', 'admin')),
      avatar_url TEXT,
      biometric_enabled INTEGER DEFAULT 0,
      biometric_credential_id TEXT,
      biometric_public_key TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profiles (
      user_id TEXT PRIMARY KEY,
      headline TEXT,
      bio TEXT,
      location TEXT,
      skills TEXT DEFAULT '[]', -- JSON array of strings
      experience_years REAL DEFAULT 0,
      education TEXT,
      preferred_language TEXT DEFAULT 'en',
      resume_text TEXT,
      github_url TEXT,
      linkedin_url TEXT,
      portfolio_website TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      industry TEXT NOT NULL,
      website TEXT,
      description TEXT,
      location TEXT,
      logo_url TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS skills_taxonomy (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      synonyms TEXT DEFAULT '[]', -- JSON array
      difficulty_level TEXT DEFAULT 'Intermediate'
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      employer_id TEXT NOT NULL,
      company_name TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      job_type TEXT NOT NULL,
      experience_level TEXT NOT NULL,
      salary_range TEXT NOT NULL,
      required_skills TEXT NOT NULL, -- JSON array of { skill: string, weight: number }
      preferred_skills TEXT DEFAULT '[]', -- JSON array of strings
      status TEXT DEFAULT 'open',
      created_at TEXT NOT NULL,
      FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      skill_name TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      pass_percentage INTEGER DEFAULT 70,
      questions TEXT NOT NULL -- JSON array of { id, question, options: string[], correct_index: number, explanation: string }
    );

    CREATE TABLE IF NOT EXISTS badges (
      id TEXT PRIMARY KEY,
      badge_code TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      skill_name TEXT NOT NULL,
      assessment_id TEXT NOT NULL,
      score_percentage REAL NOT NULL,
      level TEXT NOT NULL,
      issued_at TEXT NOT NULL,
      verification_hash TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS portfolios (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      problem_solved TEXT,
      skills_used TEXT NOT NULL, -- JSON array
      github_url TEXT,
      live_demo_url TEXT,
      screenshot_url TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      fit_score REAL NOT NULL,
      fit_score_breakdown TEXT NOT NULL, -- JSON object
      status TEXT DEFAULT 'Applied' CHECK(status IN ('Applied', 'Under Review', 'Shortlisted', 'Interviewing', 'Offered', 'Rejected')),
      cover_letter TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS roadmaps (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      target_role TEXT NOT NULL,
      target_job_id TEXT,
      overall_progress REAL DEFAULT 0,
      stages TEXT NOT NULL, -- JSON array of 4 stages
      ai_coaching_advice TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS mock_interviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      target_role TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      overall_score REAL NOT NULL,
      feedback TEXT NOT NULL, -- JSON object
      conversation_log TEXT NOT NULL, -- JSON array
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      category TEXT NOT NULL,
      ip_address TEXT,
      details TEXT, -- JSON object
      timestamp TEXT NOT NULL
    );
  `);

  console.log('✅ SQLite Database schema initialized successfully at', DB_PATH);
}
