/**
 * Evidence Data Processing Utility
 * Processes real evidence data from backend APIs
 */

export const processEvidenceData = (apiResponse) => {
  // Process real evidence data from backend APIs
  const data = apiResponse || {};

  return {
    evidence_badges: data.evidence_badges || data.badges || [],
    evidence_level: data.evidence_level || data.level || 'Unknown',
    evidence_tier: data.evidence_tier || data.tier || 'unknown',
    confidence_score: data.confidence_score || data.confidence || 0,
    supporting_papers: data.supporting_papers || data.papers || data.citations || []
  };
};

