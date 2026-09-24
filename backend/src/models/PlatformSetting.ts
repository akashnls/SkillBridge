import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformSetting extends Document {
  key: string;
  value: string;
}

const PlatformSettingSchema = new Schema<IPlatformSetting>({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
});

export const PlatformSetting = mongoose.model<IPlatformSetting>('PlatformSetting', PlatformSettingSchema);
