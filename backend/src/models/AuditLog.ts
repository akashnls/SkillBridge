import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  id: string;
  user_id?: string | null;
  action: string;
  category: string;
  ip_address?: string;
  details?: Record<string, any>;
  timestamp: string;
}

const AuditLogSchema = new Schema<IAuditLog>({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, default: null },
  action: { type: String, required: true },
  category: { type: String, required: true },
  ip_address: { type: String, default: '127.0.0.1' },
  details: { type: Schema.Types.Mixed, default: {} },
  timestamp: { type: String, required: true },
});

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
