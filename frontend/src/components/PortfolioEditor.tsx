import React, { useState, useEffect } from 'react';
import { PortfolioProject } from '../types/index.js';
import { portfolioAPI } from '../services/api.js';
import {
  FolderGit2,
  Plus,
  Trash2,
  ExternalLink,
  GitBranch,
  Lightbulb
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

export const PortfolioEditor: React.FC = () => {
  const { t } = useLanguage();
  const [portfolios, setPortfolios] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [problemSolved, setProblemSolved] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      setLoading(true);
      const res = await portfolioAPI.getMyPortfolios();
      if (res.data.success) {
        setPortfolios(res.data.portfolios);
      }
    } catch (e) {
      console.error('Failed to load portfolios', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !skillsInput) return;
    setSaving(true);

    try {
      const skillsArray = skillsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const res = await portfolioAPI.createPortfolio({
        title,
        description,
        problem_solved: problemSolved,
        skills_used: skillsArray,
        github_url: githubUrl,
        live_demo_url: liveDemoUrl
      });

      if (res.data.success) {
        setTitle('');
        setDescription('');
        setProblemSolved('');
        setSkillsInput('');
        setGithubUrl('');
        setLiveDemoUrl('');
        setModalOpen(false);
        await loadPortfolios();
      }
    } catch (e) {
      console.error('Failed to add portfolio', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await portfolioAPI.deletePortfolio(id);
      setPortfolios(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error('Failed to delete portfolio', e);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner - Dark Fintech style */}
      <div className="bg-[#16181A] rounded-3xl border border-white/10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/25">
              Non-Traditional Learner Showcase
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">{t('nav_portfolio')}</h2>
          <p className="text-xs text-[#9CA3A1] mt-1 max-w-xl leading-relaxed">
            In skill-first hiring, empirical project proofs directly feed into your AI Job-Fit score and give recruiters tangible proof of your problem-solving abilities.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-full bg-[#B6FF3B] hover:bg-[#C6FF5A] text-[#0B0D0C] text-xs font-bold shadow-lg shadow-[#B6FF3B]/20 flex items-center gap-2 shrink-0 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Practical Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-12 text-[#9CA3A1] text-xs">Loading practical portfolios...</div>
      ) : portfolios.length === 0 ? (
        <div className="bg-[#16181A] rounded-3xl border border-white/8 p-12 text-center space-y-4 shadow-xl">
          <FolderGit2 className="w-12 h-12 text-[#6B7280] mx-auto" />
          <h3 className="text-base font-bold text-white">No Practical Projects Added Yet</h3>
          <p className="text-xs text-[#9CA3A1] max-w-md mx-auto leading-relaxed">
            Self-taught developers and bootcamp graduates can dramatically increase interview callbacks by showcasing 2-3 real GitHub repositories with live deployed demos.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-2.5 rounded-full bg-[#B6FF3B] hover:bg-[#C6FF5A] text-[#0B0D0C] text-xs font-bold shadow-lg shadow-[#B6FF3B]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Add Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolios.map((project) => (
            <div
              key={project.id}
              className="bg-[#16181A] rounded-2xl border border-white/8 p-6 flex flex-col justify-between hover:border-[#B6FF3B]/40 transition-all hover:shadow-xl hover:shadow-[#B6FF3B]/5 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-base font-bold text-white group-hover:text-[#B6FF3B] transition-colors">
                    {project.title}
                  </h3>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-1.5 rounded-full text-[#6B7280] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-[#9CA3A1] leading-relaxed mb-4">{project.description}</p>

                {project.problem_solved && (
                  <div className="p-3 rounded-xl bg-[#101211] border border-white/5 mb-4 text-xs">
                    <span className="text-[#B6FF3B] font-bold flex items-center gap-1.5 mb-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Real-World Problem Solved
                    </span>
                    <p className="text-[#9CA3A1] leading-relaxed">{project.problem_solved}</p>
                  </div>
                )}

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.skills_used.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/5 text-[#9CA3A1] border border-white/10"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="flex items-center gap-3 pt-3 border-t border-white/8 text-xs">
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-[#9CA3A1] hover:text-[#B6FF3B] font-semibold transition-colors"
                  >
                    <GitBranch className="w-4 h-4 text-[#6B7280]" />
                    <span>Source Code</span>
                  </a>
                )}
                {project.live_demo_url && (
                  <a
                    href={project.live_demo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-[#B6FF3B] hover:underline font-semibold transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Live Preview</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#16181A] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Add Non-Traditional Project Proof</h3>

            <form onSubmit={handleAddProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#9CA3A1] font-bold mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Task Queue & Worker System"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#101211] border border-white/10 rounded-xl p-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#B6FF3B]"
                />
              </div>

              <div>
                <label className="block text-[#9CA3A1] font-bold mb-1">Architecture & Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain system architecture, technical decisions, and how components interact..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-[#101211] border border-white/10 rounded-xl p-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#B6FF3B]"
                />
              </div>

              <div>
                <label className="block text-[#9CA3A1] font-bold mb-1">Practical Problem Solved</label>
                <input
                  type="text"
                  placeholder="e.g. Reduced queue processing latency by 45% using Redis streams"
                  value={problemSolved}
                  onChange={e => setProblemSolved(e.target.value)}
                  className="w-full bg-[#101211] border border-white/10 rounded-xl p-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#B6FF3B]"
                />
              </div>

              <div>
                <label className="block text-[#9CA3A1] font-bold mb-1">Technologies / Skills (Comma-separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React, Node.js, SQL, Redis, Docker"
                  value={skillsInput}
                  onChange={e => setSkillsInput(e.target.value)}
                  className="w-full bg-[#101211] border border-white/10 rounded-xl p-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#B6FF3B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9CA3A1] font-bold mb-1">GitHub Repo URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={e => setGithubUrl(e.target.value)}
                    className="w-full bg-[#101211] border border-white/10 rounded-xl p-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#B6FF3B]"
                  />
                </div>
                <div>
                  <label className="block text-[#9CA3A1] font-bold mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    placeholder="https://my-app.vercel.app"
                    value={liveDemoUrl}
                    onChange={e => setLiveDemoUrl(e.target.value)}
                    className="w-full bg-[#101211] border border-white/10 rounded-xl p-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#B6FF3B]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white font-semibold border border-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-full bg-[#B6FF3B] hover:bg-[#C6FF5A] text-[#0B0D0C] font-bold shadow-lg shadow-[#B6FF3B]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {saving ? 'Adding...' : 'Save Project Proof'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


