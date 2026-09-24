import mongoose, { Schema, Document } from 'mongoose';

export interface IResume extends Document {
  id: string;
  user_id: string;
  file_name: string;
  content_text?: string;
  is_primary: boolean;
  score?: number;
  suggestions?: any[];
  created_at: string;
}

const ResumeSchema = new Schema<IResume>({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  file_name: { type: String, required: true },
  content_text: { type: String, default: '' },
  is_primary: { type: Boolean, default: false },
  score: { type: Number, default: null },
  suggestions: { type: Schema.Types.Mixed, default: [] },
  created_at: { type: String, required: true },
});

export const Resume = mongoose.model<IResume>('Resume', ResumeSchema);
