import mongoose, { Schema, Document } from 'mongoose';

export interface IRoadmap extends Document {
  id: string;
  user_id: string;
  target_role: string;
  target_job_id?: string;
  overall_progress: number;
  stages: any[];
  ai_coaching_advice?: string;
  created_at: string;
}

const RoadmapSchema = new Schema<IRoadmap>({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  target_role: { type: String, required: true },
  target_job_id: { type: String, default: null },
  overall_progress: { type: Number, default: 0 },
  stages: { type: Schema.Types.Mixed, default: [] },
  ai_coaching_advice: { type: String, default: null },
  created_at: { type: String, required: true },
});

export const Roadmap = mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);
