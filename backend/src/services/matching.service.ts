import { User } from '../models/User.js';
import { Badge } from '../models/Badge.js';
import { Portfolio } from '../models/Portfolio.js';
import { Job } from '../models/Job.js';

export interface SkillMatchResult {
  name: string;
  is_verified: boolean;
  badge_code?: string;
  score?: number;
  level?: string;
}

export interface MissingSkill {
  name: string;
  importance: 'required' | 'preferred';
}

export interface PortfolioEvidence {
  project_title: string;
  matched_skills: string[];
  live_demo_url?: string;
  github_url?: string;
}

export interface FitScoreExplanation {
  overall_percentage: number;
  matched_skills: SkillMatchResult[];
  missing_skills: MissingSkill[];
  portfolio_evidence: PortfolioEvidence[];
  ai_explanation: string;
  confidence_level: 'High' | 'Medium' | 'Low';
  verified_badge_bonus: number;
  practical_portfolio_bonus: number;
}

export async function computeJobFitScore(userId: string, jobId: string): Promise<FitScoreExplanation> {
  const userDoc = await User.findOne({ id: userId }).lean();
  const badgesRows = await Badge.find({ user_id: userId, status: 'active' }).lean();
  const portfolioRows = await Portfolio.find({ user_id: userId }).lean();
  const jobRow = await Job.findOne({ id: jobId }).lean();

  if (!jobRow) {
    throw new Error('Job not found');
  }

  const profileRow = userDoc?.profile || null;
  const userClaimedSkills: string[] = profileRow?.skills || [];
  const requiredSkillsList: { skill: string; weight: number }[] = Array.isArray(jobRow.required_skills) ? jobRow.required_skills : [];
  const preferredSkillsList: string[] = Array.isArray(jobRow.preferred_skills) ? jobRow.preferred_skills : [];

  const claimedSkillsLower = new Set(userClaimedSkills.map(s => s.trim().toLowerCase()));
  const verifiedBadgesMap = new Map<string, any>();
  badgesRows.forEach(b => {
    verifiedBadgesMap.set(b.skill_name.trim().toLowerCase(), b);
  });

  const matchedSkills: SkillMatchResult[] = [];
  const missingSkills: MissingSkill[] = [];
  let totalRequiredWeight = 0;
  let earnedRequiredWeight = 0;
  let verifiedBonusPoints = 0;

  for (const req of requiredSkillsList) {
    const skillNameLower = req.skill.trim().toLowerCase();
    const weight = req.weight || 1.0;
    totalRequiredWeight += weight;

    const isClaimed = claimedSkillsLower.has(skillNameLower);
    const badge = verifiedBadgesMap.get(skillNameLower);

    if (isClaimed || badge) {
      if (badge) {
        earnedRequiredWeight += weight;
        verifiedBonusPoints += 5;
        matchedSkills.push({
          name: req.skill,
          is_verified: true,
          badge_code: badge.badge_code,
          score: badge.score_percentage,
          level: badge.level
        });
      } else {
        earnedRequiredWeight += weight * 0.85;
        matchedSkills.push({ name: req.skill, is_verified: false });
      }
    } else {
      missingSkills.push({ name: req.skill, importance: 'required' });
    }
  }

  let earnedPreferredCount = 0;
  for (const pref of preferredSkillsList) {
    const prefNameLower = pref.trim().toLowerCase();
    const isClaimed = claimedSkillsLower.has(prefNameLower);
    const badge = verifiedBadgesMap.get(prefNameLower);

    if (isClaimed || badge) {
      earnedPreferredCount++;
      if (badge) {
        verifiedBonusPoints += 3;
        matchedSkills.push({ name: pref, is_verified: true, badge_code: badge.badge_code, score: badge.score_percentage, level: badge.level });
      } else {
        matchedSkills.push({ name: pref, is_verified: false });
      }
    } else {
      missingSkills.push({ name: pref, importance: 'preferred' });
    }
  }

  const portfolioEvidence: PortfolioEvidence[] = [];
  let practicalPortfolioBonus = 0;

  portfolioRows.forEach(port => {
    const portSkills: string[] = Array.isArray(port.skills_used) ? port.skills_used : [];
    const matchedInProject = portSkills.filter(ps =>
      requiredSkillsList.some(r => r.skill.toLowerCase() === ps.toLowerCase()) ||
      preferredSkillsList.some(p => p.toLowerCase() === ps.toLowerCase())
    );
    if (matchedInProject.length > 0) {
      portfolioEvidence.push({
        project_title: port.title,
        matched_skills: matchedInProject,
        live_demo_url: port.live_demo_url,
        github_url: port.github_url
      });
      practicalPortfolioBonus += 4;
    }
  });

  practicalPortfolioBonus = Math.min(practicalPortfolioBonus, 12);
  verifiedBonusPoints = Math.min(verifiedBonusPoints, 15);

  const baseReqPercentage = totalRequiredWeight > 0 ? (earnedRequiredWeight / totalRequiredWeight) * 75 : 0;
  const prefPercentage = preferredSkillsList.length > 0 ? (earnedPreferredCount / preferredSkillsList.length) * 15 : 10;

  let totalScore = baseReqPercentage + prefPercentage + verifiedBonusPoints + practicalPortfolioBonus;
  totalScore = Math.min(Math.max(Math.round(totalScore * 10) / 10, 10), 99.5);

  const verifiedCount = matchedSkills.filter(s => s.is_verified).length;
  const matchedCount = matchedSkills.length;
  const confidence: 'High' | 'Medium' | 'Low' =
    verifiedCount >= 2 && portfolioEvidence.length > 0 ? 'High' :
    matchedCount >= Math.ceil(requiredSkillsList.length / 2) ? 'Medium' : 'Low';

  const aiExplanation = `Match score: ${totalScore}%. ${matchedCount} skills matched (${verifiedCount} verified with credentials). ${missingSkills.filter(s => s.importance === 'required').length} required skills missing. ${portfolioEvidence.length} portfolio projects demonstrate relevant experience.`;

  return {
    overall_percentage: totalScore,
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    portfolio_evidence: portfolioEvidence,
    ai_explanation: aiExplanation,
    confidence_level: confidence,
    verified_badge_bonus: verifiedBonusPoints,
    practical_portfolio_bonus: practicalPortfolioBonus
  };
}

export async function computeDeterministicMatch(userId: string, jobId: string): Promise<FitScoreExplanation> {
  return computeJobFitScore(userId, jobId);
}
