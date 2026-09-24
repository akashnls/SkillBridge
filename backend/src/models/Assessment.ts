import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessment extends Document {
  id: string;
  skill_name: string;
  title: string;
  category: string;
  duration_minutes: number;
  pass_percentage: number;
  questions: any[];
}

const AssessmentSchema = new Schema<IAssessment>({
  id: { type: String, required: true, unique: true },
  skill_name: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  duration_minutes: { type: Number, required: true },
  pass_percentage: { type: Number, default: 70 },
  questions: { type: Schema.Types.Mixed, required: true, default: [] },
});

export const Assessment = mongoose.model<IAssessment>('Assessment', AssessmentSchema);
