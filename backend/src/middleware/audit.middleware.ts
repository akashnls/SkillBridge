import { v4 as uuidv4 } from 'uuid';
import { AuditLog } from '../models/AuditLog.js';

export function logAuditEvent(
  userId: string | null,
  action: string,
  category: string,
  ipAddress: string | string[] | undefined,
  details: Record<string, any>
) {
  const ip = Array.isArray(ipAddress) ? ipAddress[0] : (ipAddress || '127.0.0.1');
  AuditLog.create({
    id: uuidv4(),
    user_id: userId,
    action,
    category,
    ip_address: ip,
    details,
    timestamp: new Date().toISOString()
  }).catch((error) => {
    console.error('Failed to write audit log:', error);
  });
}
