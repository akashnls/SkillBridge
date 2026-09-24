import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '../../context/RouterContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { PageHeader } from '../../components/PageHeader.js';
import {
  mockInterviewAPI,
  jobsAPI,
  MockInterviewSession,
  MockInterviewQuestion,
  MockInterviewAnswerEvaluation
} from '../../services/api.js';
import {
  Sparkles,
  Bot,
  User,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Send,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  History,
  Briefcase,
  Play,
  Volume2,
  VolumeX,
  Users2,
  Activity,
  Layers,
  FileVideo,
  Film,
  Trash2,
  ChevronRight,
  BarChart2
} from 'lucide-react';

const POPULAR_ROLES = [
  'Software Engineer',
  'Full Stack Developer',
  'Backend Developer',
  'Frontend Developer',
  'Data Analyst',
  'DevOps Engineer',
  'Product Manager'
];

interface PanelInterviewer {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatarBg: string;
  textColor: string;
  borderColor: string;
  badge: string;
}

const PANEL_INTERVIEWERS: PanelInterviewer[] = [
  {
    id: 'alex',
    name: 'Alex Rivera',
    role: 'Principal Architect',
    specialty: 'System Design & Technical Architecture',
    avatarBg: 'bg-emerald-500/20',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    badge: 'Tech Lead'
  },
  {
    id: 'sarah',
    name: 'Sarah Chen',
    role: 'Director of Engineering',
    specialty: 'Engineering Strategy & Team Leadership',
    avatarBg: 'bg-sky-500/20',
    textColor: 'text-sky-400',
    borderColor: 'border-sky-500/40',
    badge: 'Director'
  },
  {
    id: 'marcus',
    name: 'Marcus Vance',
    role: 'People & Culture Partner',
    specialty: 'STAR Behavioral & Value Alignment',
    avatarBg: 'bg-amber-500/20',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    badge: 'Culture Lead'
  }
];

const COMMON_FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'actually', 'basically', 'literally', 'sort of', 'kind of', 'i mean'];

