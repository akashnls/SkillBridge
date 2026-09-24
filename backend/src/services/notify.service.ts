import { v4 as uuidv4 } from 'uuid';
import { Notification } from '../models/Notification.js';

export function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  link?: string
): void {
  Notification.create({
    id: uuidv4(),
    user_id: userId,
    type,
    title,
    body,
    link: link || '',
    is_read: false,
    created_at: new Date().toISOString()
  }).catch((error) => {
    console.error('Failed to create notification:', error);
  });
}
