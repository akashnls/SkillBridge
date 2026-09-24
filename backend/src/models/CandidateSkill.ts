import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidateSkill extends Document {
  id: string;
  user_id: string;
  skill_name: string;
  category?: string;
  proficiency: string;
  is_verified: boolean;
  source: string;
}

const CandidateSkillSchema = new Schema<ICandidateSkill>({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  skill_name: { type: String, required: true },
  category: { type: String, default: 'General' },
  proficiency: { type: String, default: 'Beginner' },
  is_verified: { type: Boolean, default: false },
  source: { type: String, default: 'self' },
});

export const CandidateSkill = mongoose.model<ICandidateSkill>('CandidateSkill', CandidateSkillSchema);
