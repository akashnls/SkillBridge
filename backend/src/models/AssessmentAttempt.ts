import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessmentAttempt extends Document {
  id: string;
  assessment_id: string;
  user_id: string;
  started_at: string;
  submitted_at?: string;
  score_percentage?: number;
  correct_count?: number;
  incorrect_count?: number;
  time_taken_seconds?: number;
  passed?: boolean;
  skill_level?: string;
}

const AssessmentAttemptSchema = new Schema<IAssessmentAttempt>({
  id: { type: String, required: true, unique: true },
  assessment_id: { type: String, required: true },
  user_id: { type: String, required: true },
  started_at: { type: String, required: true },
  submitted_at: { type: String, default: null },
  score_percentage: { type: Number, default: null },
  correct_count: { type: Number, default: null },
  incorrect_count: { type: Number, default: null },
  time_taken_seconds: { type: Number, default: null },
  passed: { type: Boolean, default: null },
  skill_level: { type: String, default: null },
});

export const AssessmentAttempt = mongoose.model<IAssessmentAttempt>('AssessmentAttempt', AssessmentAttemptSchema);
