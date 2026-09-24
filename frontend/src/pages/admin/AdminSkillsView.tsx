import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit3, Trash2, Search, CheckCircle2, XCircle, Tag } from 'lucide-react';
import { adminAPI } from '../../services/api';

const SKILL_CATEGORIES = ['Programming Languages', 'Frontend', 'Backend', 'Databases', 'Cloud', 'DevOps', 'Data Science', 'AI/ML', 'Tools', 'Soft Skills', 'Other'];

export const AdminSkillsView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: '', category: 'Programming Languages', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSkills(); }, []);

  const fetchSkills = async () => {
    try { setLoading(true); const res = await adminAPI.getSkills(); setSkills(res.data?.skills || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      if (editingSkill) {
        await adminAPI.updateSkill(editingSkill.id, formData);
        setSkills(prev => prev.map(s => s.id === editingSkill.id ? { ...s, ...formData } : s));
      } else {
        const res = await adminAPI.createSkill(formData);
        const newSkill = res.data?.skill || { id: Date.now(), ...formData };
        setSkills(prev => [...prev, newSkill]);
      }
      setCreateOpen(false); setEditingSkill(null); setFormData({ name: '', category: 'Programming Languages', description: '' });
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to save skill'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this skill from the platform taxonomy?')) return;
    try { await adminAPI.deleteSkill(id); setSkills(prev => prev.filter(s => s.id !== id)); } catch (err: any) { alert(err.response?.data?.message || 'Failed to delete'); }
  };

  const openEdit = (skill: any) => { setEditingSkill(skill); setFormData({ name: skill.name, category: skill.category || 'Other', description: skill.description || '' }); setCreateOpen(true); };
  const openCreate = () => { setEditingSkill(null); setFormData({ name: '', category: 'Programming Languages', description: '' }); setCreateOpen(true); };

  const filtered = skills.filter(s => {
    if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
    if (searchQuery) return (s.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });

  const grouped = SKILL_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = filtered.filter(s => s.category === cat);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#f0ebe0] tracking-tight">Skill Taxonomy Management</h1>
          <p className="text-[#9a8e7a] text-xs md:text-sm mt-1">Define, categorize, and curate the platform-wide technical competency catalog used in matching and assessments.</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 rounded-xl bg-[#3d6b35] hover:bg-[#3d6b35] text-[#f0ebe0] text-xs font-bold transition flex items-center gap-2 shadow self-start sm:self-auto"><Plus className="w-4 h-4" />Add Skill</button>
      </div>

      <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1"><Search className="w-4 h-4 text-[#9a8e7a] absolute left-3.5 top-3" /><input type="text" placeholder="Search skill name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#2c2a1e] placeholder-[#9a8e7a] focus:ring-2 focus:ring-[#3d6b35]" /></div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#b5aa96] focus:ring-2 focus:ring-[#3d6b35]">
          <option value="all">All Categories ({skills.length})</option>
          {SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#3d6b35] border-t-transparent rounded-full animate-spin"></div></div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-12 text-center text-[#9a8e7a] space-y-2"><Layers className="w-8 h-8 mx-auto text-[#6b6151]" /><p className="text-sm font-semibold text-[#f0ebe0]">No skills found</p></div>
      ) : (
        <div className="space-y-6">
          {SKILL_CATEGORIES.map(cat => {
            const catSkills = grouped[cat];
            if (!catSkills || catSkills.length === 0) return null;
            return (
              <div key={cat} className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-[#f0ebe0] flex items-center gap-2 border-b border-[#4a4636] pb-2"><Tag className="w-4 h-4 text-[#3d6b35]" />{cat} <span className="text-[#9a8e7a] font-normal">({catSkills.length})</span></h3>
                <div className="flex flex-wrap gap-2">
                  {catSkills.map((s: any) => (
                    <div key={s.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#f0ebe0] font-medium group hover:border-[#3d6b35]/50 transition">
                      <span>{s.name}</span>
                      <button onClick={() => openEdit(s)} className="text-[#9a8e7a] hover:text-[#3d6b35] transition opacity-0 group-hover:opacity-100"><Edit3 className="w-3 h-3" /></button>
                      <button onClick={() => handleDelete(s.id)} className="text-[#9a8e7a] hover:text-rose-400 transition opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#f5f0e8] border border-[#4a4636] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-[#f0ebe0] text-base">{editingSkill ? 'Edit Skill' : 'Create New Skill'}</h3>
            <div>
              <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Skill Name *</label>
              <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Kubernetes, FastAPI, Figma..." className="w-full px-3 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#f0ebe0]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Category *</label>
              <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#f0ebe0]">
                {SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Description (optional)</label>
              <textarea rows={2} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#f0ebe0]" />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setCreateOpen(false)} className="px-3.5 py-1.5 rounded-xl bg-[#f5f0e8] text-[#9a8e7a] text-xs font-semibold">Cancel</button>
              <button disabled={!formData.name.trim() || saving} onClick={handleSave} className="px-4 py-1.5 rounded-xl bg-[#3d6b35] hover:bg-[#3d6b35] text-[#f0ebe0] text-xs font-bold transition disabled:opacity-50">{saving ? 'Saving...' : editingSkill ? 'Update Skill' : 'Create Skill'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminSkillsView;


