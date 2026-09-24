import React, { useState, useEffect } from 'react';
import { assessmentsAPI } from '../services/api.js';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  XCircle,
  Search,
  Lock
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

interface PublicBadgeVerifyPageProps {
  initialBadgeCode?: string;
  onNavigateHome?: () => void;
}

export const PublicBadgeVerifyPage: React.FC<PublicBadgeVerifyPageProps> = ({
  initialBadgeCode = 'SKB-REACT-8921'
}) => {
  const { t } = useLanguage();
  const [badgeCodeInput, setBadgeCodeInput] = useState(initialBadgeCode);
  const [badgeData, setBadgeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialBadgeCode) {
      verifyBadge(initialBadgeCode);
    }
  }, [initialBadgeCode]);

  const verifyBadge = async (codeToVerify: string) => {
    if (!codeToVerify.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setBadgeData(null);

    try {
      const res = await assessmentsAPI.verifyBadgePublic(codeToVerify.trim());
      if (res.data.success && res.data.verified) {
        setBadgeData(res.data.badge);
      } else {
        setErrorMsg(res.data.message || 'Invalid or revoked credential');
      }
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || 'Invalid badge code or micro-credential not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    verifyBadge(badgeCodeInput);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8 px-4">
      {/* Header Search Box - Dark Fintech style */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B6FF3B]/10 border border-[#B6FF3B]/30 text-[#B6FF3B] text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-[#B6FF3B]" />
          <span>Public Credential Verification Registry</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Verify Micro-Credential Authenticity
        </h1>
        <p className="text-xs sm:text-sm text-[#9CA3A1] max-w-lg mx-auto leading-relaxed">
          Employers and recruiters can independently validate candidate skill credentials, scores, and cryptographic SHA-256 signatures in real-time.
        </p>

        {/* Verification Search Bar */}
        <form onSubmit={handleSearch} className="flex max-w-md mx-auto items-center gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={badgeCodeInput}
              onChange={e => setBadgeCodeInput(e.target.value)}
              placeholder="Enter Badge Code (e.g. SKB-REACT-8921)"
              className="w-full bg-[#16181A] border border-white/10 rounded-full pl-11 pr-4 py-2.5 text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-[#B6FF3B] focus:ring-1 focus:ring-[#B6FF3B] shadow-lg transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-full bg-[#B6FF3B] hover:bg-[#C6FF5A] text-[#0B0D0C] text-xs font-bold shadow-lg shadow-[#B6FF3B]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>

      {/* Quick Test Demo Codes */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#9CA3A1]">
        <span>Try Sample Badges:</span>
        <button
          onClick={() => {
            setBadgeCodeInput('SKB-REACT-8921');
            verifyBadge('SKB-REACT-8921');
          }}
          className="font-mono text-[#B6FF3B] hover:underline bg-[#16181A] px-3 py-1 rounded-full border border-white/10 shadow-xs transition-all"
        >
          SKB-REACT-8921 (Arjun - React)
        </button>
        <button
          onClick={() => {
            setBadgeCodeInput('SKB-SQL-3918');
            verifyBadge('SKB-SQL-3918');
          }}
          className="font-mono text-[#B6FF3B] hover:underline bg-[#16181A] px-3 py-1 rounded-full border border-white/10 shadow-xs transition-all"
        >
          SKB-SQL-3918 (Priya - SQL)
        </button>
      </div>

      {/* Verification Result Certificate Card */}
      {loading ? (
        <div className="text-center py-16 text-[#9CA3A1] text-xs">
          Querying cryptographic registry and evaluating HMAC signatures...
        </div>
      ) : errorMsg ? (
        <div className="p-8 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-center space-y-3 shadow-xl">
          <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Credential Verification Failed</h3>
          <p className="text-xs text-rose-400 max-w-md mx-auto">{errorMsg}</p>
        </div>
      ) : badgeData ? (
        <div className="bg-[#16181A] rounded-3xl border-2 border-[#B6FF3B]/60 p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Certificate Seal Background */}
          <div className="sm:absolute sm:top-6 sm:right-6 bg-[#B6FF3B]/10 border border-[#B6FF3B]/40 px-3.5 py-1 rounded-full text-[#B6FF3B] text-xs font-bold flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="w-4 h-4 text-[#B6FF3B] shrink-0" />
            <span>Cryptographically Verified & Authentic</span>
          </div>

          <div className="flex items-start gap-4 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-[#B6FF3B]/10 border border-[#B6FF3B]/30 flex items-center justify-center text-[#B6FF3B] shadow-lg shrink-0">
              <Award className="w-8 h-8 text-[#B6FF3B]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#B6FF3B]">
                Official Digital Micro-Credential Certificate
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-0.5">{badgeData.skill_name} Specialist</h2>
              <p className="text-xs text-[#9CA3A1]">{badgeData.assessment_title}</p>
            </div>
          </div>

          {/* Certificate Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#101211] p-5 rounded-2xl border border-white/8 text-xs">
            <div>
              <span className="text-[10px] uppercase text-[#6B7280] block font-bold">Candidate Recipient</span>
              <div className="flex items-center gap-2.5 mt-1.5">
                <img
                  src={badgeData.recipient_avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + badgeData.recipient_name}
                  alt={badgeData.recipient_name}
                  className="w-7 h-7 rounded-full bg-white/10"
                />
                <span className="font-bold text-white text-sm">{badgeData.recipient_name}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase text-[#6B7280] block font-bold">Assessment Score</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black text-[#B6FF3B]">{badgeData.score_percentage}%</span>
                <span className="text-xs text-[#9CA3A1] font-semibold">({badgeData.level} Tier)</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase text-[#6B7280] block font-bold">Credential ID</span>
              <code className="font-mono text-xs text-amber-400 font-bold bg-amber-400/10 border border-amber-400/25 px-2.5 py-0.5 rounded-full mt-1.5 inline-block">
                {badgeData.badge_code}
              </code>
            </div>

            <div>
              <span className="text-[10px] uppercase text-[#6B7280] block font-bold">Issuance Timestamp</span>
              <p className="text-white mt-1.5 font-semibold">
                {new Date(badgeData.issued_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Cryptographic Signature Info */}
          <div className="p-4 rounded-2xl bg-[#101211] border border-white/8 text-xs space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-[#9CA3A1]">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#B6FF3B]" /> Tamper-Proof Cryptographic Hash
              </span>
              <span className="text-[10px] font-mono text-[#6B7280]">{badgeData.cryptographic_algorithm}</span>
            </div>
            <p className="font-mono text-[10px] text-[#9CA3A1] bg-[#16181A] p-2.5 rounded-xl border border-white/5 break-all select-all">
              {badgeData.verification_hash}
            </p>
            <p className="text-[10px] text-[#6B7280]">
              Issued by: <strong className="text-[#9CA3A1]">{badgeData.issuer}</strong> • Status:{' '}
              <strong className="text-[#B6FF3B] capitalize">{badgeData.status}</strong>
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};


