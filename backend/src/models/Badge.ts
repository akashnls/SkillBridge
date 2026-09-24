import mongoose, { Schema, Document } from 'mongoose';

export interface IBadge extends Document {
  id: string;
  badge_code: string;
  user_id: string;
  skill_name: string;
  assessment_id: string;
  score_percentage: number;
  level: string;
  issued_at: string;
  verification_hash: string;
  status: string;
}

const BadgeSchema = new Schema<IBadge>({
  id: { type: String, required: true, unique: true },
  badge_code: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  skill_name: { type: String, required: true },
  assessment_id: { type: String, required: true },
  score_percentage: { type: Number, required: true },
  level: { type: String, required: true },
  issued_at: { type: String, required: true },
  verification_hash: { type: String, required: true },
  status: { type: String, default: 'active' },
});

export const Badge = mongoose.model<IBadge>('Badge', BadgeSchema);
