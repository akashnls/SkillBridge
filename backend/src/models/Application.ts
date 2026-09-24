import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  id: string;
  job_id: string;
  user_id: string;
  fit_score: number;
  fit_score_breakdown: Record<string, any>;
  status: string;
  cover_letter?: string;
  additional_info?: string;
  resume_id?: string;
  created_at: string;
  updated_at: string;
}

const ApplicationSchema = new Schema<IApplication>({
  id: { type: String, required: true, unique: true },
  job_id: { type: String, required: true },
  user_id: { type: String, required: true },
  fit_score: { type: Number, required: true },
  fit_score_breakdown: { type: Schema.Types.Mixed, default: {} },
  status: {
    type: String,
    default: 'Applied',
    enum: ['Applied', 'Under Review', 'Shortlisted', 'Interviewing', 'Offered', 'Rejected'],
  },
  cover_letter: { type: String, default: '' },
  additional_info: { type: String, default: '' },
  resume_id: { type: String, default: null },
  created_at: { type: String, required: true },
  updated_at: { type: String, required: true },
});

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
