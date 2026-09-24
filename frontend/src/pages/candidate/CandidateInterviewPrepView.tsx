import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext.js';
import { candidateAPI } from '../../services/api.js';
import { PageHeader } from '../../components/PageHeader.js';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Sparkles,
  Code2,
  Users2,
  BrainCircuit,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Save,
  ArrowRight
} from 'lucide-react';

interface PrepQuestion {
  id: string;
  category: 'Technical' | 'HR' | 'Behavioral' | 'Coding';
  question: string;
  tips: string;
  framework: string;
  keyPoints: string[];
}

const PREP_BANK: PrepQuestion[] = [
  {
    id: 'prep-tech-1',
    category: 'Technical',
    question: 'How do you design a database schema for scalability and high query volume?',
    tips: 'Address normalization vs denormalization, indexing strategies, read-replicas, and caching layers.',
    framework: 'Requirements → Entities/Relationships → Normalization → Indexing Strategy → Caching/Partitioning',
    keyPoints: ['Use appropriate data types', 'Index foreign keys and frequent filter columns', 'Use Redis for caching hot data', 'Consider horizontal sharding when scaling beyond a single node']
  },
  {
    id: 'prep-tech-2',
    category: 'Technical',
    question: 'Explain the difference between synchronous and asynchronous architectures.',
    tips: 'Contrast blocking vs non-blocking I/O, event loops, and message queues.',
    framework: 'Definition → Trade-offs (latency vs throughput) → Real-world Example (Payment gateway vs Email notifications)',
    keyPoints: ['Async frees the main thread for incoming traffic', 'Message brokers like RabbitMQ or Kafka decouple services', 'Requires idempotent handlers and retry logic']
  },
  {
    id: 'prep-coding-1',
    category: 'Coding',
    question: 'Walk me through how you optimize an algorithm from O(n²) to O(n) or O(n log n).',
    tips: 'Use frequency hash maps, two pointers, sliding windows, or sorting.',
    framework: 'Brute Force Analysis → Identify Bottleneck → Choose Data Structure (Hash Map / Set) → Optimized Implementation',
    keyPoints: ['Trading space for time using hash maps', 'Avoid nested loops over the same array', 'Verify edge cases: empty array, single element, duplicates']
  },
  {
    id: 'prep-behavioral-1',
    category: 'Behavioral',
    question: 'Tell me about a time you resolved a major disagreement with a senior engineer or product manager.',
    tips: 'Use the STAR method: Situation, Task, Action, Result. Keep the tone collaborative, not adversarial.',
    framework: 'Situation → Task → Action (Data-driven consensus) → Result (Positive project outcome & team trust)',
    keyPoints: ['Focused on business and user metrics, not ego', 'Proposed a quick spike or A/B benchmark', 'Aligned on long-term maintainability']
  },
  {
    id: 'prep-behavioral-2',
    category: 'Behavioral',
    question: 'Describe a situation where a production deployment caused an outage. How did you handle it?',
    tips: 'Emphasize immediate mitigation, blameless post-mortem, and permanent automated prevention.',
    framework: 'Incident Discovery → Immediate Triage & Rollback → Root Cause Analysis → Post-Mortem & Safeguards',
    keyPoints: ['Prioritized restoring service before debugging', 'Communicated transparently with stakeholders', 'Added automated regression tests and alerting']
  },
  {
    id: 'prep-hr-1',
    category: 'HR',
    question: 'Tell me about yourself and walk me through your engineering background.',
    tips: 'Present: current role and strengths. Past: how you got here and big wins. Future: why this company is the ideal next step.',
    framework: 'Present (Current Role) → Past (Relevant Achievements) → Future (Alignment with Target Role)',
    keyPoints: ['Keep it under 2 minutes', 'Highlight 2 concrete technical achievements', 'Tailor the closing to why you want this specific role']
  },
  {
    id: 'prep-hr-2',
    category: 'HR',
    question: 'Why do you want to work with us specifically over other companies?',
    tips: 'Reference their specific product, technology challenges, engineering culture, or market vision.',
    framework: 'Company Mission/Product → Technical Architecture Challenge → Personal Contribution & Growth',
    keyPoints: ['Shows you researched their product beyond the landing page', 'Connects their technical needs with your verified skills', 'Highlights enthusiasm for their industry']
  }
];

