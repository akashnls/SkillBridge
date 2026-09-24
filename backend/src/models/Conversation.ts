import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  id: string;
  participant_a: string;
  participant_b: string;
  last_message_at?: string;
  created_at: string;
}

const ConversationSchema = new Schema<IConversation>({
  id: { type: String, required: true, unique: true },
  participant_a: { type: String, required: true },
  participant_b: { type: String, required: true },
  last_message_at: { type: String, default: null },
  created_at: { type: String, required: true },
});

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
