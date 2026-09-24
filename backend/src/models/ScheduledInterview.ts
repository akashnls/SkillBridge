import mongoose, { Schema, Document } from 'mongoose';

export interface IScheduledInterview extends Document {
  id: string;
  application_id?: string;
  job_id: string;
  candidate_id: string;
  recruiter_id: string;
  interview_date: string;
  interview_time: string;
  interview_type: string;
  meeting_link?: string;
  notes?: string;
  status: string;
  location?: string;
  created_at: string;
}

const ScheduledInterviewSchema = new Schema<IScheduledInterview>({
  id: { type: String, required: true, unique: true },
  application_id: { type: String, default: null },
  job_id: { type: String, required: true },
  candidate_id: { type: String, required: true },
  recruiter_id: { type: String, required: true },
  interview_date: { type: String, required: true },
  interview_time: { type: String, required: true },
  interview_type: { type: String, default: 'Video' },
  meeting_link: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { type: String, default: 'scheduled' },
  location: { type: String, default: null },
  created_at: { type: String, required: true },
});

export const ScheduledInterview = mongoose.model<IScheduledInterview>('ScheduledInterview', ScheduledInterviewSchema);
