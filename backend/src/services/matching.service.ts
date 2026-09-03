import { db } from '../db/database.js';

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

export function computeJobFitScore(userId: string, jobId: string): FitScoreExplanation {
  // 1. Fetch user profile, skills, badges, portfolios
  const profileRow = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId) as any;
  const badgesRows = db.prepare("SELECT * FROM badges WHERE user_id = ? AND status = 'active'").all(userId) as any[];
  const portfolioRows = db.prepare('SELECT * FROM portfolios WHERE user_id = ?').all(userId) as any[];
  const jobRow = db.prepare('SELECT * FROM jobs WHERE id = ?').get(jobId) as any;

  if (!jobRow) {
    throw new Error('Job not found');
  }

  const userClaimedSkills: string[] = profileRow?.skills ? JSON.parse(profileRow.skills) : [];
  const requiredSkillsList: { skill: string; weight: number }[] = JSON.parse(jobRow.required_skills || '[]');
  const preferredSkillsList: string[] = JSON.parse(jobRow.preferred_skills || '[]');

  // Create lookup maps
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

  // Process required skills
  for (const req of requiredSkillsList) {
    const skillNameLower = req.skill.trim().toLowerCase();
    const weight = req.weight || 1.0;
    totalRequiredWeight += weight;

    const isClaimed = claimedSkillsLower.has(skillNameLower);
    const badge = verifiedBadgesMap.get(skillNameLower);

    if (isClaimed || badge) {
      if (badge) {
        // Full score + verified credential multiplier
        earnedRequiredWeight += weight;
        verifiedBonusPoints += 5; // Extra bonus for verified credential
        matchedSkills.push({
          name: req.skill,
          is_verified: true,
          badge_code: badge.badge_code,
          score: badge.score_percentage,
          level: badge.level
        });
      } else {
        earnedRequiredWeight += weight * 0.85; // Unverified self-reported skill
        matchedSkills.push({
          name: req.skill,
          is_verified: false
        });
      }
    } else {
      missingSkills.push({
        name: req.skill,
        importance: 'required'
      });
    }
  }

  // Process preferred skills
  let earnedPreferredCount = 0;
  for (const pref of preferredSkillsList) {
    const prefNameLower = pref.trim().toLowerCase();
    const isClaimed = claimedSkillsLower.has(prefNameLower);
    const badge = verifiedBadgesMap.get(prefNameLower);

    if (isClaimed || badge) {
      earnedPreferredCount++;
      if (badge) {
        verifiedBonusPoints += 3;
        matchedSkills.push({
          name: pref,
          is_verified: true,
          badge_code: badge.badge_code,
          score: badge.score_percentage,
          level: badge.level
        });
      } else {
        matchedSkills.push({
          name: pref,
          is_verified: false
        });
      }
    } else {
      missingSkills.push({
        name: pref,
        importance: 'preferred'
      });
    }
  }

  // Check practical portfolio evidence
  const portfolioEvidence: PortfolioEvidence[] = [];
  let practicalPortfolioBonus = 0;

  portfolioRows.forEach(port => {
    const portSkills: string[] = port.skills_used ? JSON.parse(port.skills_used) : [];
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

  practicalPortfolioBonus = Math.min(practicalPortfolioBonus, 12); // cap portfolio bonus at 12%
  verifiedBonusPoints = Math.min(verifiedBonusPoints, 15); // cap verified bonus at 15%

  // Compute Base Raw Percentage
  const baseReqPercentage = totalRequiredWeight > 0 ? (earnedRequiredWeight / totalRequiredWeight) * 75 : 0;
  const prefPercentage = preferredSkillsList.length > 0 ? (earnedPreferredCount / preferredSkillsList.length) * 15 : 10;

  let totalScore = baseReqPercentage + prefPercentage + verifiedBonusPoints + practicalPortfolioBonus;
  totalScore = Math.min(Math.max(Math.round(totalScore * 10) / 10, 10), 99.5);

  let confidenceLevel: 'High' | 'Medium' | 'Low' = 'Low';
  if (matchedSkills.filter(s => s.is_verified).length >= 2 || portfolioEvidence.length >= 2) {
    confidenceLevel = 'High';
  } else if (matchedSkills.length >= 2) {
    confidenceLevel = 'Medium';
  }

  // Synthesize explainable AI narrative
  const verifiedCount = matchedSkills.filter(s => s.is_verified).length;
  const missingReqCount = missingSkills.filter(s => s.importance === 'required').length;

  let aiExplanation = '';
  if (totalScore >= 80) {
    aiExplanation = `Outstanding candidate compatibility (${totalScore}%). Candidate demonstrates ${matchedSkills.length} matching competencies, with ${verifiedCount} backed by tamper-proof digital micro-credentials. `;
    if (portfolioEvidence.length > 0) {
      aiExplanation += `Practical project evidence (${portfolioEvidence.map(p => `"${p.project_title}"`).join(', ')}) provides empirical proof of applied competency. `;
    }
    if (missingSkills.length > 0) {
      aiExplanation += `Minor skill gaps identified: ${missingSkills.map(m => m.name).join(', ')}. Recommend 1-click Skill Gap Roadmap to reach 100% readiness.`;
    }
  } else if (totalScore >= 55) {
    aiExplanation = `Moderate candidate compatibility (${totalScore}%). Demonstrates solid foundation in ${matchedSkills.map(s => s.name).slice(0, 3).join(', ')}. `;
    if (missingReqCount > 0) {
      aiExplanation += `Key missing requirements include ${missingSkills.filter(m => m.importance === 'required').map(m => m.name).join(', ')}. `;
    }
    aiExplanation += `Candidate can boost this score by upskilling via the personalized 4-step roadmap and completing micro-credential assessments.`;
  } else {
    aiExplanation = `Emerging candidate profile (${totalScore}%). Demonstrates preliminary interest but lacks several core required proficiencies (${missingSkills.slice(0, 3).map(m => m.name).join(', ')}). Immediate enrollment in a guided learning roadmap is recommended.`;
  }

  return {
    overall_percentage: totalScore,
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    portfolio_evidence: portfolioEvidence,
    ai_explanation: aiExplanation,
    confidence_level: confidenceLevel,
    verified_badge_bonus: verifiedBonusPoints,
    practical_portfolio_bonus: practicalPortfolioBonus
  };
}
