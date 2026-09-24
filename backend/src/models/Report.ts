import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  id: string;
  reporter_id?: string;
  target_type: string;
  target_id: string;
  reason: string;
  details?: string;
  status: string;
  admin_note?: string;
  created_at: string;
  resolved_at?: string;
}

const ReportSchema = new Schema<IReport>({
  id: { type: String, required: true, unique: true },
  reporter_id: { type: String, default: null },
  target_type: { type: String, required: true },
  target_id: { type: String, required: true },
  reason: { type: String, required: true },
  details: { type: String, default: '' },
  status: { type: String, default: 'open' },
  admin_note: { type: String, default: null },
  created_at: { type: String, required: true },
  resolved_at: { type: String, default: null },
});

export const Report = mongoose.model<IReport>('Report', ReportSchema);
