import dotenv from 'dotenv';

dotenv.config();

// ── SMTP configuration ────────────────────────────────────────────────────────

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string | undefined;
  pass: string | undefined;
  fromEmail: string;
  fromName: string;
}

const port = Number(process.env.SMTP_PORT) || 587;

export const emailConfig: EmailConfig = {
  host:      process.env.SMTP_HOST      || 'smtp.gmail.com',
  port,
  secure:    process.env.SMTP_SECURE === 'true' || port === 465,
  user:      process.env.SMTP_USER      || undefined,
  pass:      process.env.SMTP_PASS      || undefined,
  fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@skillbridge.com',
  fromName:  process.env.SMTP_FROM_NAME  || 'SkillBridge',
};

// True only when both credentials are present and non-placeholder.
const isPlaceholder = (v: string | undefined): boolean =>
  !v ||
  !v.trim() ||
  v.includes('your-') ||
  v.includes('your_') ||
  v.includes('<') ||
  v.includes('example.com') ||
  v === 'change-me' ||
  v === 'your-app-password-here';

export const emailEnabled: boolean =
  !isPlaceholder(emailConfig.user) && !isPlaceholder(emailConfig.pass);

let _warned = false;
export function logEmailStartupWarning(): void {
  if (!emailEnabled && !_warned) {
    _warned = true;
    console.warn('⚠️  Email disabled: SMTP credentials not configured. See .env.example.');
  }
}

if (!emailEnabled) {
  logEmailStartupWarning();
}
