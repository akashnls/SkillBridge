import React from 'react';
import { VerifiableBadge } from '../types/index.js';
import { Award, ShieldCheck, ExternalLink, Copy, Check } from 'lucide-react';
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

  return (
    <div className="bg-[#16181A] rounded-2xl border border-white/[0.08] p-5 relative overflow-hidden group hover:border-[#B6FF3B]/40 transition-all hover:shadow-[0_0_25px_-5px_rgba(182,255,59,0.15)] shadow-xl">
      {/* Decorative Glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#B6FF3B]/5 rounded-full blur-2xl group-hover:bg-[#B6FF3B]/10 transition-all" />

      {/* Top Badge Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#B6FF3B]/10 border border-[#B6FF3B]/30 flex items-center justify-center text-[#B6FF3B] shadow-[0_0_12px_rgba(182,255,59,0.2)]">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#B6FF3B]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Micro-Credential</span>
            </div>
            <h4 className="text-base font-bold text-white">{badge.skill_name}</h4>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/30">
          {badge.score_percentage}% Score
        </span>
      </div>

      {/* Metadata */}
      <div className="space-y-2 mb-4 text-xs text-[#9CA3A1]">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
          <span>Proficiency Tier:</span>
          <span className="font-semibold text-white">{badge.level}</span>
        </div>
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
          <span>Badge Identifier:</span>
          <code className="font-mono text-[11px] text-[#B6FF3B] bg-[#B6FF3B]/10 px-2 py-0.5 rounded border border-[#B6FF3B]/20 font-bold">
            {badge.badge_code}
          </code>
        </div>
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
          <span>Issued Date:</span>
          <span className="text-[#9CA3A1]">
            {new Date(badge.issued_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block mb-1">SHA-256 Signature Hash:</span>
          <p className="font-mono text-[9px] text-[#9CA3A1] truncate bg-[#111312] p-2 rounded-lg border border-white/[0.06]">
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
          className="sb-btn-primary flex-1 py-2 text-xs font-bold shadow-[0_0_15px_rgba(182,255,59,0.3)]"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#0B0D0C]" />
          <span>Verify Credential</span>
        </button>

        <button
          onClick={handleCopyLink}
          title="Copy Verification Link"
          className="p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#9CA3A1] hover:text-white transition-all border border-white/10"
        >
          {copied ? <Check className="w-4 h-4 text-[#B6FF3B]" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};


