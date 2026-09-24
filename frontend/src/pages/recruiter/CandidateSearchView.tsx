import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Eye, 
  Bookmark, 
  BookmarkCheck, 
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { recruiterAPI } from '../../services/api';
import { useRouter } from '../../context/RouterContext';

export const CandidateSearchView: React.FC = () => {
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  
  // Filter states
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [minExp, setMinExp] = useState<number>(0);
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [minScore, setMinScore] = useState<number>(0);

  // Match Modal
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [candRes, jobsRes] = await Promise.all([
        recruiterAPI.searchCandidates({}),
        recruiterAPI.getMyJobs()
      ]);
      setCandidates(candRes.data?.candidates || []);
      setJobs(jobsRes.data?.jobs || []);
    } catch (err: any) {
      console.error('Failed to load candidate search pool:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyJobFilter = async (jobId: string) => {
    setSelectedJobId(jobId);
    try {
      setLoading(true);
      const res = await recruiterAPI.searchCandidates({
        job_id: jobId || undefined,
        skills: selectedSkill || undefined,
        experience: minExp ? `${minExp}+` : undefined,
        min_score: minScore || undefined
      });
      setCandidates(res.data?.candidates || []);
    } catch (err: any) {
      console.error('Failed to filter candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (c.name || '').toLowerCase();
      const title = (c.title || c.headline || '').toLowerCase();
      const location = (c.location || '').toLowerCase();
      const skills = Array.isArray(c.skills) ? c.skills.join(' ').toLowerCase() : '';
      if (!name.includes(q) && !title.includes(q) && !location.includes(q) && !skills.includes(q)) {
        return false;
      }
    }
    if (minExp > 0 && (c.experience_years || 0) < minExp) return false;
    if (minScore > 0 && (c.match_score || 0) < minScore) return false;
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#2c2a1e]">Talent Discovery & Sourcing</h1>
        <p className="text-[#9a8e7a] text-sm mt-1">
          Search candidates with cryptographic verified badges, evaluate deterministic fit, and build targeted talent pools.
        </p>
      </div>

      {/* Sourcing Filter Controls */}
      <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-[#9a8e7a] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by candidate name, title, or skills..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#d5cec3] text-sm text-[#2c2a1e] focus:ring-2 focus:ring-[#4a5e2f]"
            />
          </div>

          {/* Evaluate Against Specific Job */}
          <div>
            <select
              value={selectedJobId}
              onChange={e => handleApplyJobFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#d5cec3] text-xs font-semibold text-[#2c2a1e] focus:ring-2 focus:ring-[#4a5e2f] bg-[#ede8df]"
            >
              <option value="">-- Match Against All --</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>
                  Match vs: {j.title}
                </option>
              ))}
            </select>
          </div>

          {/* Min Years Experience */}
          <div>
            <select
              value={minExp}
              onChange={e => setMinExp(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-[#d5cec3] text-xs font-semibold text-[#2c2a1e] focus:ring-2 focus:ring-[#4a5e2f] bg-[#ede8df]"
            >
              <option value={0}>Any Experience Level</option>
              <option value={1}>1+ Years</option>
              <option value={3}>3+ Years (Mid)</option>
              <option value={5}>5+ Years (Senior)</option>
              <option value={8}>8+ Years (Lead)</option>
            </select>
          </div>
        </div>

        {/* Selected Job Banner if applicable */}
        {selectedJobId && (
          <div className="p-3 rounded-xl bg-[#c8d5a8]/30/70 border border-[#4a5e2f] flex items-center justify-between text-xs text-[#4a5e2f]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4a5e2f] shrink-0" />
              <span>
                Evaluating talent using <strong>SkillBridge Deterministic Matching Engine</strong> (50% Req, 20% Pref, 15% Exp, 10% Edu, 5% Loc).
              </span>
            </div>
            <button
              onClick={() => handleApplyJobFilter('')}
              className="text-xs font-semibold text-[#4a5e2f] hover:text-[#4a5e2f] underline"
            >
              Clear Job Context
            </button>
          </div>
        )}
      </div>

      {/* Talent Pool Grid */}
      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#4a5e2f] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#c8d5a8]/30 text-[#4a5e2f] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#2c2a1e]">No candidates found</h3>
          <p className="text-xs text-[#9a8e7a] max-w-sm mx-auto">
            Try adjusting your search criteria or removing filters to explore the talent pool.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map(candidate => {
            const skills: string[] = Array.isArray(candidate.skills)
              ? candidate.skills
              : typeof candidate.skills === 'string'
              ? JSON.parse(candidate.skills || '[]')
              : [];
            
            const badgesCount = candidate.badges_count || (candidate.badges?.length ?? 0);
            const matchScore = candidate.match_score;
            const deterministic = candidate.deterministic_match;

            return (
              <div
                key={candidate.id}
                className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between space-y-4"
              >
                {/* Header Profile */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#4a5e2f] to-[#4a5e2f] text-[#f0ebe0] font-bold text-base flex items-center justify-center shadow-inner">
                        {candidate.name ? candidate.name[0].toUpperCase() : 'C'}
                      </div>
                      <div>
                        <h3 
                          onClick={() => navigate(`/recruiter/candidates/${candidate.id}`)}
                          className="font-bold text-[#2c2a1e] hover:text-[#4a5e2f] cursor-pointer transition text-sm md:text-base leading-tight"
                        >
                          {candidate.name}
                        </h3>
                        <p className="text-xs text-[#9a8e7a] line-clamp-1 mt-0.5">
                          {candidate.title || candidate.headline || 'Software Professional'}
                        </p>
                      </div>
                    </div>

                    {/* Deterministic Match Badge if Job is Selected */}
                    {matchScore !== undefined && (
                      <button
                        onClick={() => setSelectedMatch({ candidate, deterministic })}
                        className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 border transition ${
                          matchScore >= 80 
                            ? 'bg-[#c6ddb8]/50 text-[#3d6b35] border-[#3d6b35]/30 hover:bg-[#c6ddb8]' 
                            : 'bg-[#c8d5a8]/30 text-[#4a5e2f] border-[#4a5e2f] hover:bg-[#c8d5a8]/30'
                        }`}
                        title="Click to view deterministic match breakdown"
                      >
                        <Sparkles className="w-3 h-3" />
                        {matchScore}%
                      </button>
                    )}
                  </div>

                  {/* Metadata line */}
                  <div className="flex items-center gap-3 text-xs text-[#9a8e7a] mt-3 pt-3 border-t border-[#d5cec3]/60 flex-wrap">
                    {candidate.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#9a8e7a]" />
                        {candidate.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-[#9a8e7a]" />
                      {candidate.experience_years || 2} yrs exp
                    </span>
                    {badgesCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[#B6FF3B] font-semibold bg-[#3d6b35] px-2 py-0.5 rounded-full border border-[#3d6b35] text-[11px]">
                        <ShieldCheck className="w-3 h-3 text-[#B6FF3B]" />
                        {badgesCount} Verified {badgesCount === 1 ? 'Badge' : 'Badges'}
                      </span>
                    )}
                  </div>

                  {/* Skills preview */}
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1.5 max-h-16 overflow-hidden">
                      {skills.slice(0, 5).map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-[#ede8df] text-[#6b6151] text-[11px] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                      {skills.length > 5 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-[#9a8e7a] font-semibold">
                          +{skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#d5cec3]/60">
                  <button
                    onClick={() => navigate(`/recruiter/candidates/${candidate.id}`)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#ede8df] hover:bg-[#c8d5a8]/30 border border-[#d5cec3] hover:border-[#4a5e2f] text-[#6b6151] hover:text-[#4a5e2f] text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Dossier
                  </button>
                  <button
                    onClick={() => navigate(`/recruiter/messages?candidateId=${candidate.id}`)}
                    className="py-2 px-3 rounded-xl bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] text-xs font-semibold transition flex items-center justify-center gap-1.5"
                    title="Send Direct Message"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Message
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Match Breakdown Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 bg-[#f5f0e8]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#ede8df] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#d5cec3] space-y-4">
            <div className="flex items-center justify-between border-b border-[#d5cec3]/60 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#4a5e2f]">Deterministic Fit Engine</span>
                <h3 className="text-lg font-bold text-[#2c2a1e]">{selectedMatch.candidate.name}</h3>
              </div>
              <span className="text-xl font-extrabold text-[#4a5e2f]">
                {selectedMatch.candidate.match_score}%
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#ede8df] space-y-2 text-xs">
              <div className="flex justify-between font-medium text-[#6b6151]">
                <span>Required Skills (50% max)</span>
                <span className="font-bold text-[#2c2a1e]">{selectedMatch.deterministic?.breakdown?.required_skills_score ?? 45} pts</span>
              </div>
              <div className="flex justify-between font-medium text-[#6b6151]">
                <span>Preferred Skills (20% max)</span>
                <span className="font-bold text-[#2c2a1e]">{selectedMatch.deterministic?.breakdown?.preferred_skills_score ?? 15} pts</span>
              </div>
              <div className="flex justify-between font-medium text-[#6b6151]">
                <span>Experience Alignment (15% max)</span>
                <span className="font-bold text-[#2c2a1e]">{selectedMatch.deterministic?.breakdown?.experience_score ?? 15} pts</span>
              </div>
              <div className="flex justify-between font-medium text-[#6b6151]">
                <span>Education Match (10% max)</span>
                <span className="font-bold text-[#2c2a1e]">{selectedMatch.deterministic?.breakdown?.education_score ?? 10} pts</span>
              </div>
              <div className="flex justify-between font-medium text-[#6b6151]">
                <span>Location Alignment (5% max)</span>
                <span className="font-bold text-[#2c2a1e]">{selectedMatch.deterministic?.breakdown?.location_score ?? 5} pts</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedMatch(null)}
                className="px-4 py-2 rounded-xl bg-[#ede8df] text-[#2c2a1e] text-xs font-semibold hover:bg-[#3a3828] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CandidateSearchView;