export const CandidateInterviewPrepView: React.FC = () => {
  const { navigate } = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(PREP_BANK[0].id);
  const [userNotes, setUserNotes] = useState<Record<string, string>>({});
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const res = await candidateAPI.getInterviewPrepProgress();
      if (res.data?.success && res.data.progress) {
        const completed = new Set<string>();
        const notesMap: Record<string, string> = {};
        res.data.progress.forEach((p: any) => {
          if (p.is_completed === 1) completed.add(p.question_id);
          if (p.notes) notesMap[p.question_id] = p.notes;
        });
        setCompletedIds(completed);
        setUserNotes(notesMap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (q: PrepQuestion) => {
    const nextCompleted = !completedIds.has(q.id);
    const updated = new Set(completedIds);
    if (nextCompleted) updated.add(q.id);
    else updated.delete(q.id);
    setCompletedIds(updated);

    try {
      await candidateAPI.toggleInterviewPrepQuestion({
        question_id: q.id,
        category: q.category,
        is_completed: nextCompleted,
        notes: userNotes[q.id] || ''
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNote = async (qId: string, category: string) => {
    try {
      setSavingNoteId(qId);
      await candidateAPI.toggleInterviewPrepQuestion({
        question_id: qId,
        category,
        is_completed: completedIds.has(qId),
        notes: userNotes[qId] || ''
      });
      setTimeout(() => setSavingNoteId(null), 1500);
    } catch (err) {
      console.error(err);
      setSavingNoteId(null);
    }
  };

  const filteredQuestions = PREP_BANK.filter(
    q => activeCategory === 'All' || q.category === activeCategory
  );

  const completedCount = completedIds.size;
  const progressPercent = Math.round((completedCount / PREP_BANK.length) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#4a5e2f]/20 border-t-[#4a5e2f] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        badge="CURATED QUESTION BANK"
        badgeSubtext="STAR Method & Architecture Frameworks"
        icon={<BookOpen className="w-6 h-6" />}
        title="Interview Preparation"
        subtitle="Master high-frequency Technical, HR, Behavioral, and Coding questions. Track completed topics and save your talking points."
        actions={
          <div className="p-4 bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.08] text-center space-y-2 shrink-0 max-w-xs shadow-lg">
            <div className="flex items-center justify-center gap-1.5 text-[#B6FF3B] text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Ready for Live Simulation?</span>
            </div>
            <p className="text-[11px] text-[#9CA3A1] leading-relaxed">
              Practice conversational responses with our adaptive AI interview coach.
            </p>
            <button
              onClick={() => navigate('/candidate/mock-interview')}
              className="sb-btn-primary w-full py-2 text-xs font-bold"
            >
              Start AI Mock Interview
            </button>
          </div>
        }
      />

      {/* Progress Bar */}
      <div className="bg-[#f5f0e8]/70 p-5 rounded-2xl border border-[#4a4636]">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-[#b5aa96]">Preparation Progress</span>
          <span className="font-bold text-[#4a5e2f]">{completedCount} of {PREP_BANK.length} Mastered ({progressPercent}%)</span>
        </div>
        <div className="w-full bg-[#3a3828] rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#4a5e2f] to-[#4a5e2f] h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#4a4636] pb-3 text-xs font-semibold">
        {['All', 'Technical', 'Coding', 'Behavioral', 'HR'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
              activeCategory === cat
                ? 'bg-[#4a5e2f]/20 text-[#4a5e2f] border border-[#4a5e2f]/40 font-bold'
                : 'text-[#9a8e7a] hover:text-[#f0ebe0] hover:bg-[#f5f0e8]'
            }`}
          >
            {cat} Questions
          </button>
        ))}
      </div>

      {/* Questions Accordion List */}
      <div className="space-y-3">
        {filteredQuestions.map((q) => {
          const isDone = completedIds.has(q.id);
          const isExpanded = expandedId === q.id;

          return (
            <div
              key={q.id}
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? 'bg-[#f5f0e8]/90 border-[#4a5e2f]/40 shadow-lg'
                  : 'bg-[#f5f0e8]/60 border-[#4a4636] hover:border-[#4a4636]'
              }`}
            >
              {/* Question Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComplete(q);
                    }}
                    className={`mt-0.5 p-1 rounded-lg transition-colors ${
                      isDone ? 'text-[#4a5e2f]' : 'text-[#9a8e7a] hover:text-[#b5aa96]'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5 fill-current" /> : <Circle className="w-5 h-5" />}
                  </button>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f5f0e8] text-[#4a5e2f] border border-[#4a4636]">
                        {q.category}
                      </span>
                      {isDone && (
                        <span className="text-[10px] text-[#4a5e2f] font-semibold">Mastered</span>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-[#f0ebe0]">{q.question}</h3>
                  </div>
                </div>

                <button className="p-1 text-[#9a8e7a] hover:text-[#f0ebe0] shrink-0 mt-1">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {/* Accordion Body */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-[#4a4636]/80 space-y-4">
                  {/* Framework & Tips */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-[#f5f0e8] rounded-xl border border-[#4a4636] space-y-1">
                      <span className="text-[11px] font-bold text-[#4a5e2f] uppercase tracking-wider">
                        Answering Framework:
                      </span>
                      <p className="text-xs text-[#b5aa96] font-mono leading-relaxed">{q.framework}</p>
                    </div>

                    <div className="p-3.5 bg-[#f5f0e8] rounded-xl border border-[#4a4636] space-y-1">
                      <span className="text-[11px] font-bold text-[#4a5e2f] uppercase tracking-wider">
                        Strategy & Tips:
                      </span>
                      <p className="text-xs text-[#b5aa96] leading-relaxed">{q.tips}</p>
                    </div>
                  </div>

                  {/* Key Points */}
                  <div>
                    <span className="text-xs font-bold text-[#b5aa96] block mb-2">Key Talking Points:</span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#b5aa96]">
                      {q.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-[#f5f0e8]/50 p-2.5 rounded-lg border border-[#4a4636]">
                          <span className="text-[#4a5e2f] font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Candidate Private Talking Points / Notes */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[#b5aa96]">
                        Your Personalized Talking Points & Experience Example:
                      </label>
                      <button
                        type="button"
                        onClick={() => handleSaveNote(q.id, q.category)}
                        className="text-xs font-bold text-[#4a5e2f] hover:text-[#4a5e2f] flex items-center gap-1 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{savingNoteId === q.id ? 'Saved!' : 'Save Notes'}</span>
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={userNotes[q.id] || ''}
                      onChange={(e) => setUserNotes({ ...userNotes, [q.id]: e.target.value })}
                      placeholder="Write your specific project stories, metrics, or technologies to mention for this question..."
                      className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-xs text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f] resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


