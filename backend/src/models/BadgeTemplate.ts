import mongoose, { Schema, Document } from 'mongoose';

export interface IBadgeTemplate extends Document {
  id: string;
  name: string;
  skill_name: string;
  level: string;
  description?: string;
  criteria?: string;
  icon?: string;
  is_active: boolean;
}

const BadgeTemplateSchema = new Schema<IBadgeTemplate>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  skill_name: { type: String, required: true },
  level: { type: String, required: true },
  description: { type: String, default: '' },
  criteria: { type: String, default: '' },
  icon: { type: String, default: '🏅' },
  is_active: { type: Boolean, default: true },
});

export const BadgeTemplate = mongoose.model<IBadgeTemplate>('BadgeTemplate', BadgeTemplateSchema);
