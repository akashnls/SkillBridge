import mongoose, { Schema, Document } from 'mongoose';

// ---- Embedded Profile Subdocument ----
const ProfileSchema = new Schema({
  headline: { type: String, default: 'Aspiring Professional' },
  bio: { type: String, default: '' },
  location: { type: String, default: 'India' },
  skills: { type: [String], default: [] },
  experience_years: { type: Number, default: 0 },
  education: { type: String, default: null },
  preferred_language: { type: String, default: 'en' },
  resume_text: { type: String, default: null },
  github_url: { type: String, default: null },
  linkedin_url: { type: String, default: null },
  portfolio_website: { type: String, default: null },
  phone: { type: String, default: null },
  career_objective: { type: String, default: null },
  preferred_job_role: { type: String, default: null },
  preferred_location: { type: String, default: null },
  preferred_locations: { type: [String], default: [] },
  work_preference: { type: String, default: null },
  expected_salary: { type: String, default: null },
  education_entries: { type: Schema.Types.Mixed, default: [] },
  experience_entries: { type: Schema.Types.Mixed, default: [] },
  certifications: { type: Schema.Types.Mixed, default: [] },
  achievements: { type: Schema.Types.Mixed, default: [] },
  languages: { type: Schema.Types.Mixed, default: [] },
  privacy_settings: { type: Schema.Types.Mixed, default: {} },
  job_preferences: { type: Schema.Types.Mixed, default: {} },
  notification_prefs: { type: Schema.Types.Mixed, default: {} },
  profile_views: { type: Number, default: 0 },
  soft_skills: { type: [String], default: [] },
  internships: { type: Schema.Types.Mixed, default: [] },
}, { _id: false });

// ---- Embedded Candidate Settings Subdocument ----
const CandidateSettingsSchema = new Schema({
  job_preferences: { type: Schema.Types.Mixed, default: {} },
  notification_preferences: { type: Schema.Types.Mixed, default: {} },
  privacy_preferences: { type: Schema.Types.Mixed, default: {} },
  updated_at: { type: String, default: () => new Date().toISOString() },
}, { _id: false });

// ---- User Schema ----
export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'job_seeker' | 'employer' | 'admin';
  avatar_url?: string;
  biometric_enabled: boolean;
  biometric_credential_id?: string;
  biometric_public_key?: string;
  biometric_counter?: number;
  biometric_transports?: string[];
  status: string;
  phone?: string;
  account_deleted: boolean;
  created_at: string;
  profile?: any;
  candidate_settings?: any;
}

const UserSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, required: true, enum: ['job_seeker', 'employer', 'admin'] },
  avatar_url: { type: String, default: null },
  biometric_enabled: { type: Boolean, default: false },
  biometric_credential_id: { type: String, default: null },
  biometric_public_key: { type: String, default: null },
  biometric_counter: { type: Number, default: 0 },
  biometric_transports: { type: [String], default: [] },
  status: { type: String, default: 'active' },
  phone: { type: String, default: null },
  account_deleted: { type: Boolean, default: false },
  created_at: { type: String, required: true },
  profile: { type: ProfileSchema, default: null },
  candidate_settings: { type: CandidateSettingsSchema, default: null },
});

export const User = mongoose.model<IUser>('User', UserSchema);