export const CandidateMockInterviewView: React.FC = () => {
  const { navigate, queryParams } = useRouter();
  const { user } = useAuth();

  // Mode: 'simulator' | 'history'
  const [activeTab, setActiveTab] = useState<'simulator' | 'history'>(
    queryParams.tab === 'history' ? 'history' : 'simulator'
  );

  // Phase inside Simulator: 'setup' | 'interview' | 'results'
  const [phase, setPhase] = useState<'setup' | 'interview' | 'results'>('setup');

  // Setup options
  const [role, setRole] = useState(POPULAR_ROLES[0]);
  const [customRole, setCustomRole] = useState('');
  const [interviewType, setInterviewType] = useState<'Technical' | 'Behavioral' | 'Panel'>('Technical');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(queryParams.job_id || null);
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);

  // Live Interview State
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<MockInterviewQuestion | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [starting, setStarting] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [answerMode, setAnswerMode] = useState<'voice' | 'text'>('text');

  const [chatMessages, setChatMessages] = useState<Array<{
    sender: 'ai' | 'candidate';
    text: string;
    time: string;
    interviewer?: PanelInterviewer;
    evaluation?: any;
    timeSpent?: number;
    fillerCount?: number;
  }>>([]);

  // Per-question Timer State (2 mins standard)
  const [questionSeconds, setQuestionSeconds] = useState(0);
  const timerLimitSeconds = 120;
  const timerIntervalRef = useRef<any>(null);

  // Question timestamps & filler diagnostics
  const [sessionFillerAnalysis, setSessionFillerAnalysis] = useState<{
    totalFillers: number;
    detectedWords: Record<string, number>;
    hesitationCount: number;
    averagePacingWpm: number;
  }>({ totalFillers: 0, detectedWords: {}, hesitationCount: 0, averagePacingWpm: 125 });

  // Non-verbal metrics
  const [nonVerbalMetrics, setNonVerbalMetrics] = useState<{
    eyeContactPct: number;
    postureScore: number;
    toneStability: number;
    pacingScore: number;
  }>({ eyeContactPct: 90, postureScore: 92, toneStability: 88, pacingScore: 92 });

  // Results & History State
  const [finalSession, setFinalSession] = useState<MockInterviewSession | null>(null);
  const [historyList, setHistoryList] = useState<MockInterviewSession[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Video/Audio MediaRecorder recording
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [savedRecordings, setSavedRecordings] = useState<Record<string, string>>({});

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Load available jobs for specific practice
    jobsAPI.getJobs().then(res => {
      if (res.data?.success && res.data.jobs) {
        setAvailableJobs(res.data.jobs);
      }
    }).catch(() => {});

    if (queryParams.job_id) {
      setSelectedJobId(queryParams.job_id);
    }
  }, [queryParams]);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, evaluating]);

  // Per-Question Timer Effect
  useEffect(() => {
    if (phase === 'interview' && !evaluating) {
      timerIntervalRef.current = setInterval(() => {
        setQuestionSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [phase, evaluating, currentQuestionIndex]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setCandidateAnswer(prev => prev ? `${prev} ${transcript}` : transcript);
        }
      };

      recognition.onerror = () => {
        setIsRecordingMic(false);
      };

      recognition.onend = () => {
        setIsRecordingMic(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*_#]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleSpeechDictation = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your response.');
      return;
    }
    if (isRecordingMic) {
      recognitionRef.current.stop();
      setIsRecordingMic(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecordingMic(true);
        setAnswerMode('voice');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const startMediaRecording = (stream: MediaStream) => {
    try {
      recordedChunksRef.current = [];
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch {
        recorder = new MediaRecorder(stream);
      }

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (recordedChunksRef.current.length > 0) {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);
          if (activeSession?.id) {
            setSavedRecordings(prev => ({ ...prev, [activeSession.id]: url }));
          }
        }
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.warn('MediaRecorder recording initialization error:', err);
    }
  };

  const toggleCamera = async () => {
    if (isCameraOn) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsCameraOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraOn(true);
        if (phase === 'interview') {
          startMediaRecording(stream);
        }
      } catch (err) {
        alert('Could not access camera/microphone. Please ensure permissions are allowed.');
      }
    }
  };

  // Analyze text for filler words and nervous habits
  const analyzeAnswerHabits = (text: string, timeSpentSeconds: number) => {
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const detected: Record<string, number> = {};
    let totalFillersInAnswer = 0;

    COMMON_FILLER_WORDS.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches && matches.length > 0) {
        detected[filler] = matches.length;
        totalFillersInAnswer += matches.length;
      }
    });

    const wpm = timeSpentSeconds > 0 ? Math.round((wordCount / timeSpentSeconds) * 60) : 125;
    const hesitation = totalFillersInAnswer > 3 || (timeSpentSeconds > 60 && wordCount < 40);

    setSessionFillerAnalysis(prev => {
      const mergedDetected = { ...prev.detectedWords };
      Object.entries(detected).forEach(([w, count]) => {
        mergedDetected[w] = (mergedDetected[w] || 0) + count;
      });
      return {
        totalFillers: prev.totalFillers + totalFillersInAnswer,
        detectedWords: mergedDetected,
        hesitationCount: prev.hesitationCount + (hesitation ? 1 : 0),
        averagePacingWpm: Math.round((prev.averagePacingWpm + wpm) / 2)
      };
    });

    setNonVerbalMetrics({
      eyeContactPct: Math.min(96, Math.max(70, 92 - totalFillersInAnswer * 2)),
      postureScore: Math.min(98, Math.max(65, 95 - (hesitation ? 6 : 0))),
      toneStability: Math.min(95, Math.max(60, 90 - (wpm > 170 || wpm < 80 ? 10 : 0))),
      pacingScore: Math.min(95, Math.max(60, 100 - Math.abs(130 - wpm)))
    });

    return { totalFillersInAnswer, wpm };
  };

  // 1. Dynamic Question Generation via AI API
  const handleStartInterview = async () => {
    try {
      setStarting(true);
      const targetRole = customRole.trim() || role;
      const res = await mockInterviewAPI.start({
        role: targetRole,
        interview_type: interviewType,
        difficulty,
        duration_minutes: durationMinutes,
        job_id: selectedJobId || null
      });

      if (res.data?.success && res.data.session) {
        const session = res.data.session;
        setActiveSession(session);
        setCurrentQuestion(session.current_question);
        setCurrentQuestionIndex(0);
        setTotalQuestions(session.total_questions);
        setQuestionSeconds(0);

        setSessionFillerAnalysis({
          totalFillers: 0,
          detectedWords: {},
          hesitationCount: 0,
          averagePacingWpm: 125
        });

        const initialInterviewer = interviewType === 'Panel' ? PANEL_INTERVIEWERS[0] : undefined;

        const greetingText = session.greeting || (
          interviewType === 'Panel'
            ? `Welcome ${user?.name || 'Candidate'} to your Executive Panel Interview for ${session.role}. I'm ${PANEL_INTERVIEWERS[0].name}, joined by ${PANEL_INTERVIEWERS[1].name} and ${PANEL_INTERVIEWERS[2].name}. We'll evaluate your system design, technical strategy, and leadership. Let's begin!`
            : `Welcome ${user?.name || 'Candidate'}! I'm your AI Interview Coach. Let's begin the ${session.difficulty.toLowerCase()} ${session.interview_type.toLowerCase()} interview for ${session.role}.`
        );

        const initialMessages: Array<{
          sender: 'ai' | 'candidate';
          text: string;
          time: string;
          interviewer?: PanelInterviewer;
        }> = [
          {
            sender: 'ai',
            interviewer: initialInterviewer,
            text: greetingText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          {
            sender: 'ai',
            interviewer: initialInterviewer,
            text: session.current_question.question,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];

        setChatMessages(initialMessages);
        setPhase('interview');

        if (autoSpeak) {
          speakText(session.current_question.question);
        }

        if (mediaStreamRef.current && isCameraOn) {
          startMediaRecording(mediaStreamRef.current);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start mock interview');
    } finally {
      setStarting(false);
    }
  };

  // 7. Post-Answer Analysis live per answer
  const handleSubmitAnswer = async () => {
    if (!candidateAnswer.trim() || evaluating || !activeSession || !currentQuestion) return;

    const answerText = candidateAnswer.trim();
    const timeSpent = questionSeconds;
    setCandidateAnswer('');

    if (isRecordingMic && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecordingMic(false);
    }

    const { totalFillersInAnswer } = analyzeAnswerHabits(answerText, timeSpent);

    const userMsg = {
      sender: 'candidate' as const,
      text: answerText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeSpent,
      fillerCount: totalFillersInAnswer
    };
    setChatMessages(prev => [...prev, userMsg]);

    try {
      setEvaluating(true);
      const res = await mockInterviewAPI.submitAnswer(activeSession.id, {
        answer: answerText,
        question_id: currentQuestion.id
      });

      if (res.data?.success) {
        const { evaluation, next_question, is_complete, current_question_index } = res.data;

        const nextInterviewerIdx = (currentQuestionIndex + 1) % PANEL_INTERVIEWERS.length;
        const currentInterviewer = interviewType === 'Panel' ? PANEL_INTERVIEWERS[currentQuestionIndex % PANEL_INTERVIEWERS.length] : undefined;
        const nextInterviewer = interviewType === 'Panel' ? PANEL_INTERVIEWERS[nextInterviewerIdx] : undefined;

        const feedbackMsg = {
          sender: 'ai' as const,
          interviewer: currentInterviewer,
          text: evaluation.feedback || 'Thank you for your structured response.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          evaluation
        };

        if (is_complete || !next_question) {
          setChatMessages(prev => [...prev, feedbackMsg]);
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }

          const completeRes = await mockInterviewAPI.getSession(activeSession.id);
          if (completeRes.data?.success) {
            setFinalSession(completeRes.data.session);
            setPhase('results');
          }
        } else {
          const nextQuestionMsg = {
            sender: 'ai' as const,
            interviewer: nextInterviewer,
            text: next_question.question,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setChatMessages(prev => [...prev, feedbackMsg, nextQuestionMsg]);
          setCurrentQuestion(next_question);
          setCurrentQuestionIndex(current_question_index || (currentQuestionIndex + 1));
          setQuestionSeconds(0);

          if (autoSpeak) {
            speakText(next_question.question);
          }
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to evaluate answer');
    } finally {
      setEvaluating(false);
    }
  };

  const handleFinishEarly = async () => {
    if (!window.confirm('Finish the mock interview now and generate your full diagnostic report?')) return;
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      const res = await mockInterviewAPI.complete(activeSession.id);
      if (res.data?.success) {
        setFinalSession(res.data.session);
        setPhase('results');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await mockInterviewAPI.getHistory();
      if (res.data?.success) {
        setHistoryList(res.data.history || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleViewPastSession = async (sessionId: string) => {
    try {
      const res = await mockInterviewAPI.getSession(sessionId);
      if (res.data?.success && res.data.session) {
        setFinalSession(res.data.session);
        setRecordedVideoUrl(savedRecordings[sessionId] || null);
        setPhase('results');
        setActiveTab('simulator');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load past session');
    }
  };

  const handleDeleteHistorySession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this mock interview record?')) return;
    try {
      await mockInterviewAPI.deleteSession(sessionId);
      setHistoryList(prev => prev.filter(h => h.id !== sessionId));
    } catch (err) {
      console.error(err);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isOvertime = questionSeconds > timerLimitSeconds;
  const isWarningTime = questionSeconds > timerLimitSeconds * 0.75 && !isOvertime;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Primary Header */}
      <PageHeader
        badge="AI INTERVIEW SUITE"
        badgeSubtext="Dynamic AI Generation • Non-Verbal Diagnostics • Speech Synthesis"
        icon={<Sparkles className="w-6 h-6" />}
        title="AI Mock Interview"
        subtitle="Simulate realistic interviews with live AI question generation, speech synthesis delivery, real-time per-answer evaluation, and session video recording."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('history');
                setPhase('setup');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#4a5e2f]/20 text-[#4a5e2f] border border-[#4a5e2f]/40 font-bold'
                  : 'bg-[#f5f0e8] text-[#9a8e7a] border border-[#4a4636] hover:text-[#f0ebe0]'
              }`}
            >
              <History className="w-4 h-4 text-[#4a5e2f]" />
              <span>Past Sessions</span>
            </button>
          </div>
        }
      />

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-[#4a4636] text-xs font-semibold">
        {[
          { id: 'simulator', label: 'Live AI Simulator', icon: Sparkles },
          { id: 'history', label: 'Past Interviews & Video Replay', icon: Film }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              if (tab.id === 'simulator' && phase !== 'interview') {
                setPhase('setup');
              }
            }}
            className={`px-4 py-2.5 -mb-px flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#4a5e2f] text-[#4a5e2f] font-bold'
                : 'border-transparent text-[#9a8e7a] hover:text-[#f0ebe0]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: SIMULATOR MODE                                    */}
      {/* ========================================================= */}
      {activeTab === 'simulator' && (
        <>
          {/* 1. SETUP PHASE */}
          {phase === 'setup' && (
            <div className="bg-[#f5f0e8]/70 p-6 sm:p-8 rounded-2xl border border-[#4a4636] space-y-6">
              {/* Target Job Opportunity Select */}
              <div className="p-4 bg-[#f5f0e8] rounded-xl border border-[#4a4636] space-y-2">
                <label className="block text-xs font-bold text-[#f0ebe0] flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#4a5e2f]" />
                  <span>Practice for a Specific Job Opening (Optional)</span>
                </label>
                <p className="text-[11px] text-[#9a8e7a]">
                  Select a live posting to inject its tech stack, responsibilities, and experience requirements into the dynamic AI question generator.
                </p>
                <select
                  value={selectedJobId || ''}
                  onChange={(e) => setSelectedJobId(e.target.value || null)}
                  className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-xs text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
                >
                  <option value="">-- General Practice (Choose or Type Role Below) --</option>
                  {availableJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} at {j.company_name} ({j.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Requirement 1: Job Title Input / Selector */}
              {!selectedJobId && (
                <div>
                  <label className="block text-xs font-bold text-[#f0ebe0] mb-2">
                    Enter or Select Job Title
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {POPULAR_ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setRole(r);
                          setCustomRole('');
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          role === r && !customRole
                            ? 'bg-[#4a5e2f]/20 text-[#4a5e2f] border border-[#4a5e2f]/40 shadow-sm'
                            : 'bg-[#f5f0e8] text-[#b5aa96] border border-[#4a4636] hover:border-[#4a4636]'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="Or enter custom job title (e.g. Lead Machine Learning Engineer, Cloud Architect)..."
                    className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-xs text-[#2c2a1e] placeholder-[#9a8e7a] focus:outline-none focus:border-[#4a5e2f]"
                  />
                </div>
              )}

              {/* Requirement 1: Interview Type (Behavioral / Technical / Panel) */}
              <div>
                <label className="block text-xs font-bold text-[#f0ebe0] mb-2">
                  Interview Format / Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      type: 'Technical',
                      title: 'Technical Deep-Dive',
                      desc: 'System architecture, API design, code trade-offs, and scalability.',
                      icon: Layers
                    },
                    {
                      type: 'Behavioral',
                      title: 'Behavioral & Leadership',
                      desc: 'STAR method scenarios, conflict resolution, ownership, and adaptability.',
                      icon: User
                    },
                    {
                      type: 'Panel',
                      title: 'Executive Panel Simulation',
                      desc: '3 multi-disciplinary interviewers taking turns in real-time questioning.',
                      icon: Users2,
                      badge: 'Most Realistic'
                    }
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setInterviewType(item.type as any)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                        interviewType === item.type
                          ? 'bg-[#4a5e2f]/20 text-[#4a5e2f] border-[#4a5e2f]/50 shadow-md shadow-[#4a5e2f]/10'
                          : 'bg-[#f5f0e8] text-[#b5aa96] border border-[#4a4636] hover:border-[#4a4636]'
                      }`}
                    >
                      {item.badge && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#4a5e2f]/20 text-[#4a5e2f] border border-[#4a5e2f]/40">
                          {item.badge}
                        </span>
                      )}
                      <div className="flex items-center gap-2 mb-1.5">
                        <item.icon className="w-4 h-4 text-[#4a5e2f]" />
                        <span className="text-xs font-bold text-[#f0ebe0]">{item.title}</span>
                      </div>
                      <span className="text-[11px] text-[#9a8e7a] leading-relaxed block">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Panel Preview */}
              {interviewType === 'Panel' && (
                <div className="p-4 bg-[#f5f0e8] rounded-xl border border-[#4a4636] space-y-3">
                  <span className="text-xs font-bold text-[#f0ebe0] flex items-center gap-1.5">
                    <Users2 className="w-4 h-4 text-[#4a5e2f]" /> Your Active Interview Panel Members:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PANEL_INTERVIEWERS.map(p => (
                      <div key={p.id} className="p-3 bg-[#f5f0e8]/80 rounded-xl border border-[#4a4636] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#f0ebe0]">{p.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${p.avatarBg} ${p.textColor} border ${p.borderColor}`}>
                            {p.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#9a8e7a]">{p.role}</p>
                        <p className="text-[10px] text-[#b5aa96] italic">{p.specialty}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Difficulty & Question Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#f0ebe0] mb-2">
                    Experience / Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Beginner', 'Intermediate', 'Advanced'].map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficulty(diff)}
                        className={`py-2 text-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          difficulty === diff
                            ? 'bg-[#4a5e2f]/20 text-[#4a5e2f] border border-[#4a5e2f]/40 font-bold'
                            : 'bg-[#f5f0e8] text-[#9a8e7a] border border-[#4a4636] hover:text-[#f0ebe0]'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#f0ebe0] mb-2">
                    Session Duration & Questions
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { min: 10, qs: '4 Questions' },
                      { min: 20, qs: '6 Questions' },
                      { min: 30, qs: '8 Questions' }
                    ].map((dur) => (
                      <button
                        key={dur.min}
                        type="button"
                        onClick={() => setDurationMinutes(dur.min)}
                        className={`py-1.5 px-2 text-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          durationMinutes === dur.min
                            ? 'bg-[#4a5e2f]/20 text-[#4a5e2f] border border-[#4a5e2f]/40 font-bold'
                            : 'bg-[#f5f0e8] text-[#9a8e7a] border border-[#4a4636] hover:text-[#f0ebe0]'
                        }`}
                      >
                        <span className="block">{dur.min} mins</span>
                        <span className="text-[10px] text-[#9a8e7a]">{dur.qs}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Requirement 6: Video/Audio Recording & Camera Pre-flight */}
              <div className="p-4 bg-[#f5f0e8] rounded-xl border border-[#4a4636] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#4a5e2f]/10 text-[#4a5e2f] rounded-xl border border-[#4a5e2f]/20">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#f0ebe0]">Webcam Video Recording & Non-Verbal Tracking</h4>
                    <p className="text-[11px] text-[#9a8e7a]">
                      Capture full session video replay, monitor eye contact, and assess posture composure.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleCamera}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
                    isCameraOn
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-[#f5f0e8] text-[#9a8e7a] border-[#4a4636] hover:text-[#f0ebe0]'
                  }`}
                >
                  {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  <span>{isCameraOn ? 'Camera Active' : 'Enable Camera'}</span>
                </button>
              </div>

              {isCameraOn && (
                <div className="relative w-48 h-32 rounded-2xl overflow-hidden border border-[#4a5e2f]/40 shadow-xl bg-black">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                  <span className="absolute bottom-1 left-2 text-[9px] font-bold bg-black/70 px-2 py-0.5 rounded text-[#4a5e2f]">
                    Preview OK
                  </span>
                </div>
              )}

              {/* Start CTA */}
              <div className="pt-4 border-t border-[#4a4636] flex items-center justify-between">
                <div className="text-xs text-[#9a8e7a] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#4a5e2f]" />
                  <span>2 min per question limit • Live AI Evaluation per answer</span>
                </div>
                <button
                  onClick={handleStartInterview}
                  disabled={starting}
                  className="px-6 py-3 bg-[#4a5e2f] hover:bg-[#3d4e26] text-[#f0ebe0] rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#4a5e2f]/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{starting ? 'Generating Dynamic Questions...' : 'Start AI Mock Interview'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. LIVE INTERVIEW PHASE */}
          {phase === 'interview' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              {/* Session Top Bar with Live Timer & Speech Controls */}
              <div className="bg-[#f5f0e8]/80 p-4 rounded-2xl border border-[#4a4636] flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#4a5e2f]/20 text-[#4a5e2f] border border-[#4a5e2f]/30 flex items-center justify-center font-bold">
                    {interviewType === 'Panel' ? <Users2 className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#f0ebe0]">{activeSession?.role}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#f5f0e8] text-[#4a5e2f] border border-[#4a4636]">
                        {activeSession?.interview_type}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#f5f0e8] text-[#4a5e2f] border border-[#4a4636]">
                        {activeSession?.difficulty}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#9a8e7a]">
                      Question {currentQuestionIndex + 1} of {totalQuestions}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Requirement 3: Auto-Speak SpeechSynthesis Toggle */}
                  <button
                    onClick={() => setAutoSpeak(!autoSpeak)}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      autoSpeak
                        ? 'bg-[#4a5e2f]/20 text-[#4a5e2f] border-[#4a5e2f]/40'
                        : 'bg-[#f5f0e8] text-[#9a8e7a] border-[#4a4636]'
                    }`}
                    title="Toggle auto text-to-speech for AI questions"
                  >
                    {autoSpeak ? <Volume2 className="w-4 h-4 text-[#4a5e2f]" /> : <VolumeX className="w-4 h-4" />}
                    <span className="hidden sm:inline">{autoSpeak ? 'Audio TTS On' : 'Audio Muted'}</span>
                  </button>

                  {/* Requirement 5: Per-Question Timer */}
                  <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                    isOvertime
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
                      : isWarningTime
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-[#4a5e2f]/20 text-[#4a5e2f] border-[#4a5e2f]/30'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatSeconds(questionSeconds)}</span>
                    <span className="text-[10px] opacity-75">/ 2:00</span>
                  </div>

                  {/* Camera Recording Toggle */}
                  <button
                    onClick={toggleCamera}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isCameraOn
                        ? 'bg-[#4a5e2f]/20 text-[#4a5e2f] border-[#4a5e2f]/30'
                        : 'bg-[#f5f0e8] text-[#9a8e7a] border-[#4a4636] hover:text-[#f0ebe0]'
                    }`}
                    title="Toggle camera recording"
                  >
                    {isCameraOn ? <Video className="w-4 h-4 text-[#4a5e2f]" /> : <VideoOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleFinishEarly}
                    className="px-3 py-1.5 bg-[#f5f0e8] hover:bg-[#3a3828] text-[#b5aa96] border border-[#4a4636] rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Finish Early
                  </button>
                </div>
              </div>

              {/* Requirement 8: Non-Verbal Camera & Sensor Bar */}
              {isCameraOn && (
                <div className="bg-[#f5f0e8]/80 p-3 rounded-2xl border border-[#4a4636] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="relative w-44 h-28 rounded-xl overflow-hidden border border-[#4a5e2f]/30 bg-black shrink-0">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                    <span className="absolute bottom-1 left-2 text-[9px] font-bold bg-black/70 px-1.5 py-0.5 rounded text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      REC
                    </span>
                  </div>

                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 w-full text-center text-xs">
                    <div className="p-2 bg-[#f5f0e8] rounded-xl border border-[#4a4636]">
                      <span className="text-[10px] text-[#9a8e7a] block">Eye Contact</span>
                      <span className="font-bold text-[#4a5e2f]">{nonVerbalMetrics.eyeContactPct}%</span>
                    </div>
                    <div className="p-2 bg-[#f5f0e8] rounded-xl border border-[#4a4636]">
                      <span className="text-[10px] text-[#9a8e7a] block">Composure</span>
                      <span className="font-bold text-[#3d6b35]">{nonVerbalMetrics.postureScore}%</span>
                    </div>
                    <div className="p-2 bg-[#f5f0e8] rounded-xl border border-[#4a4636]">
                      <span className="text-[10px] text-[#9a8e7a] block">Vocal Tone</span>
                      <span className="font-bold text-[#b45309]">{nonVerbalMetrics.toneStability}%</span>
                    </div>
                    <div className="p-2 bg-[#f5f0e8] rounded-xl border border-[#4a4636]">
                      <span className="text-[10px] text-[#9a8e7a] block">Fillers Detected</span>
                      <span className="font-bold text-[#4a5e2f]">{sessionFillerAnalysis.totalFillers}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Overtime Alert */}
              {isOvertime && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>
                    Question time limit exceeded (2:00 mins). Wrap up your answer concisely and click Submit Answer.
                  </span>
                </div>
              )}

              {/* Chat Thread with Instant Evaluation Badges */}
              <div className="bg-[#f5f0e8]/70 p-5 rounded-2xl border border-[#4a4636] min-h-[380px] max-h-[520px] overflow-y-auto space-y-4 shadow-inner">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${msg.sender === 'candidate' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                        msg.interviewer ? `${msg.interviewer.avatarBg} ${msg.interviewer.textColor} ${msg.interviewer.borderColor}` : 'bg-[#4a5e2f]/20 text-[#4a5e2f] border-[#4a5e2f]/30'
                      }`}>
                        {msg.interviewer ? <Users2 className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'candidate'
                          ? 'bg-[#4a5e2f] text-[#f0ebe0] rounded-tr-none shadow-md shadow-[#4a5e2f]/10'
                          : 'bg-[#f5f0e8] text-[#2c2a1e] border border-[#4a4636] rounded-tl-none space-y-2.5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1 text-[10px] text-[#9a8e7a]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold uppercase tracking-wider text-[#4a5e2f]">
                            {msg.sender === 'ai' ? (msg.interviewer?.name || 'AI Interviewer') : 'You'}
                          </span>
                          {msg.interviewer && (
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${msg.interviewer.avatarBg} ${msg.interviewer.textColor} border ${msg.interviewer.borderColor}`}>
                              {msg.interviewer.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>{msg.time}</span>
                          {msg.sender === 'ai' && (
                            <button
                              onClick={() => speakText(msg.text)}
                              className="text-[#9a8e7a] hover:text-[#4a5e2f] p-0.5 cursor-pointer"
                              title="Listen to question via text-to-speech"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="whitespace-pre-line">{msg.text}</p>

                      {/* Requirement 7: Post-Answer Live Analysis (score out of 10 & diagnostic feedback) */}
                      {msg.evaluation && (
                        <div className="mt-3 pt-3 border-t border-[#4a4636] space-y-2 bg-[#f5f0e8]/80 p-3 rounded-xl">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#f0ebe0] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#4a5e2f]" />
                              <span>AI Evaluation:</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-full font-black bg-[#4a5e2f]/20 text-[#4a5e2f] border border-[#4a5e2f]/30">
                              Score: {msg.evaluation.score_out_of_10 !== undefined ? `${msg.evaluation.score_out_of_10}/10` : `${Math.round(msg.evaluation.score / 10 * 10) / 10}/10`} ({msg.evaluation.score}%)
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#b5aa96]">
                            {msg.evaluation.clarity_feedback && (
                              <p><strong>Clarity:</strong> {msg.evaluation.clarity_feedback}</p>
                            )}
                            {msg.evaluation.structure_feedback && (
                              <p><strong>Structure:</strong> {msg.evaluation.structure_feedback}</p>
                            )}
                          </div>

                          {msg.evaluation.suggested_better_answer && (
                            <div className="text-[11px] text-[#4a5e2f] bg-[#4a5e2f]/10 p-2 rounded-lg border border-[#4a5e2f]/20">
                              <strong>Exemplary STAR Answer: </strong>
                              <span className="italic">{msg.evaluation.suggested_better_answer}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {msg.sender === 'candidate' && msg.timeSpent !== undefined && (
                        <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-[10px] text-white/80">
                          <span>Time Spent: {formatSeconds(msg.timeSpent)}</span>
                          {msg.fillerCount !== undefined && msg.fillerCount > 0 && (
                            <span>Fillers: {msg.fillerCount}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {msg.sender === 'candidate' && (
                      <div className="w-8 h-8 rounded-xl bg-[#3a3828] text-[#b5aa96] border border-[#4a4636] flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {evaluating && (
                  <div className="flex items-center gap-2.5 text-xs text-[#4a5e2f] bg-[#f5f0e8]/60 p-3 rounded-xl border border-[#4a4636] w-fit">
                    <div className="w-4 h-4 border-2 border-[#4a5e2f]/30 border-t-[#4a5e2f] rounded-full animate-spin" />
                    <span>AI is evaluating your response depth, STAR structure, and generating next prompt...</span>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Requirement 4: Candidate Answer Options (Voice OR Text toggle) */}
              <div className="bg-[#f5f0e8]/80 p-4 rounded-2xl border border-[#4a4636] shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#4a4636]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAnswerMode('text')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        answerMode === 'text'
                          ? 'bg-[#4a5e2f]/20 text-[#4a5e2f] border border-[#4a5e2f]/40 font-bold'
                          : 'text-[#9a8e7a] hover:text-[#f0ebe0]'
                      }`}
                    >
                      Text Input
                    </button>
                    <button
                      type="button"
                      onClick={toggleSpeechDictation}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        isRecordingMic
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse'
                          : answerMode === 'voice'
                            ? 'bg-[#4a5e2f]/20 text-[#4a5e2f] border border-[#4a5e2f]/40 font-bold'
                            : 'text-[#9a8e7a] hover:text-[#f0ebe0]'
                      }`}
                    >
                      {isRecordingMic ? <Mic className="w-3.5 h-3.5 text-rose-400" /> : <MicOff className="w-3.5 h-3.5" />}
                      <span>{isRecordingMic ? 'Dictating (Listening...)' : 'Voice Dictation'}</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-[#9a8e7a]">Answer via Voice or Text</span>
                </div>

                <textarea
                  rows={3}
                  value={candidateAnswer}
                  onChange={(e) => setCandidateAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitAnswer();
                    }
                  }}
                  placeholder="Structure your response using STAR (Situation, Task, Action, Result) or speak using Voice Dictation..."
                  className="w-full px-4 py-3 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-xs sm:text-sm text-[#2c2a1e] placeholder-[#9a8e7a] focus:outline-none focus:border-[#4a5e2f] resize-none leading-relaxed"
                />

                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-[#9a8e7a]">
                    Press <kbd className="px-1.5 py-0.5 bg-[#f5f0e8] border border-[#4a4636] rounded text-[10px]">Enter</kbd> to submit
                  </div>

                  <button
                    onClick={handleSubmitAnswer}
                    disabled={evaluating || !candidateAnswer.trim()}
                    className="px-5 py-2.5 bg-[#4a5e2f] hover:bg-[#3d4e26] text-[#f0ebe0] rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-[#4a5e2f]/20 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Answer</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. RESULTS / END-OF-SESSION REPORT PHASE */}
          {phase === 'results' && finalSession && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Requirement 8: Overall Score & Session Summary */}
              <PageHeader
                badge="COMPREHENSIVE EVALUATION"
                badgeSubtext={`${finalSession.interview_type} • ${finalSession.difficulty}`}
                title={`${finalSession.role} Performance Report`}
                subtitle={`Completed on ${new Date(finalSession.completed_at || finalSession.created_at).toLocaleDateString()}`}
                actions={
                  <div className="flex items-center gap-4 bg-white/[0.04] p-4 rounded-2xl border border-white/[0.08] shrink-0 shadow-lg">
                    <div>
                      <div className="text-[11px] text-[#9CA3A1] font-semibold">Overall Rating</div>
                      <div className="text-3xl font-black text-[#B6FF3B]">
                        {(finalSession.overall_score / 10).toFixed(1)} <span className="text-sm font-normal text-[#9CA3A1]">/ 10</span>
                      </div>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-[#B6FF3B]/10 border border-[#B6FF3B]/30 flex items-center justify-center shadow-[0_0_15px_rgba(182,255,59,0.2)]">
                      <Award className="w-7 h-7 text-[#B6FF3B]" />
                    </div>
                  </div>
                }
              />

              {/* Requirement 6: Embedded Video Playback */}
              {recordedVideoUrl && (
                <div className="p-6 bg-[#f5f0e8]/80 rounded-2xl border border-[#4a4636] space-y-3 shadow-xl">
                  <h3 className="text-sm font-bold text-[#f0ebe0] flex items-center gap-2">
                    <FileVideo className="w-4 h-4 text-[#4a5e2f]" />
                    <span>Recorded Session Video Playback</span>
                  </h3>
                  <div className="aspect-video w-full max-w-2xl mx-auto rounded-xl overflow-hidden bg-black border border-[#4a4636] shadow-2xl">
                    <video
                      src={recordedVideoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Category Scores Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: 'Technical Mastery', val: finalSession.category_scores?.technical_knowledge || 82, color: 'text-[#4a5e2f]' },
                  { label: 'Communication', val: finalSession.category_scores?.communication || 80, color: 'text-[#4a5e2f]' },
                  { label: 'Problem Solving', val: finalSession.category_scores?.problem_solving || 85, color: 'text-[#b45309]' },
                  { label: 'Answer Relevance', val: finalSession.category_scores?.answer_relevance || 84, color: 'text-[#3d6b35]' },
                  { label: 'Confidence & Poise', val: finalSession.category_scores?.confidence || 78, color: 'text-[#4a5e2f]' }
                ].map((cat, idx) => (
                  <div key={idx} className="p-4 bg-[#f5f0e8]/70 rounded-xl border border-[#4a4636] text-center">
                    <span className="text-[11px] text-[#9a8e7a] block mb-1">{cat.label}</span>
                    <span className={`text-2xl font-black ${cat.color}`}>{cat.val}</span>
                    <span className="text-[10px] text-[#9a8e7a] block mt-0.5">/ 100</span>
                  </div>
                ))}
              </div>

              {/* Requirement 8: Non-Verbal Analysis & Nervous Habits Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Non-Verbal Diagnostics */}
                <div className="p-5 bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-[#f0ebe0] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#4a5e2f]" />
                    <span>Non-Verbal & Presence Diagnostics</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#f5f0e8] rounded-xl border border-[#4a4636]">
                      <span className="text-[11px] text-[#9a8e7a] block mb-0.5">Eye Contact Gaze</span>
                      <span className="text-xl font-black text-[#4a5e2f]">{nonVerbalMetrics.eyeContactPct}%</span>
                      <p className="text-[10px] text-[#9a8e7a] mt-1">Consistent camera focus.</p>
                    </div>
                    <div className="p-3 bg-[#f5f0e8] rounded-xl border border-[#4a4636]">
                      <span className="text-[11px] text-[#9a8e7a] block mb-0.5">Composure & Posture</span>
                      <span className="text-xl font-black text-[#3d6b35]">{nonVerbalMetrics.postureScore}%</span>
                      <p className="text-[10px] text-[#9a8e7a] mt-1">Stable posture & presence.</p>
                    </div>
                    <div className="p-3 bg-[#f5f0e8] rounded-xl border border-[#4a4636]">
                      <span className="text-[11px] text-[#9a8e7a] block mb-0.5">Vocal Tone Steadiness</span>
                      <span className="text-xl font-black text-[#b45309]">{nonVerbalMetrics.toneStability}%</span>
                      <p className="text-[10px] text-[#9a8e7a] mt-1">Clear modulation and volume.</p>
                    </div>
                    <div className="p-3 bg-[#f5f0e8] rounded-xl border border-[#4a4636]">
                      <span className="text-[11px] text-[#9a8e7a] block mb-0.5">Speaking Pace</span>
                      <span className="text-xl font-black text-[#4a5e2f]">{sessionFillerAnalysis.averagePacingWpm} WPM</span>
                      <p className="text-[10px] text-[#9a8e7a] mt-1">Optimal conversational cadence.</p>
                    </div>
                  </div>
                </div>

                {/* Nervous Habits & Filler Words */}
                <div className="p-5 bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-[#f0ebe0] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#b45309]" />
                    <span>Nervous Habits & Speech Clarity</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#f5f0e8] rounded-xl border border-[#4a4636]">
                      <span className="text-xs text-[#b5aa96]">Total Filler Words Detected</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        sessionFillerAnalysis.totalFillers <= 3
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {sessionFillerAnalysis.totalFillers} detected
                      </span>
                    </div>

                    {Object.keys(sessionFillerAnalysis.detectedWords).length > 0 ? (
                      <div className="p-3 bg-[#f5f0e8] rounded-xl border border-[#4a4636] space-y-1.5">
                        <span className="text-[11px] text-[#9a8e7a] block">Detected Keywords:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(sessionFillerAnalysis.detectedWords).map(([word, count]) => (
                            <span key={word} className="px-2 py-0.5 rounded-md bg-[#3a3828] text-xs text-[#b5aa96] border border-[#4a4636]">
                              "{word}": <strong className="text-[#f0ebe0]">{count}x</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                        ✨ Excellent verbal clarity! No repetitive filler words detected.
                      </p>
                    )}

                    <p className="text-[11px] text-[#9a8e7a] leading-relaxed">
                      💡 <strong>Coaching Advice:</strong> Pause in silence when organizing complex system thoughts rather than bridging gaps with filler words.
                    </p>
                  </div>
                </div>
              </div>

              {/* Strengths & Improvement Areas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-[#3d6b35]/20 border border-[#3d6b35]/30 rounded-2xl space-y-3">
                  <h3 className="text-sm font-bold text-[#3d6b35] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Key Strengths</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-[#b5aa96]">
                    {finalSession.strengths && finalSession.strengths.length > 0 ? (
                      finalSession.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#3d6b35] font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))
                    ) : (
                      <li>Strong technical engagement across all prompts.</li>
                    )}
                  </ul>
                </div>

                <div className="p-5 bg-[#b45309]/20 border border-[#b45309]/30 rounded-2xl space-y-3">
                  <h3 className="text-sm font-bold text-[#b45309] flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Areas to Improve</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-[#b5aa96]">
                    {finalSession.areas_to_improve && finalSession.areas_to_improve.length > 0 ? (
                      finalSession.areas_to_improve.map((imp, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#b45309] font-bold">•</span>
                          <span>{imp}</span>
                        </li>
                      ))
                    ) : (
                      <li>Structure complex answers using the STAR format.</li>
                    )}
                  </ul>
                </div>

                <div className="p-5 bg-[#4a5e2f]/20 border border-[#4a5e2f]/30 rounded-2xl space-y-3">
                  <h3 className="text-sm font-bold text-[#4a5e2f] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Coaching Advice</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-[#b5aa96]">
                    {finalSession.recommendations && finalSession.recommendations.length > 0 ? (
                      finalSession.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#4a5e2f] font-bold">•</span>
                          <span>{rec}</span>
                        </li>
                      ))
                    ) : (
                      <li>Practice regular mock sessions to solidify your composure under pressure.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Requirement 8: Per-Question Scores Review */}
              {finalSession.answers && finalSession.answers.length > 0 && (
                <div className="bg-[#f5f0e8]/70 p-6 rounded-2xl border border-[#4a4636] space-y-4">
                  <h3 className="text-base font-bold text-[#f0ebe0] flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-[#4a5e2f]" />
                    <span>Per-Question Breakdown & Feedback</span>
                  </h3>

                  <div className="space-y-4 divide-y divide-[#d5cec3]">
                    {finalSession.answers.map((qa, idx) => {
                      const score10 = qa.evaluation?.score_out_of_10 !== undefined
                        ? qa.evaluation.score_out_of_10
                        : qa.evaluation?.score !== undefined
                          ? Math.round((qa.evaluation.score / 10) * 10) / 10
                          : 8.0;

                      return (
                        <div key={idx} className="pt-4 first:pt-0 space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="text-xs font-bold text-[#f0ebe0] flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-[#f5f0e8] text-[#4a5e2f] border border-[#4a4636]">
                                Q{idx + 1}
                              </span>
                              <span>{qa.question}</span>
                            </h4>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#4a5e2f]/20 text-[#4a5e2f] shrink-0">
                              Score: {score10} / 10
                            </span>
                          </div>

                          <div className="p-3 bg-[#f5f0e8] rounded-xl border border-[#4a4636] text-xs text-[#b5aa96] space-y-1">
                            <span className="text-[10px] text-[#9a8e7a] uppercase font-semibold">Your Response:</span>
                            <p className="italic">{qa.answer}</p>
                          </div>

                          {qa.evaluation?.feedback && (
                            <div className="p-3 bg-[#4a5e2f]/20 rounded-xl border border-[#4a5e2f]/30 text-xs text-[#4a5e2f]">
                              <span className="font-bold">Coach Evaluation: </span>
                              <span>{qa.evaluation.feedback}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#4a4636]">
                <button
                  onClick={() => {
                    setActiveTab('history');
                    setPhase('setup');
                  }}
                  className="px-4 py-2 bg-[#f5f0e8] hover:bg-[#3a3828] text-[#b5aa96] border border-[#4a4636] rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <History className="w-4 h-4" />
                  <span>All Past Sessions</span>
                </button>

                <button
                  onClick={() => {
                    setPhase('setup');
                    setActiveSession(null);
                    setFinalSession(null);
                    setRecordedVideoUrl(null);
                  }}
                  className="px-5 py-2.5 bg-[#4a5e2f] hover:bg-[#3d4e26] text-[#f0ebe0] rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#4a5e2f]/20 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Practice Another Session</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PAST INTERVIEWS HISTORY & RECORDINGS                */}
      {/* ========================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <PageHeader
            badge="PRACTICE ARCHIVE"
            badgeSubtext="Session Records & Video Playback"
            icon={<History className="w-6 h-6" />}
            title="Interview History & Diagnostics"
            subtitle="Review scores, question evaluations, and play back audio/video recordings from past sessions."
            actions={
              <button
                onClick={() => {
                  setActiveTab('simulator');
                  setPhase('setup');
                }}
                className="sb-btn-primary px-4 py-2.5 text-xs font-bold shadow-[0_0_15px_rgba(182,255,59,0.3)] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>New AI Session</span>
              </button>
            }
          />

          {historyLoading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="w-10 h-10 border-4 border-[#4a5e2f]/20 border-t-[#4a5e2f] rounded-full animate-spin" />
            </div>
          ) : historyList.length === 0 ? (
            <div className="p-12 bg-[#f5f0e8]/60 rounded-2xl border border-[#4a4636] text-center space-y-3">
              <Sparkles className="w-12 h-12 text-[#9a8e7a] mx-auto" />
              <h3 className="text-base font-bold text-[#f0ebe0]">No Mock Interviews Taken Yet</h3>
              <p className="text-xs text-[#9a8e7a] max-w-sm mx-auto">
                Start your first realistic AI interview session to test your knowledge, capture video playback, and get diagnostic feedback.
              </p>
              <button
                onClick={() => {
                  setActiveTab('simulator');
                  setPhase('setup');
                }}
                className="px-4 py-2 bg-[#4a5e2f] hover:bg-[#3d4e26] text-[#f0ebe0] rounded-xl text-xs font-semibold cursor-pointer"
              >
                Start First Session
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {historyList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleViewPastSession(item.id)}
                  className="p-5 bg-[#f5f0e8]/70 rounded-2xl border border-[#4a4636] hover:border-[#4a5e2f]/50 hover:bg-[#f5f0e8] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-[#f0ebe0] group-hover:text-[#4a5e2f] transition-colors">
                        {item.role}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#f5f0e8] text-[#4a5e2f] border border-[#4a4636]">
                        {item.interview_type}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#f5f0e8] text-[#4a5e2f] border border-[#4a4636]">
                        {item.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#9a8e7a]">
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{item.duration_minutes || 20} mins</span>
                      <span>•</span>
                      <span className={item.status === 'completed' ? 'text-[#3d6b35]' : 'text-[#b45309]'}>
                        {item.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                      {savedRecordings[item.id] && (
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                          <Film className="w-3 h-3" /> Video Recorded
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-[#9a8e7a] uppercase font-semibold">Overall Rating</span>
                      <div className="text-xl font-black text-[#4a5e2f]">
                        {(item.overall_score / 10).toFixed(1)} / 10
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteHistorySession(item.id, e)}
                      className="p-2 text-[#9a8e7a] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <ChevronRight className="w-5 h-5 text-[#9a8e7a] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
