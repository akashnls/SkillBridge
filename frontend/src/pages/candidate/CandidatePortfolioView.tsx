import React, { useState, useEffect } from 'react';
import { portfolioAPI, PortfolioProject } from '../../services/api.js';
import { PageHeader } from '../../components/PageHeader.js';
import {
  FolderGit2,
  Plus,
  Trash2,
  ExternalLink,
  Code2,
  Globe,
  Tag,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  X
} from 'lucide-react';

export const CandidatePortfolioView: React.FC = () => {
  const [portfolios, setPortfolios] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsUsed, setSkillsUsed] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [mediaUrls, setMediaUrls] = useState('');
  const [roleOnProject, setRoleOnProject] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      setLoading(true);
      const res = await portfolioAPI.getMyPortfolios();
      if (res.data?.success) {
        setPortfolios(res.data.portfolios || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load portfolio projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Title and description are required');
      return;
    }

    try {
      setSubmitting(true);
      const skillsArray = skillsUsed
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const mediaArray = mediaUrls
        .split(',')
        .map(u => u.trim())
        .filter(Boolean);

      const payload = {
        project_title: title.trim(),
        description: description.trim(),
        skills_used: skillsArray,
        github_url: githubUrl.trim() || undefined,
        live_demo_url: liveDemoUrl.trim() || undefined,
        media_urls: mediaArray,
        role_on_project: roleOnProject.trim() || undefined,
        duration: duration.trim() || undefined
      };

      const res = await portfolioAPI.createPortfolio(payload);
      if (res.data?.success) {
        setShowModal(false);
        resetForm();
        await loadPortfolios();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create portfolio project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await portfolioAPI.deletePortfolio(id);
      setPortfolios(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSkillsUsed('');
    setGithubUrl('');
    setLiveDemoUrl('');
    setMediaUrls('');
    setRoleOnProject('');
    setDuration('');
  };

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
        badge="EVIDENCE PORTFOLIO"
        badgeSubtext="Proof of Work & Code Artifacts"
        icon={<FolderGit2 className="w-6 h-6" />}
        title="Project Portfolio"
        subtitle="Prove your real-world capability with tangible project evidence. Employers award up to +15% matching bonus for practical evidence."
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="sb-btn-primary px-4 py-2.5 text-xs font-bold shadow-[0_0_15px_rgba(182,255,59,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        }
      />

      {/* Projects Grid */}
      {portfolios.length === 0 ? (
        <div className="p-12 bg-[#f5f0e8]/60 rounded-2xl border border-[#4a4636] text-center space-y-3">
          <FolderGit2 className="w-12 h-12 text-[#9a8e7a] mx-auto" />
          <h3 className="text-base font-bold text-[#f0ebe0]">No Portfolio Projects Yet</h3>
          <p className="text-xs text-[#9a8e7a] max-w-sm mx-auto">
            Adding verified projects with GitHub links and live demos gives recruiters concrete proof of your coding skills.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] rounded-xl text-xs font-semibold cursor-pointer"
          >
            Add Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolios.map((proj) => {
            const skills: string[] = typeof proj.skills_used === 'string'
              ? JSON.parse(proj.skills_used || '[]')
              : proj.skills_used || [];

            return (
              <div
                key={proj.id}
                className="p-5 bg-[#f5f0e8]/70 rounded-2xl border border-[#4a4636] hover:border-[#4a4636] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-[#f0ebe0]">{proj.project_title}</h3>
                      {proj.role_on_project && (
                        <span className="text-xs text-[#4a5e2f] font-semibold">{proj.role_on_project}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="p-1.5 text-[#9a8e7a] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-[#b5aa96] mb-4 line-clamp-3 leading-relaxed">
                    {proj.description}
                  </p>

                  {/* Skills tags */}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#B6FF3B]/10 text-white border border-[#B6FF3B]/30"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#4a4636]/80 flex items-center justify-between text-xs">
                  {proj.duration && (
                    <span className="text-[#9a8e7a] flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span>{proj.duration}</span>
                    </span>
                  )}

                  <div className="flex items-center gap-3 ml-auto">
                    {proj.github_url && (
                      <a
                        href={proj.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#b5aa96] hover:text-[#f0ebe0] flex items-center gap-1 font-semibold"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Code</span>
                      </a>
                    )}
                    {proj.live_demo_url && (
                      <a
                        href={proj.live_demo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#4a5e2f] hover:text-[#4a5e2f] flex items-center gap-1 font-semibold"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#f5f0e8] border border-[#4a4636] rounded-2xl max-w-lg w-full p-6 space-y-4 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-[#9a8e7a] hover:text-[#f0ebe0] p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-black text-[#f0ebe0]">Add Project to Portfolio</h2>
              <p className="text-xs text-[#9a8e7a] mt-1">Showcase your practical engineering work</p>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Task Queue in Go"
                  className="w-full px-3.5 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-xs text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the architectural design, problem solved, and measurable results..."
                  className="w-full px-3.5 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-xs text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#b5aa96] mb-1">
                  Technologies / Skills Used (comma separated)
                </label>
                <input
                  type="text"
                  value={skillsUsed}
                  onChange={(e) => setSkillsUsed(e.target.value)}
                  placeholder="e.g. React, Node.js, PostgreSQL, Redis"
                  className="w-full px-3.5 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-xs text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#b5aa96] mb-1">GitHub Repository URL</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3.5 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-xs text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    value={liveDemoUrl}
                    onChange={(e) => setLiveDemoUrl(e.target.value)}
                    placeholder="https://myproject.com"
                    className="w-full px-3.5 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-xs text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Role on Project</label>
                  <input
                    type="text"
                    value={roleOnProject}
                    onChange={(e) => setRoleOnProject(e.target.value)}
                    placeholder="e.g. Lead Architect, Full-Stack Dev"
                    className="w-full px-3.5 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-xs text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 3 months (Jan - Mar 2024)"
                    className="w-full px-3.5 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-xs text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#4a4636]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-[#f5f0e8] hover:bg-[#3a3828] text-[#b5aa96] rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


