import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Briefcase, 
  ShieldCheck, 
  Calendar, 
  MessageSquare, 
  AlertTriangle,
  Clock
} from 'lucide-react';
import { notificationsAPI } from '../../services/api';
import { PlatformNotification } from '../../types';

export const RecruiterNotificationsView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsAPI.getAll();
      setNotifications(res.data?.notifications || []);
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string | number) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => String(n.id) === String(id) ? { ...n, is_read: 1, read: true } : n));
    } catch (err: any) {
      console.error('Failed to mark read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1, read: true })));
    } catch (err: any) {
      console.error('Failed to mark all read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application':
      case 'job':
        return <Briefcase className="w-5 h-5 text-[#4a5e2f]" />;
      case 'verification':
        return <ShieldCheck className="w-5 h-5 text-[#3d6b35]" />;
      case 'interview':
        return <Calendar className="w-5 h-5 text-[#b45309]" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-[#6b7f47]" />;
      default:
        return <Bell className="w-5 h-5 text-[#9a8e7a]" />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2c2a1e]">Notifications</h1>
          <p className="text-[#9a8e7a] text-sm mt-1">
            Stay updated on new candidate applications, admin moderation reviews, and scheduled interviews.
          </p>
        </div>

        {notifications.some(n => !n.is_read && !n.read) && (
          <button
            onClick={markAllRead}
            className="px-4 py-2 rounded-xl border border-[#d5cec3] hover:bg-[#e4ddd2] text-[#6b6151] text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-[#9a8e7a]" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#4a5e2f] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#c8d5a8]/30 text-[#4a5e2f] flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-[#2c2a1e] text-sm">No notifications yet</h3>
          <p className="text-xs text-[#9a8e7a] max-w-sm mx-auto">
            Candidate applications, interview updates, and system alerts will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm divide-y divide-[#d5cec3] overflow-hidden">
          {notifications.map(n => {
            const isRead = !!n.read || Number(n.is_read) === 1;
            return (
              <div
                key={n.id}
                onClick={() => !isRead && markAsRead(n.id)}
                className={`p-5 flex items-start justify-between gap-4 transition cursor-pointer ${
                  !isRead ? 'bg-[#c8d5a8]/30/40' : 'hover:bg-[#e4ddd2]/60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#ede8df] border border-[#d5cec3] flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="space-y-1">
                    <h4 className={`text-sm ${!isRead ? 'font-bold text-[#2c2a1e]' : 'font-medium text-[#6b6151]'}`}>
                      {n.title}
                    </h4>
                    <p className="text-xs text-[#6b6151] leading-relaxed">
                      {n.body || n.message}
                    </p>
                    <span className="text-[11px] text-[#9a8e7a] flex items-center gap-1 pt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(n.created_at || Date.now()).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4a5e2f] shrink-0 mt-2"></span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default RecruiterNotificationsView;


