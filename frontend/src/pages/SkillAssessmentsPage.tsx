import React, { useState, useEffect } from 'react';
import { Assessment, VerifiableBadge } from '../types/index.js';
import { assessmentsAPI } from '../services/api.js';
import { AssessmentQuiz } from '../components/AssessmentQuiz.js';
import { VerifiableBadgeCard } from '../components/VerifiableBadgeCard.js';
import {
  Award,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Zap,
  BookOpen
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';

export const SkillAssessmentsPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [badges, setBadges] = useState<VerifiableBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await assessmentsAPI.getAssessments();
      if (res.data.success) {
        setAssessments(res.data.assessments);
      }

      if (user && user.role === 'job_seeker') {
        const badgeRes = await assessmentsAPI.getMyBadges();
        if (badgeRes.data.success) {
          setBadges(badgeRes.data.badges);
        }
      }
    } catch (e) {
      console.error('Failed to load assessments', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 rounded-3xl border border-slate-800 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Verifiable Micro-Credentialing Engine
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">{t('assessments_title')}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">{t('assessments_subtitle')}</p>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 text-xs space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Cryptographic Proof</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Earned badges receive a unique SHA-256 hash verifiable by employers.
          </p>
        </div>
      </div>

      {/* User's Earned Badges Section */}
      {user && user.role === 'job_seeker' && badges.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Your Earned Micro-Credentials ({badges.length})</span>
            </h3>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30">
              +{badges.length * 5}% Job-Fit Bonus Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {badges.map((badge) => (
              <VerifiableBadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </div>
      )}

      {/* Available Assessments Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-400" />
          <span>Available Skill Certifications</span>
        </h3>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading skill assessment directory...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((asm) => {
              const alreadyEarned = badges.some(b => b.skill_name.toLowerCase() === asm.skill_name.toLowerCase());
              return (
                <div
                  key={asm.id}
                  className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                    alreadyEarned
                      ? 'bg-slate-900/60 border-emerald-500/40 shadow-sm shadow-emerald-950'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-indigo-300 border border-slate-700">
                        {asm.category}
                      </span>
                      {alreadyEarned && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Badge Earned
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-white mb-2">{asm.title}</h4>
                    <p className="text-xs text-slate-400 mb-4">
                      Evaluate fundamental concepts, debugging proficiency, and architecture principles for{' '}
                      <strong className="text-slate-200">{asm.skill_name}</strong>.
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-slate-800/80 pt-3 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {asm.duration_minutes} Mins
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        {asm.total_questions} Questions
                      </span>
                      <span>Pass: {asm.pass_percentage}%</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveQuizId(asm.id)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      alreadyEarned
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        : 'bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                    }`}
                  >
                    <span>{alreadyEarned ? 'Retake Assessment' : t('btn_start_assessment')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Quiz Modal */}
      {activeQuizId && (
        <AssessmentQuiz
          assessmentId={activeQuizId}
          onClose={() => setActiveQuizId(null)}
          onBadgeEarned={loadData}
        />
      )}
    </div>
  );
};
