// Efficacy feature types and defaults
export const defaultPathwayScores = {
  ras_mapk: 0,
  tp53: 0,
};

export const defaultDrug = {
  name: "",
  moa: "",
  efficacy_score: 0,
  confidence: 0,
  rationale: [], // [{type:'sequence'|'pathway'|'evidence', ...}]
};

export const defaultEfficacyResult = {
  use_case: "myeloma",
  drugs: [],
  pathway_scores: { ...defaultPathwayScores },
  sequence_details: [],
  evidence: {},
}; 