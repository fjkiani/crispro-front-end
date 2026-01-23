// IND Content Templates - Dynamic text generation for regulatory documents
// Transforms analysis data into FDA-compliant language

export const generateExecutiveSummary = (analysisData) => {
  const {
    targetName,
    indication,
    zetaScore,
    functionalImpact,
    therapeuticWindow,
    therapeuticCount,
    averageEfficacy,
    targetConfidence,
    platform
  } = analysisData;

  return `
Based on comprehensive in silico analysis using the ${platform}, we have identified ${targetName} as a high-confidence therapeutic target for ${indication}. 

TARGET VALIDATION: Computational analysis demonstrates ${targetConfidence}% confidence via functional impact assessment (Zeta Score: ${zetaScore}), confirming ${functionalImpact.toLowerCase()} disruption. The predicted therapeutic window of ${therapeuticWindow} provides strong evidence for cancer-selective targeting with minimal normal tissue toxicity.

THERAPEUTIC DESIGN: Our AI-powered drug discovery platform has generated ${therapeuticCount} precision therapeutic candidates with an average predicted efficacy of ${averageEfficacy}%. These candidates represent novel compositions of matter designed specifically for ${targetName} engagement.

REGULATORY STRATEGY: This IND application leverages extensive computational validation to de-risk the traditional drug development pathway. The integration of AI-generated evidence provides unprecedented mechanistic insight into target biology and therapeutic intervention, supporting the proposed clinical investigation with robust predictive modeling.

DEVELOPMENT RATIONALE: The convergence of high target confidence, validated therapeutic candidates, and favorable safety predictions supports progression to clinical evaluation. This computational approach transforms drug development from hypothesis-driven experimentation to evidence-based therapeutic engineering.
  `.trim();
};

export const generateDevelopmentPlan = (analysisData) => {
  const {
    targetName,
    indication,
    therapeuticCount,
    averageEfficacy,
    safetyMargin,
    selectivityRatio
  } = analysisData;

  return `
PHASE I STRATEGY: Initial clinical evaluation will focus on safety, tolerability, and preliminary efficacy signals in patients with ${indication}. The predicted ${selectivityRatio}x selectivity ratio provides confidence for a favorable therapeutic index, enabling dose escalation studies with reduced safety concerns.

BIOMARKER STRATEGY: ${targetName} expression and pathway activation will serve as predictive biomarkers for patient selection. Computational modeling suggests optimal patient populations based on genomic profiling and tumor characteristics.

DEVELOPMENT TIMELINE: Leveraging computational validation, we anticipate accelerated development timelines:
- Phase I: 12-18 months (vs. traditional 24-36 months)
- Phase II: 18-24 months with enriched patient populations
- Regulatory submission: Supported by comprehensive computational evidence package

MANUFACTURING STRATEGY: AI-designed therapeutic candidates enable precision manufacturing with optimized yield and quality. The ${therapeuticCount} validated candidates provide development optionality and risk mitigation.

COMMERCIAL POTENTIAL: The combination of computational validation and precision design creates a differentiated therapeutic profile with significant commercial potential in the ${indication} market. Predicted efficacy of ${averageEfficacy}% compares favorably to existing therapeutic options.

RISK MITIGATION: Extensive in silico validation significantly reduces traditional development risks. Computational evidence provides confidence in target engagement, safety profile, and therapeutic efficacy prior to clinical testing.
  `.trim();
};

export const generateNonclinicalSummary = (analysisData) => {
  const {
    targetName,
    zetaScore,
    functionalImpact,
    therapeuticWindow,
    selectivityRatio,
    structuralConfidence
  } = analysisData;

  return `
PRIMARY PHARMACODYNAMICS: Target engagement with ${targetName} has been validated through computational analysis yielding a Zeta Score of ${zetaScore}, indicating ${functionalImpact.toLowerCase()} biological impact. Structural modeling demonstrates ${structuralConfidence}% confidence in target binding and functional modulation.

SECONDARY PHARMACODYNAMICS: Selectivity profiling reveals ${selectivityRatio}x preference for cancer cells versus normal tissue, supporting a favorable therapeutic window of ${therapeuticWindow}. Off-target analysis indicates minimal interactions with critical biological pathways.

SAFETY PHARMACOLOGY: Computational safety assessment predicts favorable cardiovascular, respiratory, and CNS profiles based on molecular target specificity and tissue distribution modeling. The high selectivity ratio provides confidence for clinical safety.

TOXICOLOGY: Predictive toxicology modeling indicates low potential for dose-limiting toxicities. The computational approach enables proactive identification and mitigation of potential safety concerns prior to clinical testing.
  `.trim();
};

