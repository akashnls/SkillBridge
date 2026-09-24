import nodemailer, { SentMessageInfo, Transporter } from 'nodemailer';
import { emailConfig, emailEnabled } from '../config/email.config.js';

// ── Send result ───────────────────────────────────────────────────────────────

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ── Lazy singleton transporter ────────────────────────────────────────────────

let _transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host:   emailConfig.host,
      port:   emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
      },
    });
  }
  return _transporter;
}

// ── Startup verify ────────────────────────────────────────────────────────────

/**
 * Verifies the SMTP connection once at server startup.
 * Logs success or the exact error. Never throws.
 */
export async function verifyEmailConnection(): Promise<void> {
  if (!emailEnabled) return;
  try {
    await getTransporter().verify();
    console.log(
      `✅ Email service ready — ${emailConfig.host}:${emailConfig.port} (user: ${emailConfig.user})`
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ Email connection failed: ${msg}`);
  }
}

// ── Retry with exponential backoff ───────────────────────────────────────────

const RETRY_DELAYS_MS = [500, 1000, 2000]; // 3 attempts total

async function sendWithRetry(
  mailOptions: Parameters<Transporter['sendMail']>[0],
  attempts = 3
): Promise<SentMessageInfo> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await getTransporter().sendMail(mailOptions);
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise(res => setTimeout(res, RETRY_DELAYS_MS[i] ?? 2000));
      }
    }
  }
  throw lastError;
}

// ── Shared HTML Layout ────────────────────────────────────────────────────────

function wrapInLayout(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }

    body {
      margin: 0;
      padding: 0;
      width: 100%;
      background-color: #f0f2f5;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1a1a2e;
    }

    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    }

    .email-header {
      background: linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #0f172a 100%);
      padding: 36px 40px;
      text-align: center;
    }

    .email-header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
    }

    .email-header .subtitle {
      margin: 6px 0 0 0;
      font-size: 13px;
      color: #94a3b8;
      letter-spacing: 0.5px;
    }

    .email-body {
      padding: 40px;
    }

    .email-body h2 {
      margin: 0 0 16px 0;
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
    }

    .email-body p {
      margin: 0 0 14px 0;
      font-size: 15px;
      line-height: 1.7;
      color: #374151;
    }

    .status-badge {
      display: inline-block;
      padding: 8px 20px;
      border-radius: 50px;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.3px;
      margin: 8px 0 20px 0;
    }

    .status-applied { background-color: #dbeafe; color: #1e40af; }
    .status-under-review { background-color: #fef3c7; color: #92400e; }
    .status-shortlisted { background-color: #d1fae5; color: #065f46; }
    .status-interviewing { background-color: #ede9fe; color: #5b21b6; }
    .status-offered { background-color: #d1fae5; color: #065f46; border: 2px solid #10b981; }
    .status-rejected { background-color: #fef2f2; color: #991b1b; }

    .info-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px 24px;
      margin: 20px 0;
    }

    .info-card table {
      width: 100%;
      border-collapse: collapse;
    }

    .info-card td {
      padding: 6px 0;
      font-size: 14px;
      vertical-align: top;
    }

    .info-card .label {
      color: #64748b;
      font-weight: 600;
      width: 140px;
    }

    .info-card .value {
      color: #1e293b;
      font-weight: 500;
    }

    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #059669, #10b981);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      margin: 20px 0;
      letter-spacing: 0.3px;
    }

    .email-footer {
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 28px 40px;
      text-align: center;
    }

    .email-footer p {
      margin: 0 0 6px 0;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
    }

    .email-footer .brand {
      font-weight: 700;
      color: #10b981;
    }

    .divider {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 24px 0;
    }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 32px 16px; background-color: #f0f2f5;">
    <tr>
      <td align="center">
        <div class="email-container">
          <!-- Header -->
          <div class="email-header">
            <h1>⚡ SkillBridge</h1>
            <p class="subtitle">AI-Powered Job &amp; Skill Matching Platform</p>
          </div>

          <!-- Body -->
          <div class="email-body">
            ${bodyContent}
          </div>

          <!-- Footer -->
          <div class="email-footer">
            <p>This is an automated message from <span class="brand">SkillBridge</span>.</p>
            <p>Please do not reply directly to this email.</p>
            <p style="margin-top: 12px; font-size: 11px;">© ${new Date().getFullYear()} SkillBridge. All rights reserved.</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Status-specific message content ─────────────────────────────────────────

function getStatusMessage(status: string): { heading: string; message: string; cssClass: string } {
  switch (status) {
    case 'Applied':
      return {
        heading: 'Application Received',
        message: 'Your application has been successfully submitted. Our team will review your profile and get back to you shortly.',
        cssClass: 'status-applied',
      };
    case 'Under Review':
      return {
        heading: 'Application Under Review',
        message: 'Great news! The hiring team is currently reviewing your application and qualifications. We appreciate your patience during this process.',
        cssClass: 'status-under-review',
      };
    case 'Shortlisted':
      return {
        heading: 'You\'ve Been Shortlisted! 🎯',
        message: 'Congratulations! Your profile stood out among the applicants and you have been shortlisted for the next stage. The recruiter will reach out to you with further details soon.',
        cssClass: 'status-shortlisted',
      };
    case 'Interviewing':
      return {
        heading: 'Interview Stage 🗓️',
        message: 'Exciting news! You have been selected to proceed to the interview stage. Please keep an eye on your inbox for scheduling details and interview preparation tips.',
        cssClass: 'status-interviewing',
      };
    case 'Offered':
      return {
        heading: 'Congratulations — You\'ve Received an Offer! 🎉',
        message: 'We are thrilled to inform you that you have been extended an offer for this position! Please review the details and respond at your earliest convenience.',
        cssClass: 'status-offered',
      };
    case 'Rejected':
      return {
        heading: 'Application Update',
        message: 'Thank you for your interest in this position and the time you invested in the application process. After careful consideration, the team has decided to move forward with other candidates. We encourage you to continue exploring opportunities on SkillBridge — your skills are valuable, and the right match is out there.',
        cssClass: 'status-rejected',
      };
    default:
      return {
        heading: 'Application Status Update',
        message: `Your application status has been updated to: ${status}.`,
        cssClass: 'status-applied',
      };
  }
}

function logDisabledEmailDev(to: string, subject: string, bodyText: string): void {
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n──────────────────────────────────────────────────────');
    console.log('📨 [EMAIL SIMULATION — SMTP DISABLED]');
    console.log(`   To:      ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log('   Body:');
    console.log(
      bodyText
        .split('\n')
        .map(line => `     ${line}`)
        .join('\n')
    );
    console.log('──────────────────────────────────────────────────────\n');
  }
}

// ── Public: Send Application Status Email ─────────────────────────────────────

export async function sendApplicationStatusEmail(
  recipientEmail: string,
  recipientName: string,
  jobTitle: string,
  companyName: string,
  newStatus: string
): Promise<EmailResult> {
  const { heading, message, cssClass } = getStatusMessage(newStatus);
  const subject = `${heading} — ${jobTitle} at ${companyName}`;

  if (!emailEnabled) {
    logDisabledEmailDev(
      recipientEmail,
      subject,
      `Dear ${recipientName},\n\n${message}\n\nPosition: ${jobTitle}\nCompany: ${companyName}\nCurrent Status: ${newStatus}`
    );
    return { success: false, error: 'Email disabled: SMTP credentials not configured. See .env.example.' };
  }

  const bodyContent = `
    <h2>${heading}</h2>
    <p>Dear <strong>${recipientName}</strong>,</p>
    <p>${message}</p>

    <div class="info-card">
      <table>
        <tr>
          <td class="label">Position</td>
          <td class="value">${jobTitle}</td>
        </tr>
        <tr>
          <td class="label">Company</td>
          <td class="value">${companyName}</td>
        </tr>
        <tr>
          <td class="label">Current Status</td>
          <td class="value"><span class="status-badge ${cssClass}">${newStatus}</span></td>
        </tr>
      </table>
    </div>

    ${newStatus === 'Offered'
      ? '<p>Please log in to your SkillBridge account to review the full offer details and next steps.</p>'
      : newStatus === 'Rejected'
        ? '<p>We recommend keeping your profile updated and exploring other opportunities that match your skills. Don\'t hesitate to take skill assessments to earn verified badges and strengthen your candidacy.</p>'
        : '<p>You can track the latest updates on your application by logging into your SkillBridge dashboard.</p>'
    }

    <hr class="divider" />
    <p style="font-size: 13px; color: #94a3b8;">If you have any questions, please reach out to the hiring team through the SkillBridge messaging system.</p>
  `;

  try {
    const info = await sendWithRetry({
      from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
      to: recipientEmail,
      subject: `${heading} — ${jobTitle} at ${companyName}`,
      html: wrapInLayout(heading, bodyContent),
    });
    console.log(`✉️  [sendApplicationStatusEmail] Sent to ${recipientEmail} [${newStatus}] — messageId: ${info.messageId}`);
    return { success: true, messageId: String(info.messageId) };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ [sendApplicationStatusEmail] Failed for ${recipientEmail} [${newStatus}]: ${msg}`);
    return { success: false, error: msg };
  }
}

// ── Public: Send Admin Action Email ──────────────────────────────────────────

export async function sendAdminActionEmail(
  recipientEmail: string,
  recipientName: string,
  action: 'user_suspended' | 'user_activated' | 'user_deleted' | 'user_role_changed' | 'company_verified' | 'company_rejected' | 'company_pending' | 'job_approved' | 'job_rejected',
  details?: Record<string, string>
): Promise<EmailResult> {
  let heading = '';
  let message = '';
  let extraContent = '';

  switch (action) {
    case 'user_suspended':
      heading = 'Account Suspended';
      message = 'Your SkillBridge account has been temporarily suspended by a platform administrator. During this period, you will be unable to access certain platform features.';
      extraContent = '<p>If you believe this was done in error, please contact our support team for assistance.</p>';
      break;
    case 'user_activated':
      heading = 'Account Activated ✅';
      message = 'Your SkillBridge account has been reactivated by a platform administrator. You now have full access to all platform features.';
      extraContent = '<p>Welcome back! You can log in and continue where you left off.</p>';
      break;
    case 'user_deleted':
      heading = 'Account Removal Notice';
      message = 'Your SkillBridge account has been removed by a platform administrator. All associated data has been flagged for deletion in accordance with our data retention policy.';
      extraContent = '<p>If you believe this was done in error or have any concerns, please reach out to our support team immediately.</p>';
      break;
    case 'user_role_changed':
      heading = 'Account Role Updated';
      message = `Your account role on SkillBridge has been updated by a platform administrator.`;
      if (details?.newRole) {
        extraContent = `
          <div class="info-card">
            <table>
              <tr><td class="label">New Role</td><td class="value">${details.newRole}</td></tr>
            </table>
          </div>
          <p>This change may affect the features and dashboards available to you. Please log in to review your updated access.</p>
        `;
      }
      break;
    case 'company_verified':
      heading = 'Company Verified ✅';
      message = 'Congratulations! Your company profile has been reviewed and verified by the SkillBridge administration team. Your job postings will now display a verified badge, increasing trust and visibility with job seekers.';
      if (details?.companyName) {
        extraContent = `
          <div class="info-card">
            <table>
              <tr><td class="label">Company</td><td class="value">${details.companyName}</td></tr>
              <tr><td class="label">Status</td><td class="value"><span class="status-badge status-shortlisted">Verified</span></td></tr>
            </table>
          </div>
        `;
      }
      break;
    case 'company_rejected':
      heading = 'Company Verification Update';
      message = 'After careful review, your company verification request has not been approved at this time. This may be due to incomplete information or documentation.';
      if (details?.companyName) {
        extraContent = `
          <div class="info-card">
            <table>
              <tr><td class="label">Company</td><td class="value">${details.companyName}</td></tr>
              <tr><td class="label">Status</td><td class="value"><span class="status-badge status-rejected">Not Verified</span></td></tr>
            </table>
          </div>
          <p>Please review and update your company profile with accurate details, then resubmit for verification.</p>
        `;
      }
      break;
    case 'company_pending':
      heading = 'Company Verification Pending';
      message = 'Your company verification status has been set back to pending review. Our team will re-evaluate your company profile shortly.';
      break;
    case 'job_approved':
      heading = 'Job Posting Approved ✅';
      message = 'Your job posting has been reviewed and approved by the SkillBridge moderation team. It is now live and visible to job seekers on the platform.';
      if (details?.jobTitle) {
        extraContent = `
          <div class="info-card">
            <table>
              <tr><td class="label">Position</td><td class="value">${details.jobTitle}</td></tr>
              <tr><td class="label">Status</td><td class="value"><span class="status-badge status-shortlisted">Approved &amp; Live</span></td></tr>
            </table>
          </div>
        `;
      }
      break;
    case 'job_rejected':
      heading = 'Job Posting Not Approved';
      message = 'After review, your job posting has not been approved by the SkillBridge moderation team. This may be due to policy violations or incomplete information.';
      if (details?.jobTitle) {
        extraContent = `
          <div class="info-card">
            <table>
              <tr><td class="label">Position</td><td class="value">${details.jobTitle}</td></tr>
              <tr><td class="label">Status</td><td class="value"><span class="status-badge status-rejected">Not Approved</span></td></tr>
            </table>
          </div>
          <p>Please review your job posting content, ensure it meets our community guidelines, and resubmit if appropriate.</p>
        `;
      }
      break;
  }

  const bodyContent = `
    <h2>${heading}</h2>
    <p>Dear <strong>${recipientName}</strong>,</p>
    <p>${message}</p>
    ${extraContent}
    <hr class="divider" />
    <p style="font-size: 13px; color: #94a3b8;">This action was performed by a SkillBridge platform administrator. If you have questions or concerns, please contact our support team.</p>
  `;

  const subject = `${heading} — SkillBridge`;

  if (!emailEnabled) {
    const detailsStr = details ? `\nDetails: ${JSON.stringify(details, null, 2)}` : '';
    logDisabledEmailDev(
      recipientEmail,
      subject,
      `Dear ${recipientName},\n\n${message}${detailsStr}`
    );
    return { success: false, error: 'Email disabled: SMTP credentials not configured. See .env.example.' };
  }

  try {
    const info = await sendWithRetry({
      from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
      to: recipientEmail,
      subject,
      html: wrapInLayout(heading, bodyContent),
    });
    console.log(`✉️  [sendAdminActionEmail] Sent to ${recipientEmail} [${action}] — messageId: ${info.messageId}`);
    return { success: true, messageId: String(info.messageId) };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ [sendAdminActionEmail] Failed for ${recipientEmail} [${action}]: ${msg}`);
    return { success: false, error: msg };
  }
}

