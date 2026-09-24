import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  id: string;
  employer_id: string;
  company_name: string;
  title: string;
  description: string;
  location: string;
  job_type: string;
  experience_level: string;
  salary_range: string;
  required_skills: Array<{ skill: string; weight: number }>;
  preferred_skills: string[];
  status: string;
  created_at: string;
  work_mode: string;
  education_requirement?: string;
  openings: number;
  application_deadline?: string;
  responsibilities?: string;
  benefits_text?: string;
  moderation_status: string;
  rejection_reason?: string;
  views_count: number;
  company_id?: string;
}

const JobSchema = new Schema<IJob>({
  id: { type: String, required: true, unique: true },
  employer_id: { type: String, required: true },
  company_name: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  job_type: { type: String, required: true },
  experience_level: { type: String, required: true },
  salary_range: { type: String, required: true },
  required_skills: { type: Schema.Types.Mixed, default: [] },
  preferred_skills: { type: [String], default: [] },
  status: { type: String, default: 'open' },
  created_at: { type: String, required: true },
  work_mode: { type: String, default: 'Hybrid' },
  education_requirement: { type: String, default: '' },
  openings: { type: Number, default: 1 },
  application_deadline: { type: String, default: '' },
  responsibilities: { type: String, default: '' },
  benefits_text: { type: String, default: '' },
  moderation_status: { type: String, default: 'approved' },
  rejection_reason: { type: String, default: null },
  views_count: { type: Number, default: 0 },
  company_id: { type: String, default: null },
});

export const Job = mongoose.model<IJob>('Job', JobSchema);
