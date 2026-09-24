import mongoose, { Schema, Document } from 'mongoose';

export interface IPasswordReset extends Document {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

const PasswordResetSchema = new Schema<IPasswordReset>({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  token_hash: { type: String, required: true },
  expires_at: { type: String, required: true },
  used: { type: Boolean, default: false },
  created_at: { type: String, required: true },
});

export const PasswordReset = mongoose.model<IPasswordReset>('PasswordReset', PasswordResetSchema);
