/**
 * Email test script — verifies SMTP connection and sends a test email.
 *
 * Usage:
 *   cd backend
 *   npm run test:email you@example.com
 *
 * The script exits with code 0 on success and 1 on failure.
 */

import dotenv from 'dotenv';
dotenv.config();

import { verifyEmailConnection, sendApplicationStatusEmail } from '../services/email.service.js';
import { emailEnabled, emailConfig } from '../config/email.config.js';

async function main(): Promise<void> {
  const target = process.argv[2];

  if (!target || !target.includes('@')) {
    console.error('Usage: npm run test:email <email-address>');
    console.error('Example: npm run test:email you@example.com');
    process.exit(1);
  }

  console.log('\n══════════════════════════════════════════════');
  console.log('  SkillBridge — Email Service Test');
  console.log('══════════════════════════════════════════════');
  console.log(`  Host   : ${emailConfig.host}:${emailConfig.port}`);
  console.log(`  Secure : ${emailConfig.secure}`);
  console.log(`  User   : ${emailConfig.user ?? '(not set)'}`);
  console.log(`  From   : "${emailConfig.fromName}" <${emailConfig.fromEmail}>`);
  console.log(`  To     : ${target}`);
  console.log(`  Enabled: ${emailEnabled}`);
  console.log('══════════════════════════════════════════════\n');

  if (!emailEnabled) {
    console.error('❌ Email is disabled — set SMTP_USER and SMTP_PASS in backend/.env first.');
    console.error('   See backend/.env.example for setup instructions.');
    process.exit(1);
  }

  console.log('Step 1/2 — Verifying SMTP connection …');
  await verifyEmailConnection();

  console.log('\nStep 2/2 — Sending test email …');
  const result = await sendApplicationStatusEmail(
    target,
    'Test User',
    'Senior TypeScript Engineer',
    'SkillBridge Demo Inc.',
    'Shortlisted'
  );

  console.log('\n══════════════════════════════════════════════');
  if (result.success) {
    console.log('✅ Test email sent successfully!');
    console.log(`   Message-ID : ${result.messageId}`);
    console.log('   Check your inbox (or Mailtrap sandbox).');
    process.exit(0);
  } else {
    console.error('❌ Test email FAILED');
    console.error(`   Error: ${result.error}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
