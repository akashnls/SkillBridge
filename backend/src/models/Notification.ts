import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

const NotificationSchema = new Schema<INotification>({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  link: { type: String, default: '' },
  is_read: { type: Boolean, default: false },
  created_at: { type: String, required: true },
});

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
