import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit3, Trash2, Search, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { adminAPI } from '../../services/api';

export const AdminAssessmentsView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<any | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '', skill_name: '', difficulty: 'medium', duration_minutes: 30, passing_score: 70, description: '',
    questions: [{ question: '', options: ['', '', '', ''], correct_index: 0, difficulty: 'medium', marks: 1, explanation: '' }] as any[]
  });

  useEffect(() => { fetchAssessments(); }, []);
  const fetchAssessments = async () => { try { setLoading(true); const res = await adminAPI.getAssessments(); setAssessments(res.data?.assessments || []); } catch (e) { console.error(e); } finally { setLoading(false); } };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.skill_name.trim()) return;
    setSaving(true);
    try {
      if (editingAssessment) {
        await adminAPI.updateAssessment(editingAssessment.id, formData);
        setAssessments(prev => prev.map(a => a.id === editingAssessment.id ? { ...a, ...formData } : a));
      } else {
        const res = await adminAPI.createAssessment(formData);
        const newA = res.data?.assessment || { id: Date.now(), ...formData };
        setAssessments(prev => [...prev, newA]);
      }
      setCreateOpen(false); setEditingAssessment(null);
      resetForm();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to save assessment'); } finally { setSaving(false); }
  };

  const resetForm = () => setFormData({ title: '', skill_name: '', difficulty: 'medium', duration_minutes: 30, passing_score: 70, description: '', questions: [{ question: '', options: ['', '', '', ''], correct_index: 0, difficulty: 'medium', marks: 1, explanation: '' }] });

  const handleDelete = async (id: number) => {
    if (!confirm('Permanently delete this assessment and all associated question data?')) return;
    try { await adminAPI.deleteAssessment(id); setAssessments(prev => prev.filter(a => a.id !== id)); } catch (err: any) { alert(err.response?.data?.message || 'Failed to delete'); }
  };

  const addQuestion = () => setFormData(p => ({ ...p, questions: [...p.questions, { question: '', options: ['', '', '', ''], correct_index: 0, difficulty: 'medium', marks: 1, explanation: '' }] }));
  const removeQuestion = (idx: number) => setFormData(p => ({ ...p, questions: p.questions.filter((_: any, i: number) => i !== idx) }));
  const updateQuestion = (idx: number, field: string, val: any) => setFormData(p => ({ ...p, questions: p.questions.map((q: any, i: number) => i === idx ? { ...q, [field]: val } : q) }));
  const updateOption = (qIdx: number, oIdx: number, val: string) => setFormData(p => ({ ...p, questions: p.questions.map((q: any, i: number) => i === qIdx ? { ...q, options: q.options.map((o: string, j: number) => j === oIdx ? val : o) } : q) }));

  const openEdit = (a: any) => {
    setEditingAssessment(a);
    const questions = Array.isArray(a.questions) ? a.questions : typeof a.questions === 'string' ? JSON.parse(a.questions || '[]') : [{ question: '', options: ['', '', '', ''], correct_index: 0, difficulty: 'medium', marks: 1, explanation: '' }];
    setFormData({ title: a.title || '', skill_name: a.skill_name || '', difficulty: a.difficulty || 'medium', duration_minutes: a.duration_minutes || 30, passing_score: a.passing_score || 70, description: a.description || '', questions });
    setCreateOpen(true);
  };

  const filtered = assessments.filter(a => !searchQuery || (a.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || (a.skill_name || '').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#f0ebe0] tracking-tight">Assessment & Question Bank</h1>
          <p className="text-[#9a8e7a] text-xs md:text-sm mt-1">Create, edit, and manage micro-credential assessments with questions, difficulty levels, and scoring.</p>
        </div>
        <button onClick={() => { resetForm(); setEditingAssessment(null); setCreateOpen(true); }} className="px-4 py-2 rounded-xl bg-[#3d6b35] hover:bg-[#3d6b35] text-[#f0ebe0] text-xs font-bold transition flex items-center gap-2 shadow self-start sm:self-auto"><Plus className="w-4 h-4" />Create Assessment</button>
      </div>

      <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-4">
        <div className="relative max-w-md"><Search className="w-4 h-4 text-[#9a8e7a] absolute left-3.5 top-3" /><input type="text" placeholder="Search by title or skill..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#2c2a1e] placeholder-[#9a8e7a] focus:ring-2 focus:ring-[#3d6b35]" /></div>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#3d6b35] border-t-transparent rounded-full animate-spin"></div></div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-12 text-center text-[#9a8e7a] space-y-2"><BookOpen className="w-8 h-8 mx-auto text-[#6b6151]" /><p className="text-sm font-semibold text-[#f0ebe0]">No assessments configured</p></div>
      ) : (
        <div className="space-y-4">
          {filtered.map(a => {
            const questions = Array.isArray(a.questions) ? a.questions : typeof a.questions === 'string' ? JSON.parse(a.questions || '[]') : [];
            const expanded = expandedId === a.id;
            return (
              <div key={a.id} className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-5 hover:border-[#4a4636] transition">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-[#f0ebe0] text-sm">{a.title}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3d6b35]/10 text-[#3d6b35] border border-[#3d6b35]/20">{a.skill_name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3a3828] text-[#b5aa96] capitalize">{a.difficulty}</span>
                    </div>
                    <p className="text-[11px] text-[#9a8e7a]">{questions.length} questions • {a.duration_minutes || 30} min • Pass: {a.passing_score || 70}%</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setExpandedId(expanded ? null : a.id)} className="p-1.5 rounded-lg bg-[#f5f0e8] text-[#9a8e7a] hover:text-[#f0ebe0] transition">{expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
                    <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg bg-[#f5f0e8] text-[#9a8e7a] hover:text-[#3d6b35] transition"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {expanded && questions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#4a4636] space-y-3">
                    {questions.map((q: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#b5aa96] space-y-2">
                        <div className="flex justify-between"><span className="font-semibold text-[#f0ebe0]">Q{idx + 1}: {q.question}</span><span className="text-[#9a8e7a] capitalize">{q.difficulty} • {q.marks || 1} pt</span></div>
                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                          {(q.options || []).map((opt: string, oi: number) => (
                            <span key={oi} className={`px-2.5 py-1 rounded-lg border ${oi === q.correct_index ? 'border-[#3d6b35]/40 bg-[#3d6b35]/10 text-[#3d6b35] font-semibold' : 'border-[#4a4636] bg-[#3a3828]/50 text-[#9a8e7a]'}`}>{String.fromCharCode(65 + oi)}. {opt}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#f5f0e8] border border-[#4a4636] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-[#f0ebe0] text-base sticky top-0 bg-[#f5f0e8] py-2 z-10">{editingAssessment ? 'Edit Assessment' : 'Create New Assessment'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-[#b5aa96] mb-1">Title *</label><input type="text" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#f0ebe0]" placeholder="e.g. Python Fundamentals" /></div>
              <div><label className="block text-xs font-semibold text-[#b5aa96] mb-1">Skill Name *</label><input type="text" value={formData.skill_name} onChange={e => setFormData(p => ({ ...p, skill_name: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#f0ebe0]" placeholder="e.g. Python" /></div>
              <div><label className="block text-xs font-semibold text-[#b5aa96] mb-1">Difficulty</label><select value={formData.difficulty} onChange={e => setFormData(p => ({ ...p, difficulty: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#f0ebe0]"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
              <div><label className="block text-xs font-semibold text-[#b5aa96] mb-1">Duration (mins)</label><input type="number" value={formData.duration_minutes} onChange={e => setFormData(p => ({ ...p, duration_minutes: parseInt(e.target.value) || 30 }))} className="w-full px-3 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#f0ebe0]" /></div>
              <div><label className="block text-xs font-semibold text-[#b5aa96] mb-1">Passing Score (%)</label><input type="number" min="0" max="100" value={formData.passing_score} onChange={e => setFormData(p => ({ ...p, passing_score: parseInt(e.target.value) || 70 }))} className="w-full px-3 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#f0ebe0]" /></div>
            </div>

            <div className="pt-4 border-t border-[#4a4636]">
              <div className="flex items-center justify-between mb-3"><h4 className="font-bold text-[#f0ebe0] text-xs">Questions ({formData.questions.length})</h4><button onClick={addQuestion} className="px-3 py-1 rounded-lg bg-[#3d6b35] text-[#f0ebe0] text-[11px] font-semibold flex items-center gap-1"><Plus className="w-3 h-3" />Add Question</button></div>
              <div className="space-y-4">
                {formData.questions.map((q: any, qi: number) => (
                  <div key={qi} className="p-4 rounded-xl bg-[#f5f0e8] border border-[#4a4636] space-y-3">
                    <div className="flex items-center justify-between"><span className="text-xs font-bold text-[#f0ebe0]">Question {qi + 1}</span><button onClick={() => removeQuestion(qi)} className="text-rose-400 hover:text-rose-300 text-[11px]">Remove</button></div>
                    <input type="text" value={q.question} onChange={e => updateQuestion(qi, 'question', e.target.value)} placeholder="Enter question text..." className="w-full px-3 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#f0ebe0]" />
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt: string, oi: number) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input type="radio" name={`correct-${qi}`} checked={q.correct_index === oi} onChange={() => updateQuestion(qi, 'correct_index', oi)} className="accent-[#3d6b35]" />
                          <input type="text" value={opt} onChange={e => updateOption(qi, oi, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oi)}`} className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#f5f0e8] border border-[#4a4636] text-[11px] text-[#f0ebe0]" />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="text-[10px] text-[#9a8e7a]">Difficulty</label><select value={q.difficulty} onChange={e => updateQuestion(qi, 'difficulty', e.target.value)} className="w-full px-2 py-1 rounded-lg bg-[#f5f0e8] border border-[#4a4636] text-[11px] text-[#f0ebe0]"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
                      <div><label className="text-[10px] text-[#9a8e7a]">Points</label><input type="number" min="1" value={q.marks} onChange={e => updateQuestion(qi, 'marks', parseInt(e.target.value) || 1)} className="w-full px-2 py-1 rounded-lg bg-[#f5f0e8] border border-[#4a4636] text-[11px] text-[#f0ebe0]" /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#4a4636] sticky bottom-0 bg-[#f5f0e8] py-3">
              <button onClick={() => setCreateOpen(false)} className="px-3.5 py-1.5 rounded-xl bg-[#f5f0e8] text-[#9a8e7a] text-xs font-semibold">Cancel</button>
              <button disabled={!formData.title.trim() || !formData.skill_name.trim() || saving} onClick={handleSave} className="px-4 py-1.5 rounded-xl bg-[#3d6b35] hover:bg-[#3d6b35] text-[#f0ebe0] text-xs font-bold transition disabled:opacity-50">{saving ? 'Saving...' : editingAssessment ? 'Update Assessment' : 'Create Assessment'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminAssessmentsView;


