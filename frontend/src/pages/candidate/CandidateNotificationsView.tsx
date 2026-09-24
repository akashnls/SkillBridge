import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext.js';
import { notificationsAPI, PlatformNotification } from '../../services/api.js';
import { PageHeader } from '../../components/PageHeader.js';
import {
  Bell,
  CheckCircle2,
  Calendar,
  Award,
  Send,
  Sparkles,
  MessageSquare,
  Clock,
  ArrowRight,
  CheckCheck
} from 'lucide-react';

export const CandidateNotificationsView: React.FC = () => {
  const { navigate } = useRouter();
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsAPI.getAll();
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, link?: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      if (link) {
        navigate(link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'interview_scheduled':
      case 'interview_rescheduled':
        return <Calendar className="w-5 h-5 text-[#4a5e2f]" />;
      case 'shortlisted':
      case 'badge_earned':
      case 'assessment_completed':
        return <Award className="w-5 h-5 text-[#b45309]" />;
      case 'application_submitted':
      case 'application_status':
        return <Send className="w-5 h-5 text-[#4a5e2f]" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-[#4a5e2f]" />;
      default:
        return <Bell className="w-5 h-5 text-[#4a5e2f]" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#4a5e2f]/20 border-t-[#4a5e2f] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <PageHeader
        badge="LIVE ALERTS"
        badgeSubtext="Real-Time Updates"
        icon={<Bell className="w-6 h-6" />}
        title="Notifications"
        subtitle="Real-time updates regarding application progress, interview schedules, and skill badges."
        actions={
          unreadCount > 0 ? (
            <button
              onClick={handleMarkAllRead}
              className="sb-btn-secondary px-4 py-2 text-xs font-semibold"
            >
              <CheckCheck className="w-4 h-4 text-[#B6FF3B]" />
              <span>Mark All as Read ({unreadCount})</span>
            </button>
          ) : undefined
        }
      />

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="p-12 bg-[#f5f0e8]/60 rounded-2xl border border-[#4a4636] text-center space-y-3">
          <Bell className="w-12 h-12 text-[#9a8e7a] mx-auto" />
          <h3 className="text-base font-bold text-[#f0ebe0]">No Notifications Yet</h3>
          <p className="text-xs text-[#9a8e7a] max-w-sm mx-auto">
            You will be notified as soon as recruiters review your application, schedule interviews, or when badges are awarded.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleMarkAsRead(notif.id, notif.link)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                notif.is_read
                  ? 'bg-[#f5f0e8]/50 border-[#4a4636]/80 hover:bg-[#f5f0e8]/50'
                  : 'bg-[#f5f0e8]/90 border-[#4a5e2f]/40 shadow-sm hover:border-[#4a5e2f]/60'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-[#f5f0e8] border border-[#4a4636] shrink-0 mt-0.5">
                  {getNotifIcon(notif.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-bold ${notif.is_read ? 'text-[#9a8e7a]' : 'text-[#f0ebe0]'}`}>
                      {notif.title}
                    </h3>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-[#4a5e2f] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#b5aa96] mt-1 leading-relaxed">{notif.body}</p>
                  <span className="text-[11px] text-[#9a8e7a] mt-2 block">
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {notif.link && (
                <div className="text-[#4a5e2f] p-1 shrink-0 self-center">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


