import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

const MessageSchema = new Schema<IMessage>({
  id: { type: String, required: true, unique: true },
  conversation_id: { type: String, required: true },
  sender_id: { type: String, required: true },
  body: { type: String, required: true },
  created_at: { type: String, required: true },
});

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
