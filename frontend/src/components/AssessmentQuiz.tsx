import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Assessment } from '../types/index.js';
import { assessmentsAPI } from '../services/api.js';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  ShieldCheck,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

interface AssessmentQuizProps {
  assessmentId: string;
  onClose: () => void;
  onBadgeEarned?: () => void;
}

export const AssessmentQuiz: React.FC<AssessmentQuizProps> = ({ assessmentId, onClose, onBadgeEarned }) => {
  const { t } = useLanguage();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins in seconds
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadAssessment();
  }, [assessmentId]);

  useEffect(() => {
    if (submitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted, timeLeft]);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      const res = await assessmentsAPI.getAssessmentById(assessmentId);
      if (res.data.success) {
        setAssessment(res.data.assessment);
        setTimeLeft((res.data.assessment.duration_minutes || 15) * 60);
      }
    } catch (e) {
      console.error('Failed to load assessment', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmit = async () => {
    if (!assessment || submitted || submitting) return;
    setSubmitting(true);
    try {
      const answersPayload = Object.entries(answers).map(([qid, optIdx]) => ({
        question_id: qid,
        selected_index: optIdx
      }));

      const res = await assessmentsAPI.submitAssessment(assessmentId, answersPayload);
      if (res.data.success) {
        setResult(res.data.result);
        setSubmitted(true);

        if (res.data.result.passed) {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
          if (onBadgeEarned) onBadgeEarned();
        }
      }
    } catch (e) {
      console.error('Failed to submit assessment', e);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
        <div className="bg-[#16181A] border border-white/10 p-8 rounded-3xl text-center shadow-2xl">
          <div className="w-10 h-10 border-3 border-[#B6FF3B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-white">Loading Micro-Credential Assessment...</p>
        </div>
      </div>
    );
  }

  if (!assessment || !assessment.questions || assessment.questions.length === 0) {
    return null;
  }

  const currentQ = assessment.questions[currentIdx];
  const progressPercent = ((currentIdx + 1) / assessment.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#16181A] border border-white/10 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/8 bg-[#101211] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#B6FF3B]/10 border border-[#B6FF3B]/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-[#B6FF3B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#B6FF3B] uppercase tracking-wider">
                  {assessment.skill_name} Micro-Credential
                </span>
                <span className="text-xs text-[#9CA3A1]">• Pass: {assessment.pass_percentage}%</span>
              </div>
              <h3 className="text-sm font-bold text-white">{assessment.title}</h3>
            </div>
          </div>

          {!submitted ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10 transition-all"
            >
              Close
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {!submitted && (
          <div className="w-full bg-[#101211] h-1.5">
            <div
              className="bg-[#B6FF3B] h-full transition-all duration-300 shadow-sm shadow-[#B6FF3B]/50"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {!submitted ? (
            <div className="space-y-6">
              {/* Question Stepper Indicator */}
              <div className="flex items-center justify-between text-xs text-[#9CA3A1]">
                <span>
                  Question <strong className="text-white">{currentIdx + 1}</strong> of{' '}
                  <strong className="text-white">{assessment.questions.length}</strong>
                </span>
                <span>
                  Answered: <strong className="text-[#B6FF3B]">{answeredCount}</strong> / {assessment.questions.length}
                </span>
              </div>

              {/* Question Text */}
              <div className="p-5 rounded-2xl bg-[#101211] border border-white/8">
                <h4 className="text-base font-bold text-white leading-relaxed">{currentQ.question}</h4>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = answers[currentQ.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`w-full text-left p-4 rounded-xl border text-xs font-medium transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] text-white shadow-lg shadow-[#B6FF3B]/5 ring-1 ring-[#B6FF3B]'
                          : 'bg-[#101211] hover:bg-white/5 border-white/8 text-[#9CA3A1] hover:border-white/20'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0 ${
                          isSelected ? 'bg-[#B6FF3B] border-[#B6FF3B] text-[#0B0D0C]' : 'border-white/20 text-[#9CA3A1]'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="leading-relaxed flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="space-y-6 animate-in zoom-in-95">
              {/* Result Banner */}
              <div
                className={`p-6 rounded-2xl border text-center ${
                  result.passed
                    ? 'bg-[#B6FF3B]/10 border-[#B6FF3B]/40 text-[#B6FF3B]'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center bg-[#101211] border border-white/10 shadow-lg">
                  {result.passed ? (
                    <Award className="w-8 h-8 text-[#B6FF3B] animate-bounce" />
                  ) : (
                    <XCircle className="w-8 h-8 text-rose-500" />
                  )}
                </div>

                <h3 className="text-xl font-extrabold text-white mb-1">
                  {result.passed ? '🎉 Congratulations! Assessment Passed!' : 'Assessment Not Passed'}
                </h3>
                <p className="text-xs text-[#9CA3A1] max-w-md mx-auto mb-4 leading-relaxed">
                  {result.passed
                    ? `You scored ${result.score_percentage}% (Required: ${result.pass_percentage}%). A tamper-proof digital micro-credential badge has been cryptographically generated and added to your profile!`
                    : `You scored ${result.score_percentage}% (Required: ${result.pass_percentage}%). Review the questions below, practice via the Skill Gap Roadmap, and re-attempt.`}
                </p>

                <div className="inline-flex items-center gap-6 px-6 py-2.5 rounded-2xl bg-[#101211] border border-white/10 shadow-xl text-xs">
                  <div>
                    <span className="text-[#6B7280] block text-[10px] uppercase font-semibold">Your Score</span>
                    <span className="text-lg font-black text-white">{result.score_percentage}%</span>
                  </div>
                  <div className="h-6 w-px bg-white/10" />
                  <div>
                    <span className="text-[#6B7280] block text-[10px] uppercase font-semibold">Correct</span>
                    <span className="text-lg font-black text-[#B6FF3B]">
                      {result.correct_count} / {result.total_questions}
                    </span>
                  </div>
                  {result.badge && (
                    <>
                      <div className="h-6 w-px bg-white/10" />
                      <div>
                        <span className="text-[#6B7280] block text-[10px] uppercase font-semibold">Badge Code</span>
                        <span className="text-xs font-mono font-bold text-amber-400">{result.badge.badge_code}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Question Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Detailed Answer Breakdown
                </h4>
                <div className="space-y-3">
                  {result.breakdown.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border text-xs space-y-2 ${
                        item.is_correct
                          ? 'bg-[#B6FF3B]/5 border-[#B6FF3B]/20'
                          : 'bg-rose-500/5 border-rose-500/20'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {item.is_correct ? (
                          <CheckCircle2 className="w-4 h-4 text-[#B6FF3B] shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-bold text-white">
                            {idx + 1}. {item.question}
                          </p>
                          <p className="text-[#9CA3A1] text-[11px] mt-1">
                            Your answer:{' '}
                            <span className={item.is_correct ? 'text-[#B6FF3B] font-semibold' : 'text-rose-400 line-through'}>
                              {item.user_selected >= 0 ? item.options[item.user_selected] : 'None (Skipped)'}
                            </span>
                          </p>
                          {!item.is_correct && (
                            <p className="text-[#B6FF3B] text-[11px] font-semibold mt-0.5">
                              Correct answer: {item.options[item.correct_index]}
                            </p>
                          )}
                          <p className="text-[#9CA3A1] text-[11px] mt-1.5 bg-[#101211] p-2.5 rounded-lg border border-white/5">
                            💡 {item.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-white/8 bg-[#101211] flex items-center justify-between">
          {!submitted ? (
            <>
              <button
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-40 text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {currentIdx < assessment.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIdx(prev => Math.min(assessment.questions!.length - 1, prev + 1))}
                    className="px-5 py-2 rounded-full bg-[#B6FF3B] hover:bg-[#C6FF5A] text-[#0B0D0C] text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#B6FF3B]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2 rounded-full bg-[#B6FF3B] hover:bg-[#C6FF5A] text-[#0B0D0C] text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#B6FF3B]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{submitting ? 'Evaluating...' : 'Submit & Verify Badge'}</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-full bg-[#B6FF3B] hover:bg-[#C6FF5A] text-[#0B0D0C] text-xs font-bold shadow-lg shadow-[#B6FF3B]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


