import mongoose, { Schema, Document } from 'mongoose';

export interface IApplicationEvent extends Document {
  id: string;
  application_id: string;
  status: string;
  actor_id?: string;
  note?: string;
  created_at: string;
}

const ApplicationEventSchema = new Schema<IApplicationEvent>({
  id: { type: String, required: true, unique: true },
  application_id: { type: String, required: true },
  status: { type: String, required: true },
  actor_id: { type: String, default: null },
  note: { type: String, default: null },
  created_at: { type: String, required: true },
});

export const ApplicationEvent = mongoose.model<IApplicationEvent>('ApplicationEvent', ApplicationEventSchema);
