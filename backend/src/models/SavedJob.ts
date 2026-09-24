import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedJob extends Document {
  id: string;
  user_id: string;
  job_id: string;
  created_at: string;
}

const SavedJobSchema = new Schema<ISavedJob>({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  job_id: { type: String, required: true },
  created_at: { type: String, required: true },
});

// Compound unique index: each user can save a job only once
SavedJobSchema.index({ user_id: 1, job_id: 1 }, { unique: true });

export const SavedJob = mongoose.model<ISavedJob>('SavedJob', SavedJobSchema);
