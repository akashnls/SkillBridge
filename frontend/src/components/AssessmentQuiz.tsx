import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Assessment, AssessmentQuestion, VerifiableBadge } from '../types/index.js';
import { assessmentsAPI } from '../services/api.js';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ArrowRight
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
          // Trigger celebration confetti
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">Loading Micro-Credential Assessment...</p>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  {assessment.skill_name} Micro-Credential
                </span>
                <span className="text-xs text-slate-400">• Pass: {assessment.pass_percentage}%</span>
              </div>
              <h3 className="text-sm font-bold text-white">{assessment.title}</h3>
            </div>
          </div>

          {!submitted ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-amber-300">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              Close
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {!submitted && (
          <div className="w-full bg-slate-800 h-1.5">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {!submitted ? (
            <div className="space-y-6">
              {/* Question Stepper Indicator */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Question <strong className="text-white">{currentIdx + 1}</strong> of{' '}
                  <strong className="text-white">{assessment.questions.length}</strong>
                </span>
                <span>
                  Answered: <strong className="text-indigo-400">{answeredCount}</strong> / {assessment.questions.length}
                </span>
              </div>

              {/* Question Text */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
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
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500'
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0 ${
                          isSelected ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-slate-600 text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="leading-relaxed">{opt}</span>
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
                    ? 'bg-gradient-to-b from-emerald-950/60 to-slate-900 border-emerald-500/60 text-emerald-200'
                    : 'bg-gradient-to-b from-rose-950/60 to-slate-900 border-rose-500/60 text-rose-200'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-slate-900/80 border border-slate-700 shadow-xl">
                  {result.passed ? (
                    <Award className="w-8 h-8 text-amber-400 animate-bounce" />
                  ) : (
                    <XCircle className="w-8 h-8 text-rose-400" />
                  )}
                </div>

                <h3 className="text-xl font-black text-white mb-1">
                  {result.passed ? '🎉 Congratulations! Assessment Passed!' : 'Assessment Not Passed'}
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto mb-4">
                  {result.passed
                    ? `You scored ${result.score_percentage}% (Required: ${result.pass_percentage}%). A tamper-proof digital micro-credential badge has been cryptographically generated and added to your profile!`
                    : `You scored ${result.score_percentage}% (Required: ${result.pass_percentage}%). Review the questions below, practice via the Skill Gap Roadmap, and re-attempt.`}
                </p>

                <div className="inline-flex items-center gap-6 px-6 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Your Score</span>
                    <span className="text-lg font-black text-white">{result.score_percentage}%</span>
                  </div>
                  <div className="h-6 w-px bg-slate-800" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Correct</span>
                    <span className="text-lg font-black text-emerald-400">
                      {result.correct_count} / {result.total_questions}
                    </span>
                  </div>
                  {result.badge && (
                    <>
                      <div className="h-6 w-px bg-slate-800" />
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Badge Code</span>
                        <span className="text-xs font-mono font-bold text-amber-400">{result.badge.badge_code}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Question Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Detailed Answer Breakdown
                </h4>
                <div className="space-y-3">
                  {result.breakdown.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border text-xs space-y-2 ${
                        item.is_correct
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-rose-950/20 border-rose-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {item.is_correct ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-bold text-white">
                            {idx + 1}. {item.question}
                          </p>
                          <p className="text-slate-400 text-[11px] mt-1">
                            Your answer:{' '}
                            <span className={item.is_correct ? 'text-emerald-400 font-semibold' : 'text-rose-400 line-through'}>
                              {item.user_selected >= 0 ? item.options[item.user_selected] : 'None (Skipped)'}
                            </span>
                          </p>
                          {!item.is_correct && (
                            <p className="text-emerald-400 text-[11px] font-semibold mt-0.5">
                              Correct answer: {item.options[item.correct_index]}
                            </p>
                          )}
                          <p className="text-indigo-300 text-[11px] mt-1.5 bg-slate-900/60 p-2 rounded border border-slate-800">
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
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          {!submitted ? (
            <>
              <button
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {currentIdx < assessment.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIdx(prev => Math.min(assessment.questions!.length - 1, prev + 1))}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 transition-all"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all"
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
                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all"
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
