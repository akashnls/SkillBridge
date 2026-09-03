import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';

export function logAuditEvent(
  userId: string | null,
  action: string,
  category: 'AUTH' | 'SECURITY' | 'BADGE_ISSUED' | 'MATCH_COMPUTED' | 'PROFILE_ACCESS' | 'JOB_POSTED',
  ipAddress: string | string[] | undefined,
  details: Record<string, any>
) {
  try {
    const insertAudit = db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, category, ip_address, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const ip = Array.isArray(ipAddress) ? ipAddress[0] : (ipAddress || '127.0.0.1');

    insertAudit.run(
      uuidv4(),
      userId,
      action,
      category,
      ip,
      JSON.stringify(details),
      new Date().toISOString()
    );
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
