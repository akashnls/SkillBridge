import React, { useState, useEffect } from 'react';
import { Award, Plus, Edit3, Trash2, Search, ShieldCheck } from 'lucide-react';
import { adminAPI } from '../../services/api';

export const AdminBadgesView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', skill_name: '', level: 'beginner', icon: '🏅', criteria_score: 70, description: '' });

  useEffect(() => { fetchBadges(); }, []);
  const fetchBadges = async () => { try { setLoading(true); const res = await adminAPI.getBadgeTemplates(); setBadges(res.data?.templates || []); } catch (e) { console.error(e); } finally { setLoading(false); } };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      if (editingBadge) {
        await adminAPI.updateBadgeTemplate(editingBadge.id, formData);
        setBadges(prev => prev.map(b => b.id === editingBadge.id ? { ...b, ...formData } : b));
      } else {
        const res = await adminAPI.createBadgeTemplate(formData);
        setBadges(prev => [...prev, res.data?.template || res.data?.badge || { id: Date.now(), ...formData }]);
      }
      setCreateOpen(false); setEditingBadge(null); setFormData({ name: '', skill_name: '', level: 'beginner', icon: '🏅', criteria_score: 70, description: '' });
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to save badge'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Permanently delete this badge template?')) return;
    try { await adminAPI.deleteBadgeTemplate(id); setBadges(prev => prev.filter(b => b.id !== id)); } catch (err: any) { alert(err.response?.data?.message || 'Failed to delete'); }
  };

  const filtered = badges.filter(b => !searchQuery || (b.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (b.skill_name || '').toLowerCase().includes(searchQuery.toLowerCase()));

  const ICONS = ['🏅', '⭐', '🏆', '🎯', '💎', '🔥', '🚀', '🛡️', '⚡', '🧠'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#f0ebe0] tracking-tight">Badge Template Registry</h1>
          <p className="text-[#9a8e7a] text-xs md:text-sm mt-1">Design and manage verifiable micro-credential badges awarded to candidates upon assessment completion.</p>
        </div>
        <button onClick={() => { setEditingBadge(null); setFormData({ name: '', skill_name: '', level: 'beginner', icon: '🏅', criteria_score: 70, description: '' }); setCreateOpen(true); }} className="px-4 py-2 rounded-xl bg-[#3d6b35] hover:bg-[#3d6b35] text-[#f0ebe0] text-xs font-bold transition flex items-center gap-2 shadow self-start sm:self-auto"><Plus className="w-4 h-4" />Create Badge</button>
      </div>

      <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-4">
        <div className="relative max-w-md"><Search className="w-4 h-4 text-[#9a8e7a] absolute left-3.5 top-3" /><input type="text" placeholder="Search badge name or skill..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#2c2a1e] placeholder-[#9a8e7a] focus:ring-2 focus:ring-[#3d6b35]" /></div>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#3d6b35] border-t-transparent rounded-full animate-spin"></div></div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-12 text-center text-[#9a8e7a] space-y-2"><Award className="w-8 h-8 mx-auto text-[#6b6151]" /><p className="text-sm font-semibold text-[#f0ebe0]">No badge templates defined yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(b => (
            <div key={b.id} className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-5 hover:border-[#3d6b35]/30 transition space-y-3 group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#f5f0e8] border border-[#4a4636] flex items-center justify-center text-2xl shadow-inner">{b.icon || '🏅'}</div>
                  <div>
                    <h3 className="font-bold text-[#f0ebe0] text-sm">{b.name}</h3>
                    <span className="text-[11px] text-[#9a8e7a] block">{b.skill_name} • <span className="capitalize text-[#3d6b35]">{b.level}</span></span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => { setEditingBadge(b); setFormData({ name: b.name, skill_name: b.skill_name || '', level: b.level || 'beginner', icon: b.icon || '🏅', criteria_score: b.criteria_score || 70, description: b.description || '' }); setCreateOpen(true); }} className="p-1 rounded-lg text-[#9a8e7a] hover:text-[#3d6b35]"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(b.id)} className="p-1 rounded-lg text-[#9a8e7a] hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <p className="text-[11px] text-[#9a8e7a] line-clamp-2">{b.description || 'Earned upon demonstrating proficiency in the assessment evaluation.'}</p>
              <div className="pt-2 border-t border-[#4a4636] flex items-center justify-between text-[11px] text-[#9a8e7a]">
                <span>Min Score: <strong className="text-[#3d6b35]">{b.criteria_score || 70}%</strong></span>
                <span className="flex items-center gap-1 text-[#3d6b35]"><ShieldCheck className="w-3 h-3" />HMAC Verifiable</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#f5f0e8] border border-[#4a4636] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-[#f0ebe0] text-base">{editingBadge ? 'Edit Badge Template' : 'Create Badge Template'}</h3>
            <div><label className="block text-xs font-semibold text-[#b5aa96] mb-1">Badge Name *</label><input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#f0ebe0]" placeholder="e.g. Python Advanced" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-[#b5aa96] mb-1">Associated Skill *</label><input type="text" value={formData.skill_name} onChange={e => setFormData(p => ({ ...p, skill_name: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#f0ebe0]" placeholder="e.g. Python" /></div>
              <div><label className="block text-xs font-semibold text-[#b5aa96] mb-1">Proficiency Level</label><select value={formData.level} onChange={e => setFormData(p => ({ ...p, level: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#f0ebe0]"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option><option value="expert">Expert</option></select></div>
            </div>
            <div><label className="block text-xs font-semibold text-[#b5aa96] mb-1">Icon</label><div className="flex gap-2 flex-wrap">{ICONS.map(ic => (<button key={ic} type="button" onClick={() => setFormData(p => ({ ...p, icon: ic }))} className={`w-9 h-9 rounded-lg border text-lg flex items-center justify-center ${formData.icon === ic ? 'border-[#3d6b35] bg-[#3d6b35]/20' : 'border-[#4a4636] bg-[#f5f0e8] hover:bg-[#3a3828]'}`}>{ic}</button>))}</div></div>
            <div><label className="block text-xs font-semibold text-[#b5aa96] mb-1">Minimum Passing Score (%)</label><input type="number" min="0" max="100" value={formData.criteria_score} onChange={e => setFormData(p => ({ ...p, criteria_score: parseInt(e.target.value) || 70 }))} className="w-full px-3 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#f0ebe0]" /></div>
            <div><label className="block text-xs font-semibold text-[#b5aa96] mb-1">Description</label><textarea rows={2} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#f0ebe0]" /></div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setCreateOpen(false)} className="px-3.5 py-1.5 rounded-xl bg-[#f5f0e8] text-[#9a8e7a] text-xs font-semibold">Cancel</button>
              <button disabled={!formData.name.trim() || saving} onClick={handleSave} className="px-4 py-1.5 rounded-xl bg-[#3d6b35] hover:bg-[#3d6b35] text-[#f0ebe0] text-xs font-bold transition disabled:opacity-50">{saving ? 'Saving...' : editingBadge ? 'Update Badge' : 'Create Badge'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminBadgesView;


