import React, { useState, useEffect } from 'react';
import { PortfolioProject } from '../types/index.js';
import { portfolioAPI } from '../services/api.js';
import {
  FolderGit2,
  Plus,
  Trash2,
  ExternalLink,
  GitBranch,
  CheckCircle2,
  Code2,
  Sparkles,
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
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Non-Traditional Learner Showcase
            </span>
          </div>
          <h2 className="text-xl font-black text-white">{t('nav_portfolio')}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            In skill-first hiring, empirical project proofs directly feed into your AI Job-Fit score and give recruiters tangible proof of your problem-solving abilities.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 shrink-0 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Practical Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading practical portfolios...</div>
      ) : portfolios.length === 0 ? (
        <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-12 text-center space-y-4">
          <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Practical Projects Added Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Self-taught developers and bootcamp graduates can dramatically increase interview callbacks by showcasing 2-3 real GitHub repositories with live deployed demos.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Add Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolios.map((project) => (
            <div
              key={project.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-cyan-950/20 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {project.title}
                  </h3>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">{project.description}</p>

                {project.problem_solved && (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4 text-xs">
                    <span className="text-indigo-400 font-bold flex items-center gap-1.5 mb-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Real-World Problem Solved
                    </span>
                    <p className="text-slate-400 leading-relaxed">{project.problem_solved}</p>
                  </div>
                )}

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.skills_used.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-cyan-950/40 text-cyan-300 border border-cyan-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80 text-xs">
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-slate-300 hover:text-white font-semibold transition-colors"
                  >
                    <GitBranch className="w-4 h-4 text-slate-400" />
                    <span>Source Code</span>
                  </a>
                )}
                {project.live_demo_url && (
                  <a
                    href={project.live_demo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Add Non-Traditional Project Proof</h3>

            <form onSubmit={handleAddProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Task Queue & Worker System"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Architecture & Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain system architecture, technical decisions, and how components interact..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Practical Problem Solved</label>
                <input
                  type="text"
                  placeholder="e.g. Reduced queue processing latency by 45% using Redis streams"
                  value={problemSolved}
                  onChange={e => setProblemSolved(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Technologies / Skills (Comma-separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React, Node.js, SQL, Redis, Docker"
                  value={skillsInput}
                  onChange={e => setSkillsInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">GitHub Repo URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={e => setGithubUrl(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    placeholder="https://my-app.vercel.app"
                    value={liveDemoUrl}
                    onChange={e => setLiveDemoUrl(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/25"
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
