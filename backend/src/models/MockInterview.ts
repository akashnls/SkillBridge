import mongoose, { Schema, Document } from 'mongoose';

export interface IMockInterview extends Document {
  id: string;
  user_id: string;
  target_role: string;
  difficulty: string;
  overall_score: number;
  feedback: Record<string, any>;
  conversation_log: any[];
  created_at: string;
  role?: string;
  job_id?: string;
  interview_type: string;
  status: string;
  completed_at?: string;
  recommendations: any[];
  duration_minutes: number;
  category_scores: Record<string, any>;
  questions: any[];
  answers: any[];
  strengths: string[];
  areas_to_improve: string[];
}

const MockInterviewSchema = new Schema<IMockInterview>({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  target_role: { type: String, required: true },
  difficulty: { type: String, required: true },
  overall_score: { type: Number, required: true },
  feedback: { type: Schema.Types.Mixed, default: {} },
  conversation_log: { type: Schema.Types.Mixed, default: [] },
  created_at: { type: String, required: true },
  role: { type: String, default: null },
  job_id: { type: String, default: null },
  interview_type: { type: String, default: 'Technical' },
  status: { type: String, default: 'completed' },
  completed_at: { type: String, default: null },
  recommendations: { type: Schema.Types.Mixed, default: [] },
  duration_minutes: { type: Number, default: 20 },
  category_scores: { type: Schema.Types.Mixed, default: {} },
  questions: { type: Schema.Types.Mixed, default: [] },
  answers: { type: Schema.Types.Mixed, default: [] },
  strengths: { type: [String], default: [] },
  areas_to_improve: { type: [String], default: [] },
});

export const MockInterview = mongoose.model<IMockInterview>('MockInterview', MockInterviewSchema);
