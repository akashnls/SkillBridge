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
      {/* Header Banner - Dark Fintech style */}
      <div className="bg-[#16181A] rounded-3xl border border-white/10 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#B6FF3B]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/25">
              Verifiable Micro-Credentialing Engine
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{t('assessments_title')}</h2>
          <p className="text-xs sm:text-sm text-[#9CA3A1] mt-1.5 max-w-xl leading-relaxed">{t('assessments_subtitle')}</p>
        </div>

        <div className="bg-[#101211] p-4 rounded-2xl border border-[#B6FF3B]/20 text-xs space-y-1.5 relative z-10">
          <div className="flex items-center gap-2 text-[#B6FF3B] font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Cryptographic Proof</span>
          </div>
          <p className="text-[11px] text-[#9CA3A1] max-w-xs">
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
            <span className="text-xs text-[#B6FF3B] font-semibold bg-[#B6FF3B]/10 px-3.5 py-1 rounded-full border border-[#B6FF3B]/30">
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
          <Zap className="w-5 h-5 text-[#B6FF3B]" />
          <span>Available Skill Certifications</span>
        </h3>

        {loading ? (
          <div className="text-center py-12 text-[#9CA3A1] text-xs">Loading skill assessment directory...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((asm) => {
              const alreadyEarned = badges.some(b => b.skill_name.toLowerCase() === asm.skill_name.toLowerCase());
              return (
                <div
                  key={asm.id}
                  className={`p-6 rounded-2xl border transition-all flex flex-col justify-between bg-[#16181A] ${
                    alreadyEarned
                      ? 'border-[#B6FF3B]/50 shadow-lg shadow-[#B6FF3B]/5'
                      : 'border-white/8 hover:border-[#B6FF3B]/30 hover:shadow-xl hover:shadow-[#B6FF3B]/5'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-[#B6FF3B] border border-white/10">
                        {asm.category}
                      </span>
                      {alreadyEarned && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Badge Earned
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-white mb-2">{asm.title}</h4>
                    <p className="text-xs text-[#9CA3A1] mb-4 leading-relaxed">
                      Evaluate fundamental concepts, debugging proficiency, and architecture principles for{' '}
                      <strong className="text-white">{asm.skill_name}</strong>.
                    </p>

                    <div className="flex items-center gap-4 text-xs text-[#9CA3A1] border-t border-white/8 pt-3 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#9CA3A1]" />
                        {asm.duration_minutes} Mins
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-[#9CA3A1]" />
                        {asm.total_questions} Questions
                      </span>
                      <span>Pass: {asm.pass_percentage}%</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveQuizId(asm.id)}
                    className={`w-full py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      alreadyEarned
                        ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                        : 'bg-[#B6FF3B] hover:bg-[#C6FF5A] text-[#0B0D0C] shadow-lg shadow-[#B6FF3B]/20 hover:scale-[1.02] active:scale-[0.98]'
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


