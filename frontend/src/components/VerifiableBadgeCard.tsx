import React from 'react';
import { VerifiableBadge } from '../types/index.js';
import { Award, ShieldCheck, CheckCircle2, ExternalLink, Calendar, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface VerifiableBadgeCardProps {
  badge: VerifiableBadge;
  onVerifyClick?: (badgeCode: string) => void;
}

export const VerifiableBadgeCard: React.FC<VerifiableBadgeCardProps> = ({ badge, onVerifyClick }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/verify/${badge.badge_code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const levelColor =
    badge.level === 'Expert'
      ? 'from-purple-600 via-indigo-600 to-amber-500 border-amber-400/50 text-amber-300'
      : badge.level === 'Advanced'
      ? 'from-blue-600 via-indigo-600 to-emerald-500 border-emerald-400/50 text-emerald-300'
      : 'from-slate-700 to-indigo-700 border-indigo-400/50 text-indigo-300';

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 rounded-2xl border border-slate-800 p-5 relative overflow-hidden group hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-950/30">
      {/* Decorative Glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />

      {/* Top Badge Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-purple-600 p-[2px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Award className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Micro-Credential</span>
            </div>
            <h4 className="text-base font-bold text-white">{badge.skill_name}</h4>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {badge.score_percentage}% Score
        </span>
      </div>

      {/* Metadata */}
      <div className="space-y-2 mb-4 text-xs text-slate-400">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <span>Proficiency Tier:</span>
          <span className="font-semibold text-white">{badge.level}</span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <span>Badge Identifier:</span>
          <code className="font-mono text-[11px] text-indigo-300 bg-slate-800/80 px-1.5 py-0.5 rounded">
            {badge.badge_code}
          </code>
        </div>
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <span>Issued Date:</span>
          <span className="text-slate-300">
            {new Date(badge.issued_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">SHA-256 Signature Hash:</span>
          <p className="font-mono text-[9px] text-slate-400 truncate bg-slate-950 p-1.5 rounded border border-slate-800">
            {badge.verification_hash}
          </p>
        </div>
      </div>

      {/* Verification Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => {
            if (onVerifyClick) onVerifyClick(badge.badge_code);
            else window.open(`/verify/${badge.badge_code}`, '_blank');
          }}
          className="flex-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-1.5 border border-slate-700"
        >
          <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
          <span>Verify Credential</span>
        </button>

        <button
          onClick={handleCopyLink}
          title="Copy Verification Link"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