// ── HTML Escaping Helper ──────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Public: Send Recruiter Application Summary Email ─────────────────────────

export interface ApplicationSummaryEmailParams {
  recruiterEmail: string;
  recruiterName: string;
  candidateName: string;
  candidateEmail?: string;
  jobTitle: string;
  companyName: string;
  fitScore: number;
  coverLetter?: string;
  resumeText?: string;
  skills: Array<{
    skill_name: string;
    proficiency?: string;
    category?: string;
    is_verified?: boolean;
  }>;
  badges: Array<{
    skill_name: string;
    level?: string;
    verification_hash?: string;
    badge_code?: string;
    score_percentage?: number;
  }>;
}

export async function sendApplicationSummaryEmail(
  params: ApplicationSummaryEmailParams
): Promise<EmailResult> {
  const heading = 'New Application Received 🚀';

  // Badges lookup set for cross-checking verified skills
  const badgeSkillNames = new Set((params.badges || []).map(b => (b.skill_name || '').toLowerCase().trim()));

  // Format skills with verified badge flag
  const skillsHtml = (params.skills && params.skills.length > 0)
    ? `<div style="margin-top: 8px;">
        ${params.skills.map(s => {
          const isVerified = s.is_verified || badgeSkillNames.has((s.skill_name || '').toLowerCase().trim());
          return `<span style="display: inline-block; background-color: ${isVerified ? '#d1fae5' : '#f1f5f9'}; border: 1px solid ${isVerified ? '#10b981' : '#cbd5e1'}; color: ${isVerified ? '#065f46' : '#334155'}; padding: 4px 10px; border-radius: 6px; font-size: 12px; margin: 3px 4px 3px 0;">
            <strong>${escapeHtml(s.skill_name)}</strong>${s.proficiency ? ` (${escapeHtml(s.proficiency)})` : ''}${isVerified ? ' <span style="font-weight: bold; color: #059669;">[Verified ✓]</span>' : ''}
          </span>`;
        }).join('')}
      </div>`
    : '<p style="color: #64748b; font-size: 13px; font-style: italic;">No specific skills listed.</p>';

  // Format active badges with verification references
  const badgesHtml = (params.badges && params.badges.length > 0)
    ? `<div style="margin-top: 8px;">
        ${params.badges.map(b => `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <strong style="color: #0f172a; font-size: 13px;">🏅 ${escapeHtml(b.skill_name)}</strong>
              <span style="font-size: 11px; background-color: #ede9fe; color: #5b21b6; padding: 2px 8px; border-radius: 10px; font-weight: 600;">
                ${escapeHtml(b.level || 'Verified')}${b.score_percentage !== undefined ? ` • ${b.score_percentage}%` : ''}
              </span>
            </div>
            <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
              <tr>
                <td style="color: #64748b; width: 130px; padding: 2px 0;">Badge Code:</td>
                <td style="font-family: monospace; color: #0f172a; font-weight: 600;">${escapeHtml(b.badge_code || 'N/A')}</td>
              </tr>
              <tr>
                <td style="color: #64748b; width: 130px; padding: 2px 0;">Verification Hash:</td>
                <td style="font-family: monospace; font-size: 11px; color: #475569; word-break: break-all;">${escapeHtml(b.verification_hash || 'N/A')}</td>
              </tr>
            </table>
          </div>
        `).join('')}
      </div>`
    : '<p style="color: #64748b; font-size: 13px; font-style: italic;">No verified digital badges earned yet.</p>';

  // Format primary resume text
  const resumeHtml = (params.resumeText && params.resumeText.trim())
    ? `<div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 14px; font-family: 'Courier New', Courier, monospace; font-size: 12px; max-height: 250px; overflow-y: auto; white-space: pre-wrap; word-break: break-word; color: #334155; line-height: 1.5; margin-top: 8px;">${escapeHtml(params.resumeText)}</div>`
    : '<p style="color: #64748b; font-size: 13px; font-style: italic;">No primary resume text provided.</p>';

  // Format cover letter
  const coverLetterHtml = (params.coverLetter && params.coverLetter.trim())
    ? `<div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 12px 16px; margin: 8px 0 16px 0; font-style: italic; color: #334155; line-height: 1.6; border-radius: 0 8px 8px 0;">${escapeHtml(params.coverLetter)}</div>`
    : '<p style="color: #64748b; font-size: 13px; font-style: italic; margin-bottom: 16px;">No cover letter was submitted with this application.</p>';

  const scoreBadgeClass = params.fitScore >= 75 ? 'status-shortlisted' : params.fitScore >= 50 ? 'status-under-review' : 'status-applied';

  const bodyContent = `
    <h2>${heading}</h2>
    <p>Dear <strong>${escapeHtml(params.recruiterName)}</strong>,</p>
    <p>A candidate has just submitted an application for your open role: <strong>${escapeHtml(params.jobTitle)}</strong> at <strong>${escapeHtml(params.companyName)}</strong>.</p>

    <div class="info-card">
      <table>
        <tr>
          <td class="label">Candidate Name</td>
          <td class="value"><strong>${escapeHtml(params.candidateName)}</strong>${params.candidateEmail ? ` &lt;${escapeHtml(params.candidateEmail)}&gt;` : ''}</td>
        </tr>
        <tr>
          <td class="label">Position</td>
          <td class="value"><strong>${escapeHtml(params.jobTitle)}</strong></td>
        </tr>
        <tr>
          <td class="label">Job-Fit Score</td>
          <td class="value">
            <span class="status-badge ${scoreBadgeClass}" style="margin: 0;">
              ${Math.round(params.fitScore)}% Match Fit
            </span>
          </td>
        </tr>
      </table>
    </div>

    <h3 style="font-size: 15px; color: #0f172a; margin: 20px 0 6px 0;">Cover Letter</h3>
    ${coverLetterHtml}

    <h3 style="font-size: 15px; color: #0f172a; margin: 20px 0 6px 0;">Candidate Skills</h3>
    ${skillsHtml}

    <h3 style="font-size: 15px; color: #0f172a; margin: 20px 0 6px 0;">Verified Digital Badges</h3>
    ${badgesHtml}

    <h3 style="font-size: 15px; color: #0f172a; margin: 20px 0 6px 0;">Primary Resume Text</h3>
    ${resumeHtml}

    <hr class="divider" />
    <p style="font-size: 13px; color: #64748b; text-align: center;">
      Log in to your SkillBridge Recruiter Workspace to view the candidate profile, move them along the ATS pipeline, or schedule an interview.
    </p>
  `;

  const subject = `New Application: ${params.candidateName} for ${params.jobTitle} (${Math.round(params.fitScore)}% Fit)`;

  if (!emailEnabled) {
    const skillsList = (params.skills || []).map(s => s.skill_name).join(', ') || 'None';
    const badgesList = (params.badges || []).map(b => b.skill_name).join(', ') || 'None';
    logDisabledEmailDev(
      params.recruiterEmail,
      subject,
      `Dear ${params.recruiterName},\n\nA candidate has submitted an application for ${params.jobTitle} at ${params.companyName}.\n\nCandidate: ${params.candidateName} (${params.candidateEmail || 'N/A'})\nFit Score: ${Math.round(params.fitScore)}%\nSkills: ${skillsList}\nBadges: ${badgesList}\nCover Letter: ${params.coverLetter || 'None'}`
    );
    return { success: false, error: 'Email disabled: SMTP credentials not configured. See .env.example.' };
  }

  try {
    const info = await sendWithRetry({
      from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
      to: params.recruiterEmail,
      subject,
      html: wrapInLayout(`New Application for ${params.jobTitle}`, bodyContent),
    });
    console.log(`✉️  [sendApplicationSummaryEmail] Sent to ${params.recruiterEmail} for job "${params.jobTitle}" — messageId: ${info.messageId}`);
    return { success: true, messageId: String(info.messageId) };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ [sendApplicationSummaryEmail] Failed for ${params.recruiterEmail} [${params.jobTitle}]: ${msg}`);
    return { success: false, error: msg };
  }
}
