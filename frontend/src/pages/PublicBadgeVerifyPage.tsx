import React, { useState, useEffect } from 'react';
import { assessmentsAPI } from '../services/api.js';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  Search,
  ExternalLink,
  Lock,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

interface PublicBadgeVerifyPageProps {
  initialBadgeCode?: string;
  onNavigateHome?: () => void;
}

export const PublicBadgeVerifyPage: React.FC<PublicBadgeVerifyPageProps> = ({
  initialBadgeCode = 'SKB-REACT-8921',
  onNavigateHome
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
      {/* Header Search Box */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Public Credential Verification Registry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Verify Micro-Credential Authenticity
        </h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Employers and recruiters can independently validate candidate skill credentials, scores, and cryptographic SHA-256 signatures in real-time.
        </p>

        {/* Verification Search Bar */}
        <form onSubmit={handleSearch} className="flex max-w-md mx-auto items-center gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={badgeCodeInput}
              onChange={e => setBadgeCodeInput(e.target.value)}
              placeholder="Enter Badge Code (e.g. SKB-REACT-8921)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>

      {/* Quick Test Demo Codes */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
        <span>Try Sample Badges:</span>
        <button
          onClick={() => {
            setBadgeCodeInput('SKB-REACT-8921');
            verifyBadge('SKB-REACT-8921');
          }}
          className="font-mono text-indigo-400 hover:underline bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700"
        >
          SKB-REACT-8921 (Arjun - React)
        </button>
        <button
          onClick={() => {
            setBadgeCodeInput('SKB-SQL-3918');
            verifyBadge('SKB-SQL-3918');
          }}
          className="font-mono text-cyan-400 hover:underline bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700"
        >
          SKB-SQL-3918 (Priya - SQL)
        </button>
      </div>

      {/* Verification Result Certificate Card */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">
          Querying cryptographic registry and evaluating HMAC signatures...
        </div>
      ) : errorMsg ? (
        <div className="p-8 rounded-3xl bg-rose-950/30 border border-rose-500/40 text-center space-y-3">
          <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Credential Verification Failed</h3>
          <p className="text-xs text-rose-300 max-w-md mx-auto">{errorMsg}</p>
        </div>
      ) : badgeData ? (
        <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 rounded-3xl border-2 border-emerald-500/50 p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Certificate Seal Background */}
          <div className="absolute top-4 right-4 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Cryptographically Verified & Authentic</span>
          </div>

          <div className="flex items-start gap-4 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-emerald-600 to-indigo-600 p-[2px] shadow-xl">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Award className="w-8 h-8 text-amber-400" />
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Official Digital Micro-Credential Certificate
              </span>
              <h2 className="text-2xl font-black text-white mt-0.5">{badgeData.skill_name} Specialist</h2>
              <p className="text-xs text-slate-400">{badgeData.assessment_title}</p>
            </div>
          </div>

          {/* Certificate Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Candidate Recipient</span>
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={badgeData.recipient_avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + badgeData.recipient_name}
                  alt={badgeData.recipient_name}
                  className="w-6 h-6 rounded-full bg-slate-800"
                />
                <span className="font-bold text-white text-sm">{badgeData.recipient_name}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Assessment Score</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black text-emerald-400">{badgeData.score_percentage}%</span>
                <span className="text-xs text-slate-400">({badgeData.level} Tier)</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Credential ID</span>
              <code className="font-mono text-xs text-indigo-300 font-bold bg-slate-900 px-2 py-0.5 rounded mt-1 inline-block">
                {badgeData.badge_code}
              </code>
            </div>

            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Issuance Timestamp</span>
              <p className="text-slate-200 mt-1 font-semibold">
                {new Date(badgeData.issued_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Cryptographic Signature Info */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> Tamper-Proof Cryptographic Hash
              </span>
              <span className="text-[10px] font-mono">{badgeData.cryptographic_algorithm}</span>
            </div>
            <p className="font-mono text-[10px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800 break-all select-all">
              {badgeData.verification_hash}
            </p>
            <p className="text-[10px] text-slate-500">
              Issued by: <strong className="text-slate-400">{badgeData.issuer}</strong> • Status:{' '}
              <strong className="text-emerald-400 capitalize">{badgeData.status}</strong>
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
