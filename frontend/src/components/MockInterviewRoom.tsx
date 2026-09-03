import React, { useState, useEffect } from 'react';
import { interviewAPI } from '../services/api.js';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Bot,
  User,
  ArrowRight,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

export const MockInterviewRoom: React.FC = () => {
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState('Full Stack Web Developer');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Intermediate');
  const [started, setStarted] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  const [userAnswerText, setUserAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const [evaluating, setEvaluating] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<any>(null);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'ai' | 'user'; text: string; evaluation?: any }>>([]);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
    }
  }, []);

  const startSession = async () => {
    try {
      setLoadingQuestions(true);
      const res = await interviewAPI.getQuestions(selectedRole, selectedDifficulty);
      if (res.data.success && res.data.questions.length > 0) {
        setQuestions(res.data.questions);
        setStarted(true);
        setCurrentQIndex(0);
        setChatHistory([
          {
            role: 'ai',
            text: `Welcome to your AI Mock Interview for the ${selectedRole} position (${selectedDifficulty} level). Let's begin with your first question:\n\n"${res.data.questions[0].question}"`
          }
        ]);
        speakText(res.data.questions[0].question);
      }
    } catch (e) {
      console.error('Failed to start interview', e);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const speakText = (text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const toggleSpeechRecognition = () => {
    if (!speechSupported) {
      alert('Speech Recognition is not supported in this browser. Please type your answer.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    if (isRecording) {
      setIsRecording(false);
      recognition.stop();
      return;
    }

    setIsRecording(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setUserAnswerText(prev => (prev ? `${prev} ${transcript}` : transcript));
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };
  };

  const handleEvaluateAnswer = async () => {
    if (!userAnswerText.trim() || evaluating) return;
    const currentQ = questions[currentQIndex];
    setEvaluating(true);

    try {
      const res = await interviewAPI.evaluateAnswer(currentQ.question, userAnswerText, currentQ.expected_keywords);
      if (res.data.success) {
        const evalData = res.data.evaluation;
        setCurrentEvaluation(evalData);

        const newHistory = [
          ...chatHistory,
          { role: 'user' as const, text: userAnswerText, evaluation: evalData }
        ];

        setChatHistory(newHistory);
        setUserAnswerText('');

        if (currentQIndex < questions.length - 1) {
          const nextIdx = currentQIndex + 1;
          const nextQ = questions[nextIdx];
          setTimeout(() => {
            setCurrentQIndex(nextIdx);
            setChatHistory(prev => [
              ...prev,
              { role: 'ai', text: `Great answer! Here is Question ${nextIdx + 1}:\n\n"${nextQ.question}"` }
            ]);
            speakText(nextQ.question);
          }, 2000);
        } else {
          setSessionCompleted(true);
        }
      }
    } catch (e) {
      console.error('Evaluation failed', e);
    } finally {
      setEvaluating(false);
    }
  };

  const handleSaveSession = async () => {
    setSaving(true);
    try {
      const allScores = chatHistory
        .filter(c => c.evaluation)
        .map(c => c.evaluation.overall_score);
      const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 80;

      await interviewAPI.saveSession({
        target_role: selectedRole,
        difficulty: selectedDifficulty,
        overall_score: avgScore,
        feedback: currentEvaluation || {},
        conversation_log: chatHistory
      });
      setSaveSuccess(true);
    } catch (e) {
      console.error('Failed to save session', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session Header / Setup */}
      {!started ? (
        <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 rounded-3xl border border-slate-800 p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 p-[2px] mx-auto shadow-xl shadow-rose-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <BrainCircuit className="w-8 h-8 text-rose-400" />
            </div>
          </div>

          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-black text-white">{t('interview_title')}</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{t('interview_subtitle')}</p>
          </div>

          {/* Configuration Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Target Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option>Full Stack Web Developer</option>
                <option>Frontend Engineer (React)</option>
                <option>Backend Engineer (Python/Node)</option>
                <option>Junior Data Analyst</option>
                <option>AI / Machine Learning Engineer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Difficulty Tier
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option>Junior / Entry-Level</option>
                <option>Intermediate</option>
                <option>Senior / Staff Level</option>
              </select>
            </div>
          </div>

          <button
            onClick={startSession}
            disabled={loadingQuestions}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white text-sm font-black shadow-xl shadow-indigo-500/25 transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{loadingQuestions ? 'Preparing Interview Room...' : 'Start AI Interview Session'}</span>
          </button>
        </div>
      ) : (
        /* Active Interview Simulator */
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
          {/* Top Status Bar */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{selectedRole} Interview Room</p>
                <p className="text-[10px] text-slate-400">
                  Question {currentQIndex + 1} of {questions.length} • {selectedDifficulty}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTtsEnabled(!ttsEnabled)}
                title="Toggle AI Speech"
                className={`p-2 rounded-xl text-xs border transition-all ${
                  ttsEnabled ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
              >
                {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setStarted(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                End Session
              </button>
            </div>
          </div>

          {/* Chat Transcript Area */}
          <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto bg-slate-950/40">
            {chatHistory.map((item, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {item.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-rose-400" />
                  </div>
                )}
                <div
                  className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                    item.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-950'
                      : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{item.text}</p>
                </div>
                {item.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-indigo-300" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Real-Time AI Scorecard (if last evaluation available) */}
          {currentEvaluation && (
            <div className="p-4 bg-slate-850 border-t border-b border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Real-Time Feedback
                </span>
                <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                  {currentEvaluation.overall_score}% Evaluation Score
                </span>
              </div>

              {/* 4 Metrics Progress */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Clarity</span>
                  <span className="text-sm font-bold text-white">{currentEvaluation.clarity_score}%</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Technical Depth</span>
                  <span className="text-sm font-bold text-indigo-400">
                    {currentEvaluation.technical_relevance_score}%
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Completeness</span>
                  <span className="text-sm font-bold text-cyan-400">{currentEvaluation.completeness_score}%</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">STAR Method</span>
                  <span className="text-sm font-bold text-amber-400">{currentEvaluation.star_alignment_score}%</span>
                </div>
              </div>

              {/* Coaching Tip */}
              <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                💡 <strong className="text-indigo-300">Coaching Tip:</strong> {currentEvaluation.actionable_tip}
              </p>
            </div>
          )}

          {/* User Input Controls */}
          {!sessionCompleted ? (
            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
              <textarea
                value={userAnswerText}
                onChange={(e) => setUserAnswerText(e.target.value)}
                placeholder="Type your structured answer here, or click the mic button to speak..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={toggleSpeechRecognition}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                    isRecording
                      ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-rose-400" />}
                  <span>{isRecording ? 'Listening... Click to Stop' : t('btn_record_voice')}</span>
                </button>

                <button
                  onClick={handleEvaluateAnswer}
                  disabled={evaluating || !userAnswerText.trim()}
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{evaluating ? 'Analyzing Speech & Content...' : t('btn_submit_answer')}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Completed Session Card */
            <div className="p-6 bg-slate-950 border-t border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <Award className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Mock Interview Practice Completed!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  You have successfully answered all role-specific simulation questions.
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={handleSaveSession}
                  disabled={saving || saveSuccess}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{saveSuccess ? 'Session Saved to Profile!' : saving ? 'Saving...' : 'Save Session Record'}</span>
                </button>
                <button
                  onClick={() => setStarted(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  New Session
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
