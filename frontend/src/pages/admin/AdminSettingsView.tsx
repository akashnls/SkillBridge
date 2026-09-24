import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  Settings,
  Shield,
  Sliders,
  CheckCircle2,
  Lock,
  Globe,
  Bell,
  Save,
  RefreshCw,
  Layers,
  FileCheck2
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({
    job_approval_required: '0',
    company_verification_required: '1',
    feature_messaging: '1',
    feature_interviews: '1',
    default_language: 'en',
    min_password_length: '8',
    session_timeout_hours: '24'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getSettings();
      if (res.data?.success && res.data.settings) {
        setSettings((prev) => ({ ...prev, ...res.data.settings }));
      }
    } catch (e) {
      console.error('Failed to load platform settings', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key] === '1' ? '0' : '1'
    }));
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    try {
      await adminAPI.updateSettings(settings);
      setSuccessMsg('Platform configuration updated and persisted to database!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-[#9a8e7a] text-xs animate-pulse">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#3d6b35]" />
        Loading platform governance settings...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#3d6b35]/20 text-[#3d6b35] border border-[#3d6b35]/30">
              System Control & Moderation Policies
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#f0ebe0] tracking-tight">
            Platform Settings & Governance
          </h1>
          <p className="text-[#9a8e7a] text-xs md:text-sm mt-1">
            Configure global moderation gates, job approval policies, feature toggles, and authentication rules.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3d6b35] hover:bg-[#3d6b35] text-[#f0ebe0] text-xs font-bold transition shadow-lg shadow-[#4a5e2f]/40 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Persisting...' : 'Save Configuration'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#3d6b35]/10 border border-[#3d6b35]/30 text-[#3d6b35] text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#3d6b35]" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Moderation Gates */}
        <div className="p-6 rounded-3xl bg-[#f5f0e8]/80 border border-[#4a4636]/80 shadow-lg space-y-4">
          <h2 className="text-base font-bold text-[#f0ebe0] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#3d6b35]" />
            Moderation & Review Gates
          </h2>
          <p className="text-xs text-[#9a8e7a]">
            Enforce human-in-the-loop review before recruiter assets become publicly searchable.
          </p>

          <div className="space-y-4 pt-2 divide-y divide-[#d5cec3]">
            <div className="pt-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#f0ebe0] block">Job Requisition Moderation Required</span>
                <span className="text-[11px] text-[#9a8e7a] block mt-0.5">
                  When enabled, newly created recruiter jobs enter 'Pending Review' status and require explicit admin approval before candidate discovery.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('job_approval_required')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  settings.job_approval_required === '1' ? 'bg-[#3d6b35]' : 'bg-[#3a3828]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#ede8df] shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.job_approval_required === '1' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#f0ebe0] block">Strict Company Verification Gate</span>
                <span className="text-[11px] text-[#9a8e7a] block mt-0.5">
                  Require enterprise employer organizations to hold 'Verified' badge from admin before receiving applications.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('company_verification_required')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  settings.company_verification_required === '1' ? 'bg-[#3d6b35]' : 'bg-[#3a3828]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#ede8df] shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.company_verification_required === '1' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Communication & Feature Flags */}
        <div className="p-6 rounded-3xl bg-[#f5f0e8]/80 border border-[#4a4636]/80 shadow-lg space-y-4">
          <h2 className="text-base font-bold text-[#f0ebe0] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#4a5e2f]" />
            Recruitment Suite Feature Toggles
          </h2>

          <div className="space-y-4 pt-2 divide-y divide-[#d5cec3]">
            <div className="pt-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#f0ebe0] block">Real-Time Messaging System</span>
                <span className="text-[11px] text-[#9a8e7a] block mt-0.5">
                  Allow candidates and recruiters to exchange in-app direct messages during active recruitment stages.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('feature_messaging')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  settings.feature_messaging === '1' ? 'bg-[#3d6b35]' : 'bg-[#3a3828]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#ede8df] shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.feature_messaging === '1' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#f0ebe0] block">Interview Scheduling & Notification Engine</span>
                <span className="text-[11px] text-[#9a8e7a] block mt-0.5">
                  Enable video/phone/in-person interview scheduling with automated candidate calendar invitations.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('feature_interviews')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  settings.feature_interviews === '1' ? 'bg-[#3d6b35]' : 'bg-[#3a3828]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#ede8df] shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.feature_interviews === '1' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Localization & Security Policies */}
        <div className="p-6 rounded-3xl bg-[#f5f0e8]/80 border border-[#4a4636]/80 shadow-lg space-y-4">
          <h2 className="text-base font-bold text-[#f0ebe0] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#4a5e2f]" />
            Localization & Security Defaults
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#b5aa96] mb-1.5">
                Default Platform Language
              </label>
              <select
                value={settings.default_language}
                onChange={(e) => handleChange('default_language', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#f0ebe0] focus:outline-none focus:ring-2 focus:ring-[#3d6b35]"
              >
                <option value="en">English (Global)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#b5aa96] mb-1.5">
                Minimum Password Complexity Length
              </label>
              <input
                type="number"
                min="6"
                max="32"
                value={settings.min_password_length || '8'}
                onChange={(e) => handleChange('min_password_length', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#f0ebe0] focus:outline-none focus:ring-2 focus:ring-[#3d6b35]"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsView;


