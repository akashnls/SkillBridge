import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  LogOut,
  Sliders
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';

export const RecruiterSettingsView: React.FC = () => {
  const { user, logout } = useAuth();
  const { navigate } = useRouter();

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    name: user?.name || 'Recruitment Officer',
    email: user?.email || '',
    title: 'Senior Talent Acquisition Partner',
    notifyApplications: true,
    notifyInterviews: true,
    notifyDigest: false,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccessMsg('Account preferences successfully updated!');
      setTimeout(() => setSuccessMsg(null), 4000);
    }, 600);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#2c2a1e]">Recruiter Account & Settings</h1>
        <p className="text-[#9a8e7a] text-sm mt-1">
          Manage your enterprise recruiter profile, security credentials, and platform notification triggers.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-[#c6ddb8]/50 border border-[#3d6b35]/30 text-[#3d6b35] text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#3d6b35] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Recruiter Identity */}
        <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm p-6 space-y-5">
          <h2 className="text-base font-bold text-[#2c2a1e] border-b border-[#d5cec3]/60 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-[#4a5e2f]" />
            Recruiter Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={e => setSettings(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5cec3] text-sm text-[#2c2a1e] focus:ring-2 focus:ring-[#4a5e2f]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                Work Email Address
              </label>
              <input
                type="email"
                disabled
                value={settings.email}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5cec3] bg-[#ede8df] text-sm text-[#9a8e7a] cursor-not-allowed"
              />
              <span className="text-[11px] text-[#9a8e7a] mt-1 block">Account email cannot be modified directly.</span>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                Job Title / Corporate Role
              </label>
              <input
                type="text"
                value={settings.title}
                onChange={e => setSettings(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Lead Technical Recruiter"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5cec3] text-sm text-[#2c2a1e] focus:ring-2 focus:ring-[#4a5e2f]"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-[#2c2a1e] border-b border-[#d5cec3]/60 pb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#4a5e2f]" />
            Notification Subscriptions
          </h2>

          <div className="space-y-3 text-sm">
            <label className="flex items-center justify-between p-3 rounded-xl border border-[#d5cec3]/60 hover:bg-[#e4ddd2] cursor-pointer transition">
              <div>
                <span className="font-semibold text-[#2c2a1e] block text-xs">New Candidate Applications</span>
                <span className="text-[11px] text-[#9a8e7a]">Receive instant alerts when a verified candidate applies to your job openings.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.notifyApplications}
                onChange={e => setSettings(p => ({ ...p, notifyApplications: e.target.checked }))}
                className="w-4 h-4 accent-[#4a5e2f] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-[#d5cec3]/60 hover:bg-[#e4ddd2] cursor-pointer transition">
              <div>
                <span className="font-semibold text-[#2c2a1e] block text-xs">Interview Schedule Updates</span>
                <span className="text-[11px] text-[#9a8e7a]">Notifications when candidates confirm, reschedule, or join video screenings.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.notifyInterviews}
                onChange={e => setSettings(p => ({ ...p, notifyInterviews: e.target.checked }))}
                className="w-4 h-4 accent-[#4a5e2f] rounded"
              />
            </label>
          </div>
        </div>

        {/* Security / Logout */}
        <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#2c2a1e] text-sm">Account Session</h3>
            <p className="text-xs text-[#9a8e7a] mt-0.5">End your current session on this device.</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] font-semibold text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default RecruiterSettingsView;


