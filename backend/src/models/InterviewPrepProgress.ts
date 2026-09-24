import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewPrepProgress extends Document {
  id: string;
  user_id: string;
  question_id: string;
  category: string;
  is_completed: boolean;
  notes?: string;
  updated_at: string;
}

const InterviewPrepProgressSchema = new Schema<IInterviewPrepProgress>({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  question_id: { type: String, required: true },
  category: { type: String, required: true },
  is_completed: { type: Boolean, default: false },
  notes: { type: String, default: null },
  updated_at: { type: String, required: true },
});

// Compound unique index: one progress record per user per question
InterviewPrepProgressSchema.index({ user_id: 1, question_id: 1 }, { unique: true });

export const InterviewPrepProgress = mongoose.model<IInterviewPrepProgress>('InterviewPrepProgress', InterviewPrepProgressSchema);
