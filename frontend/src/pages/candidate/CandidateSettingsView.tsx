import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useRouter } from '../../context/RouterContext.js';
import { candidateAPI, CandidateSettingsData } from '../../services/api.js';
import { PageHeader } from '../../components/PageHeader.js';
import {
  Settings,
  User,
  Key,
  Bell,
  Eye,
  Briefcase,
  Save,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Shield
} from 'lucide-react';

export const CandidateSettingsView: React.FC = () => {
  const { user, logout } = useAuth();
  const { navigate } = useRouter();

  const [activeTab, setActiveTab] = useState<'account' | 'preferences' | 'notifications' | 'privacy'>('account');

  // Account Form State
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Settings Data
  const [settings, setSettings] = useState<CandidateSettingsData>({
    job_preferences: {
      desired_roles: ['Software Engineer'],
      work_modes: ['Remote', 'Hybrid'],
      preferred_locations: ['Remote'],
      min_salary: 80000,
      currency: 'USD'
    },
    notification_preferences: {
      email_job_alerts: true,
      email_application_updates: true,
      email_interview_invites: true,
      email_marketing: false
    },
    privacy_preferences: {
      profile_visibility: 'public',
      resume_visibility: 'applied_only',
      share_mock_interview_scores: false
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await candidateAPI.getSettings();
      if (res.data?.success && res.data.settings) {
        setSettings(res.data.settings);
        if (res.data.user?.name) setName(res.data.user.name);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setErrorMsg('New password and confirm password do not match');
        return;
      }
      if (!currentPassword) {
        setErrorMsg('Please enter current password to set a new password');
        return;
      }
    }

    try {
      setSaving(true);
      const payload: any = {
        name,
        job_preferences: settings.job_preferences,
        notification_preferences: settings.notification_preferences,
        privacy_preferences: settings.privacy_preferences
      };

      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      const res = await candidateAPI.updateSettings(payload);
      if (res.data?.success) {
        setSuccessMsg('Settings updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        badge="ACCOUNT & PREFERENCES"
        badgeSubtext="Security & Privacy Configuration"
        icon={<Settings className="w-6 h-6" />}
        title="Candidate Settings"
        subtitle="Manage your account security, job preferences, notification alerts, and privacy rules."
        actions={
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        }
      />

      {/* Tabs Row */}
      <div className="flex flex-wrap gap-2 border-b border-[#4a4636] pb-3 text-xs font-semibold">
        {[
          { key: 'account', label: 'Account & Security', icon: User },
          { key: 'preferences', label: 'Job Preferences', icon: Briefcase },
          { key: 'notifications', label: 'Notifications', icon: Bell },
          { key: 'privacy', label: 'Privacy & Visibility', icon: Eye }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#4a5e2f]/20 text-[#4a5e2f] border border-[#4a5e2f]/40 font-bold'
                  : 'text-[#9a8e7a] hover:text-[#f0ebe0] hover:bg-[#f5f0e8]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {successMsg && (
        <div className="p-3.5 bg-[#3d6b35]/15 border border-[#3d6b35]/30 text-[#3d6b35] text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* TAB 1: Account & Security */}
        {activeTab === 'account' && (
          <div className="bg-[#f5f0e8]/70 p-6 rounded-2xl border border-[#4a4636] space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#f0ebe0] mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-[#4a5e2f]" />
                <span>Account Information</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-xs text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3.5 py-2.5 bg-[#f5f0e8]/50 border border-[#4a4636] rounded-xl text-xs text-[#9a8e7a] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#4a4636] space-y-3">
              <h2 className="text-base font-bold text-[#f0ebe0] flex items-center gap-2">
                <Key className="w-4 h-4 text-[#4a5e2f]" />
                <span>Change Password</span>
              </h2>
              <p className="text-xs text-[#9a8e7a]">Leave blank if you do not want to change your password.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-xs text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#b5aa96] mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-xs text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-xs text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Job Preferences */}
        {activeTab === 'preferences' && (
          <div className="bg-[#f5f0e8]/70 p-6 rounded-2xl border border-[#4a4636] space-y-4">
            <h2 className="text-base font-bold text-[#f0ebe0] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#4a5e2f]" />
              <span>Target Role & Compensation Preferences</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Minimum Expected Annual Salary</label>
                <input
                  type="number"
                  value={settings.job_preferences?.min_salary || 0}
                  onChange={(e) => setSettings({
                    ...settings,
                    job_preferences: { ...settings.job_preferences, min_salary: Number(e.target.value) }
                  })}
                  className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-xs text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Currency</label>
                <select
                  value={settings.job_preferences?.currency || 'USD'}
                  onChange={(e) => setSettings({
                    ...settings,
                    job_preferences: { ...settings.job_preferences, currency: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-xs text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Notifications */}
        {activeTab === 'notifications' && (
          <div className="bg-[#f5f0e8]/70 p-6 rounded-2xl border border-[#4a4636] space-y-4">
            <h2 className="text-base font-bold text-[#f0ebe0] flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#4a5e2f]" />
              <span>Notification Preferences</span>
            </h2>

            <div className="space-y-3 divide-y divide-[#d5cec3]">
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#f0ebe0] block">Job Alerts</span>
                  <span className="text-[11px] text-[#9a8e7a]">Receive notifications when new high-match jobs are posted</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notification_preferences?.email_job_alerts}
                  onChange={(e) => setSettings({
                    ...settings,
                    notification_preferences: { ...settings.notification_preferences, email_job_alerts: e.target.checked }
                  })}
                  className="rounded border-[#4a4636] text-[#4a5e2f] focus:ring-0"
                />
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#f0ebe0] block">Application Status Updates</span>
                  <span className="text-[11px] text-[#9a8e7a]">Updates when applications are reviewed, shortlisted, or scheduled</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notification_preferences?.email_application_updates}
                  onChange={(e) => setSettings({
                    ...settings,
                    notification_preferences: { ...settings.notification_preferences, email_application_updates: e.target.checked }
                  })}
                  className="rounded border-[#4a4636] text-[#4a5e2f] focus:ring-0"
                />
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#f0ebe0] block">Interview Invitations</span>
                  <span className="text-[11px] text-[#9a8e7a]">Immediate alerts when a recruiter requests an interview meeting</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notification_preferences?.email_interview_invites}
                  onChange={(e) => setSettings({
                    ...settings,
                    notification_preferences: { ...settings.notification_preferences, email_interview_invites: e.target.checked }
                  })}
                  className="rounded border-[#4a4636] text-[#4a5e2f] focus:ring-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Privacy & Visibility */}
        {activeTab === 'privacy' && (
          <div className="bg-[#f5f0e8]/70 p-6 rounded-2xl border border-[#4a4636] space-y-4">
            <h2 className="text-base font-bold text-[#f0ebe0] flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#4a5e2f]" />
              <span>Privacy & Recruiter Visibility</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Candidate Profile Visibility</label>
                <select
                  value={settings.privacy_preferences?.profile_visibility || 'public'}
                  onChange={(e) => setSettings({
                    ...settings,
                    privacy_preferences: { ...settings.privacy_preferences, profile_visibility: e.target.value as any }
                  })}
                  className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-xs text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
                >
                  <option value="public">Public (Visible to all verified recruiters & employers)</option>
                  <option value="recruiters_only">Recruiters Only</option>
                  <option value="private">Private (Only visible to companies you directly apply to)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Resume Visibility</label>
                <select
                  value={settings.privacy_preferences?.resume_visibility || 'applied_only'}
                  onChange={(e) => setSettings({
                    ...settings,
                    privacy_preferences: { ...settings.privacy_preferences, resume_visibility: e.target.value as any }
                  })}
                  className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-xs text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
                >
                  <option value="applied_only">Applied Only (Visible only upon application submission)</option>
                  <option value="public">Public (Viewable on candidate discovery profile)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-[#4a4636]">
                <div>
                  <span className="text-xs font-bold text-[#f0ebe0] block">Share Mock Interview Scores with Recruiters</span>
                  <span className="text-[11px] text-[#9a8e7a]">
                    By default, mock interview scores remain strictly private. Toggle on if you want to showcase high scores.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.privacy_preferences?.share_mock_interview_scores}
                  onChange={(e) => setSettings({
                    ...settings,
                    privacy_preferences: { ...settings.privacy_preferences, share_mock_interview_scores: e.target.checked }
                  })}
                  className="rounded border-[#4a4636] text-[#4a5e2f] focus:ring-0"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-[#4a5e2f] to-[#4a5e2f] hover:from-[#4a5e2f] hover:to-[#4a5e2f] text-[#f0ebe0] rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#4a5e2f]/20 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};