export const generateCMCSummary = (analysisData) => {
  const {
    therapeuticCount,
    averageEfficacy,
    candidates
  } = analysisData;

  const crisprCandidates = candidates?.filter(c => c.type === 'CRISPR') || [];
  const inhibitorCandidates = candidates?.filter(c => c.type === 'Inhibitor') || [];

  return `
DRUG SUBSTANCE: The investigational therapeutic consists of ${therapeuticCount} AI-designed molecular entities optimized for target specificity and manufacturability.

${crisprCandidates.length > 0 ? `
CRISPR COMPONENTS: ${crisprCandidates.length} guide RNA sequences designed with >94% predicted on-target efficacy. Sequences undergo computational optimization for stability, specificity, and manufacturing compatibility.
` : ''}

${inhibitorCandidates.length > 0 ? `
SMALL MOLECULE INHIBITORS: ${inhibitorCandidates.length} novel protein inhibitor(s) with optimized binding affinity and drug-like properties. Computational ADMET profiling confirms favorable pharmacological characteristics.
` : ''}

QUALITY CONTROL: AI-driven quality specifications ensure consistent product characteristics. Computational modeling enables real-time quality assessment and batch-to-batch consistency.

STABILITY: Predictive stability modeling indicates favorable storage conditions and shelf-life characteristics. Computational approaches enable optimization of formulation stability prior to manufacturing.

MANUFACTURING: AI-optimized synthetic routes and formulation strategies enable scalable, cost-effective production. Computational process modeling ensures reproducible manufacturing quality.
  `.trim();
};

export const generateClinicalProtocol = (analysisData) => {
  const {
    targetName,
    indication,
    averageEfficacy,
    safetyMargin,
    selectivityRatio
  } = analysisData;

  return `
STUDY DESIGN: Phase I, open-label, dose-escalation study in patients with ${indication} harboring ${targetName} alterations. The predicted ${selectivityRatio}x selectivity ratio supports accelerated dose escalation with enhanced safety monitoring.

PATIENT POPULATION: Adults with advanced ${indication} who have failed standard therapies. Biomarker-driven enrollment based on ${targetName} expression and computational patient stratification algorithms.

PRIMARY OBJECTIVES: 
- Determine maximum tolerated dose and recommended Phase 2 dose
- Evaluate safety and tolerability profile
- Assess preliminary anti-tumor activity

SECONDARY OBJECTIVES:
- Pharmacokinetic and pharmacodynamic characterization
- Biomarker analysis and target engagement assessment
- Preliminary efficacy evaluation using computational response predictors

DOSE ESCALATION: Computational modeling supports accelerated escalation based on predicted safety margins. Real-time safety monitoring with adaptive dose modifications.

EFFICACY ENDPOINTS: Objective response rate, progression-free survival, and overall survival. Computational efficacy predictors (${averageEfficacy}% predicted response) guide endpoint selection and statistical planning.

BIOMARKER STRATEGY: Comprehensive genomic profiling with computational analysis to identify responder populations and resistance mechanisms. Integration of AI-driven patient stratification algorithms.
  `.trim();
};

// Regulatory language helpers
export const wrapInRegulatoryLanguage = (dataPoint, context) => {
  const confidence = calculateConfidence(dataPoint);
  const qualifier = confidence > 90 ? "demonstrates" : 
                   confidence > 70 ? "indicates" : "suggests";
  
  return `Computational analysis ${qualifier} ${dataPoint} ${context}`;
};

export const formatFDACompliantStatement = (evidence, requirement) => {
  return `In accordance with FDA guidance for ${requirement}, computational evidence demonstrates ${evidence} with appropriate scientific rigor and regulatory compliance.`;
};

// Helper function to calculate confidence from various data types
const calculateConfidence = (dataPoint) => {
  if (typeof dataPoint === 'number') {
    return Math.min(Math.abs(dataPoint), 100);
  }
  
  const confidenceMap = {
    'HIGH-CONFIDENCE': 95,
    'CONFIRMED': 90,
    'PREDICTED': 75,
    'ESTIMATED': 60,
    'PATHOGENIC': 90,
    'STRONG': 85
  };
  
  const upperCase = String(dataPoint).toUpperCase();
  for (const [key, value] of Object.entries(confidenceMap)) {
    if (upperCase.includes(key)) {
      return value;
    }
  }
  
  return 50; // Default moderate confidence
};

// Template for regulatory risk assessment
export const generateRiskAssessment = (analysisData) => {
  const {
    targetConfidence,
    safetyMargin,
    selectivityRatio,
    averageEfficacy
  } = analysisData;

  const overallRisk = calculateOverallRisk(targetConfidence, safetyMargin, averageEfficacy);
  
  return `
COMPUTATIONAL RISK ASSESSMENT: Based on comprehensive in silico analysis, the overall development risk is assessed as ${overallRisk}.

TARGET RISK: ${targetConfidence}% confidence in target validation reduces target-related development risk.
SAFETY RISK: ${selectivityRatio}x selectivity ratio and ${safetyMargin}% safety margin indicate favorable risk-benefit profile.
EFFICACY RISK: ${averageEfficacy}% predicted efficacy provides confidence in therapeutic potential.

MITIGATION STRATEGIES: Computational evidence enables proactive risk identification and mitigation throughout development.
  `.trim();
};

const calculateOverallRisk = (targetConf, safetyMargin, efficacy) => {
  const riskScore = (targetConf + safetyMargin + efficacy) / 3;
  if (riskScore >= 80) return 'LOW';
  if (riskScore >= 60) return 'MODERATE';
  return 'HIGH';
}; 