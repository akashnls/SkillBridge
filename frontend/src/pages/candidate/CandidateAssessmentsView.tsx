import React, { useState, useEffect } from 'react';
import { Assessment, VerifiableBadge } from '../../types/index.js';
import { assessmentsAPI, candidateAPI } from '../../services/api.js';
import { AssessmentQuiz } from '../../components/AssessmentQuiz.js';
import { VerifiableBadgeCard } from '../../components/VerifiableBadgeCard.js';
import { PageHeader } from '../../components/PageHeader.js';
import {
  Award,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Zap,
  BookOpen,
  ArrowRight,
  Sparkles,
  HelpCircle,
  TrendingUp,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const CandidateAssessmentsView: React.FC = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [badges, setBadges] = useState<VerifiableBadge[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resAssessments, resBadges, resDashboard] = await Promise.all([
        assessmentsAPI.getAssessments().catch(() => ({ data: { success: false, assessments: [] } })),
        assessmentsAPI.getMyBadges().catch(() => ({ data: { success: false, badges: [] } })),
        candidateAPI.getDashboard().catch(() => ({ data: { success: false, dashboard: null } }))
      ]);

      if (resAssessments.data?.success) {
        setAssessments(resAssessments.data.assessments);
      }
      if (resBadges.data?.success) {
        setBadges(resBadges.data.badges);
      }
      if (resDashboard.data?.success && resDashboard.data.dashboard?.recent_assessments) {
        setRecentAttempts(resDashboard.data.dashboard.recent_assessments);
      }
    } catch (e) {
      console.error('Failed to load assessments', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentComplete = () => {
    setActiveQuizId(null);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#4a5e2f]/20 border-t-[#4a5e2f] rounded-full animate-spin" />
      </div>
    );
  }

  // If taking quiz
  if (activeQuizId) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#4a4636]">
          <h2 className="text-lg font-bold text-[#f0ebe0] flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#b45309]" />
            <span>Active Skill Assessment</span>
          </h2>
          <button
            onClick={() => setActiveQuizId(null)}
            className="p-2 text-[#9a8e7a] hover:text-[#f0ebe0] rounded-lg hover:bg-[#3a3828] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <AssessmentQuiz
          assessmentId={activeQuizId}
          onBadgeEarned={handleAssessmentComplete}
          onClose={() => setActiveQuizId(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header Banner */}
      <PageHeader
        badge="Verified Micro-Credentials"
        badgeSubtext="Deterministic Skill Validation"
        title="Skill Assessments & Badges"
        subtitle="Pass timed assessments to verify your skills. Verified badges boost your candidate-job match score and ATS rank by up to 25%."
        actions={
          <div className="p-4 bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.08] text-xs space-y-1.5 shrink-0 max-w-xs shadow-lg">
            <div className="flex items-center gap-2 text-[#B6FF3B] font-bold">
              <ShieldCheck className="w-4 h-4 text-[#B6FF3B]" />
              <span>Cryptographic Verification</span>
            </div>
            <p className="text-[11px] text-[#9CA3A1] leading-relaxed">
              Every badge is issued with an immutable code verifiable publicly by any recruiter or employer.
            </p>
          </div>
        }
      />

      {/* Earned Badges Section */}
      {badges.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#f0ebe0] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#b45309]" />
              <span>Your Earned Micro-Credentials ({badges.length})</span>
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#3d6b35]/20 text-[#3d6b35] border border-[#3d6b35]/30">
              +{badges.length * 5}% Job-Fit Bonus Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <VerifiableBadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </div>
      )}

      {/* Available Assessments Catalog */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#f0ebe0] flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#4a5e2f]" />
            <span>Available Assessments ({assessments.length})</span>
          </h2>
          <p className="text-xs text-[#9a8e7a]">Select a skill to start an assessment. Complete all questions before the timer runs out.</p>
        </div>

        {assessments.length === 0 ? (
          <div className="p-8 bg-[#f5f0e8]/60 rounded-2xl border border-[#4a4636] text-center">
            <p className="text-[#9a8e7a] text-sm">No assessments currently published. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessments.map((item) => {
              const alreadyHasBadge = badges.some(
                b => b.skill_name.toLowerCase() === item.skill_name.toLowerCase()
              );

              return (
                <div
                  key={item.id}
                  className="p-5 bg-[#f5f0e8]/70 rounded-2xl border border-[#4a4636] hover:border-[#4a4636] transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#f5f0e8] text-[#4a5e2f] border border-[#4a4636]">
                        {item.skill_name}
                      </span>
                      {alreadyHasBadge ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3d6b35]/20 text-[#3d6b35] border border-[#3d6b35]/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Passed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#4a5e2f]/20 text-[#4a5e2f]">
                          {item.passing_score}% to Pass
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[#f0ebe0] group-hover:text-[#4a5e2f] transition-colors mt-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#9a8e7a] mt-1 line-clamp-2">
                      {item.description || `Test your knowledge and proficiency in ${item.skill_name}.`}
                    </p>

                    <div className="mt-4 flex items-center gap-4 text-xs text-[#9a8e7a]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#9a8e7a]" />
                        <span>{item.duration_minutes || 15} mins</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-[#9a8e7a]" />
                        <span>{item.questions?.length || 10} Questions</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#4a4636]/80">
                    <button
                      onClick={() => setActiveQuizId(item.id)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        alreadyHasBadge
                          ? 'bg-[#f5f0e8] hover:bg-[#3a3828] text-[#b5aa96] border border-[#4a4636]'
                          : 'bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] shadow-md shadow-[#4a5e2f]/20'
                      }`}
                    >
                      <span>{alreadyHasBadge ? 'Retake for Higher Score' : 'Start Assessment'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assessment History / Recent Attempts */}
      {recentAttempts.length > 0 && (
        <div className="bg-[#f5f0e8]/70 p-5 rounded-2xl border border-[#4a4636] space-y-3">
          <h2 className="text-sm font-bold text-[#f0ebe0] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#4a5e2f]" />
            <span>Recent Assessment Attempts</span>
          </h2>
          <div className="divide-y divide-[#d5cec3]">
            {recentAttempts.map((attempt) => (
              <div key={attempt.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#f0ebe0]">{attempt.assessment_title}</div>
                  <span className="text-[11px] text-[#9a8e7a]">
                    {new Date(attempt.started_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${attempt.passed ? 'text-[#3d6b35]' : 'text-rose-400'}`}>
                    {attempt.score_percentage}%
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    attempt.passed ? 'bg-[#3d6b35]/20 text-[#3d6b35]' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {attempt.passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


