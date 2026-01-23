/**
 * ⚔️ CLINICAL GENOMICS COPILOT INTEGRATION ⚔️
 * 
 * Embeds CoPilot functionality into Clinical Genomics Command Center:
 * - Context-aware variant questions
 * - Quick actions for each analysis type
 * - Suggested questions based on results
 * - Integration with global CoPilot drawer
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { useCoPilot } from '../../CoPilot/context/CoPilotContext';
import { useCoPilotIntegration } from '../../CoPilot/hooks/useCoPilotIntegration';
import { useClinicalGenomicsContext } from '../context/ClinicalGenomicsContext';

export const useClinicalGenomicsCoPilot = () => {
  const { setIsOpen, setCurrentPage, setCurrentVariant, setCurrentDisease, setChatHistory } = useCoPilot();
  const { variant, patientProfile, results } = useClinicalGenomicsContext();

  // Initialize CoPilot integration
  const copilot = useCoPilotIntegration({
    page: 'clinical-genomics',
    variant: variant.gene ? variant : null,
    disease: patientProfile.cancer_type || ''
  });

  // Quick action: Ask about ACMG classification
  const askAboutACMG = () => {
    if (!variant.gene) return;
    
    const question = results.acmg 
      ? `Explain why ${variant.gene} ${variant.hgvs_p || variant.chrom + ':' + variant.pos} was classified as "${results.acmg.classification}"`
      : `What ACMG criteria would apply to ${variant.gene} ${variant.hgvs_p || variant.chrom + ':' + variant.pos}?`;
    
    setIsOpen(true);
    setChatHistory(prev => [...prev, {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    }]);
  };

  // Quick action: Ask about drug interactions
  const askAboutDrugInteractions = () => {
    if (!variant.gene || !patientProfile.current_drugs.length) return;
    
    const drugs = patientProfile.current_drugs.join(', ');
    const question = `How does ${variant.gene} ${variant.hgvs_p || 'mutation'} affect the metabolism or efficacy of ${drugs}?`;
    
    setIsOpen(true);
    setChatHistory(prev => [...prev, {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    }]);
  };

  // Quick action: Ask about resistance mechanisms
  const askAboutResistance = () => {
    if (!variant.gene) return;
    
    const question = results.resistance
      ? `What are the molecular mechanisms behind the ${results.resistance.risk} resistance risk for ${variant.gene} ${variant.hgvs_p || 'mutation'}?`
      : `What drug resistance mechanisms are associated with ${variant.gene} mutations?`;
    
    setIsOpen(true);
    setChatHistory(prev => [...prev, {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    }]);
  };

  // Quick action: Ask about clinical trials
  const askAboutTrials = () => {
    if (!variant.gene || !patientProfile.cancer_type) return;
    
    const question = results.trials?.trials?.length
      ? `Which of these ${results.trials.trials.length} clinical trials has the best fit for ${variant.gene} ${variant.hgvs_p} in ${patientProfile.cancer_type}?`
      : `Are there any clinical trials targeting ${variant.gene} mutations in ${patientProfile.cancer_type}?`;
    
    setIsOpen(true);
    setChatHistory(prev => [...prev, {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    }]);
  };

  // Quick action: Ask about toxicity (NEW - P1)
  const askAboutToxicity = () => {
    if (!results.toxicity || results.toxicity.risk_score < 0.3) return;
    
    const risk_level = results.toxicity.risk_score >= 0.7 ? 'high' : 
                       results.toxicity.risk_score >= 0.5 ? 'moderate' : 'low';
    
    const factors = results.toxicity.factors
      ?.map(f => f.detail)
      .join(', ') || 'toxicity factors';
    
    const moa = results.toxicity.candidate?.moa || 'this therapy';
    
    const question = `Why does this patient have a ${risk_level} toxicity risk for ${moa}? Explain: ${factors}`;
    
    setIsOpen(true);
    setChatHistory(prev => [...prev, {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
      context: {
        toxicity_factors: results.toxicity.factors,
        risk_score: results.toxicity.risk_score,
        germline_variants: results.toxicity.patient?.germlineVariants
      }
    }]);
  };

  // Quick action: Ask about guide design (NEW - P1)
  const askAboutGuideDesign = () => {
    if (!results.offtarget || !results.offtarget.guides) return;
    
    const risky_guides = results.offtarget.guides.filter(g => g.heuristic_score < 0.7);
    
    if (risky_guides.length === 0) return;
    
    const gc_values = risky_guides.map(g => (g.gc_content * 100).toFixed(0) + '%').join(', ');
    const risk_label = risky_guides.some(g => g.heuristic_score < 0.5) ? 'high' : 'moderate';
    
    const question = `These CRISPR guides have ${risk_label} off-target risk (GC: ${gc_values}). How can I optimize for ${variant.gene || 'target gene'} targeting?`;
    
    setIsOpen(true);
    setChatHistory(prev => [...prev, {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
      context: {
        guides: risky_guides,
        target_gene: variant.gene
      }
    }]);
  };

  // Quick action: Ask about alternatives (NEW - P1)
  const askAboutAlternatives = () => {
    if (!results.toxicity || !results.efficacy) return;
    if (results.toxicity.risk_score < 0.5) return;
    
    const top_drug = results.efficacy.drugs?.[0];
    const risk_pct = (results.toxicity.risk_score * 100).toFixed(0);
    const factor_types = results.toxicity.factors?.map(f => f.type).join(' + ') || 'multiple factors';
    
    const question = `Given the high toxicity risk (${risk_pct}%) for ${top_drug?.name || 'this therapy'} due to ${factor_types}, what alternative therapies should I consider for ${patientProfile.cancer_type || 'this disease'} with ${variant.gene} mutation?`;
    
    setIsOpen(true);
    setChatHistory(prev => [...prev, {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
      context: {
        toxicity_factors: results.toxicity.factors,
        efficacy_ranking: results.efficacy.drugs,
        disease: patientProfile.cancer_type,
        variant: variant
      }
    }]);
  };

  // Quick action: Explain SAE features (NEW - SAE P0)
  const explainSAEFeatures = () => {
    if (!results.efficacy?.sae_features) return;
    
    const features = results.efficacy.sae_features;
    const boosting = features.boosting_features || [];
    const limiting = features.limiting_features || [];
    
    if (boosting.length === 0 && limiting.length === 0) return;
    
    const boostingNames = boosting.join(', ') || 'none';
    const limitingNames = limiting.join(', ') || 'none';
    const impactPct = ((features.overall_impact || 0) * 100).toFixed(0);
    
    const question = `Explain why confidence is ${impactPct > 0 ? 'boosted' : 'limited'} by these SAE features: Boosting (${boostingNames}), Limiting (${limitingNames}). What do these features mean for ${variant.gene} ${variant.hgvs_p || 'mutation'} in ${patientProfile.cancer_type || 'this cancer'}?`;
    
    setIsOpen(true);
    setChatHistory(prev => [...prev, {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
      context: {
        sae_features: features,
        variant: variant,
        disease: patientProfile.cancer_type
      }
    }]);
  };

  // Context-aware suggested questions
  const getSuggestedQuestions = () => {
    const questions = [];

    if (variant.gene) {
      questions.push(
        `What is the functional impact of ${variant.gene} ${variant.hgvs_p || 'mutations'}?`,
        `What pathways are disrupted by ${variant.gene} alterations?`
      );
    }

    if (results.acmg) {
      questions.push(
        `Why is this variant classified as ${results.acmg.classification}?`,
        `What evidence would change this ACMG classification?`
      );
    }

    if (results.pharmgkb) {
      questions.push(
        `How should drug dosing be adjusted for this metabolizer status?`,
        `What alternative drugs should be considered?`
      );
    }

    if (results.resistance) {
      questions.push(
        `How can we overcome this resistance mechanism?`,
        `What combination therapies might work?`
      );
    }

    if (results.trials) {
      questions.push(
        `Which trial has the best eligibility match?`,
        `What are the expected outcomes for these trials?`
      );
    }

    // NEW: Toxicity questions (P1)
    if (results.toxicity) {
      if (results.toxicity.risk_score >= 0.5) {
        questions.push(
          `How should I adjust dosing for these pharmacogene variants?`,
          `What monitoring should I recommend given this toxicity risk?`
        );
      }
      if (results.toxicity.factors?.some(f => f.type === 'germline')) {
        questions.push(
          `Are there drug-drug interactions that could worsen toxicity?`
        );
      }
    }

    // NEW: Off-target questions (P1)
    if (results.offtarget) {
      const risky = results.offtarget.guides?.filter(g => g.heuristic_score < 0.7);
      if (risky && risky.length > 0) {
        questions.push(
          `What genome regions are most at risk for off-target edits?`,
          `How do I validate these guides experimentally?`
        );
      }
    }

    // NEW: Combined efficacy + toxicity questions (P1)
    if (results.toxicity && results.efficacy) {
      questions.push(
        `What's the therapeutic window for this patient?`,
        `How do I balance efficacy vs. toxicity risk?`
      );
    }

    if (patientProfile.cancer_type) {
      questions.push(
        `What is the prognosis for ${variant.gene} mutations in ${patientProfile.cancer_type}?`,
        `What are standard-of-care treatments for this genomic profile?`
      );
    }

    return questions;
  };

  return {
    askAboutACMG,
    askAboutDrugInteractions,
    askAboutResistance,
    askAboutTrials,
    askAboutToxicity,        // NEW - P1
    askAboutGuideDesign,     // NEW - P1
    askAboutAlternatives,    // NEW - P1
    explainSAEFeatures,      // NEW - SAE P0
    getSuggestedQuestions,
    openCoPilot: () => setIsOpen(true)
  };
};

/**
 * Quick Actions Component
 * Displays context-aware CoPilot action buttons
 */
export const ClinicalGenomicsQuickActions = ({ additionalResults = {} }) => {
  const { variant, patientProfile, results: contextResults } = useClinicalGenomicsContext();
  const copilot = useClinicalGenomicsCoPilot();

  // Merge context results with additional results (e.g., from MechanisticEvidenceTab)
  const results = { ...contextResults, ...additionalResults };

  if (!variant.gene) return null;

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ width: '100%', mb: 0.5 }}>
        💬 Ask Co-Pilot:
      </Typography>
      
      {results.acmg && (
        <Chip
          label="Why this ACMG classification?"
          size="small"
          variant="outlined"
          onClick={copilot.askAboutACMG}
          sx={{ cursor: 'pointer' }}
        />
      )}

      {patientProfile.current_drugs.length > 0 && (
        <Chip
          label="Drug interactions?"
          size="small"
          variant="outlined"
          onClick={copilot.askAboutDrugInteractions}
          sx={{ cursor: 'pointer' }}
        />
      )}

      {results.resistance && (
        <Chip
          label="Explain resistance?"
          size="small"
          variant="outlined"
          onClick={copilot.askAboutResistance}
          sx={{ cursor: 'pointer' }}
        />
      )}

      {patientProfile.cancer_type && (
        <Chip
          label="Find trials?"
          size="small"
          variant="outlined"
          onClick={copilot.askAboutTrials}
          sx={{ cursor: 'pointer' }}
        />
      )}

      {/* NEW: Toxicity action (P1) */}
      {results.toxicity && results.toxicity.risk_score >= 0.3 && (
        <Chip
          label="Why is this toxic?"
          size="small"
          variant="outlined"
          color={results.toxicity.risk_score >= 0.7 ? 'error' : results.toxicity.risk_score >= 0.5 ? 'warning' : 'default'}
          onClick={copilot.askAboutToxicity}
          sx={{ cursor: 'pointer' }}
        />
      )}

      {/* NEW: Off-target action (P1) */}
      {results.offtarget?.guides?.some(g => g.heuristic_score < 0.7) && (
        <Chip
          label="Design safer guides?"
          size="small"
          variant="outlined"
          color="secondary"
          onClick={copilot.askAboutGuideDesign}
          sx={{ cursor: 'pointer' }}
        />
      )}

      {/* NEW: Alternatives action (P1) */}
      {results.toxicity && results.efficacy && results.toxicity.risk_score >= 0.5 && (
        <Chip
          label="Alternative therapies?"
          size="small"
          variant="outlined"
          color="info"
          onClick={copilot.askAboutAlternatives}
          sx={{ cursor: 'pointer' }}
        />
      )}

      {/* NEW: SAE Features action (SAE P0) */}
      {results.efficacy?.sae_features && 
       (results.efficacy.sae_features.boosting_features?.length > 0 || 
        results.efficacy.sae_features.limiting_features?.length > 0) && (
        <Chip
          label="Explain features?"
          size="small"
          variant="outlined"
          color="success"
          onClick={copilot.explainSAEFeatures}
          sx={{ cursor: 'pointer', fontWeight: 'bold' }}
        />
      )}

      <Chip
        label="Open Co-Pilot →"
        size="small"
        color="primary"
        onClick={copilot.openCoPilot}
        sx={{ cursor: 'pointer' }}
      />
    </Box>
  );
};

/**
 * Suggested Questions Component
 * Displays context-aware suggested questions
 */
export const ClinicalGenomicsSuggestedQuestions = () => {
  const copilot = useClinicalGenomicsCoPilot();
  const { setIsOpen, setChatHistory } = useCoPilot();
  const suggestions = copilot.getSuggestedQuestions();

  if (suggestions.length === 0) return null;

  const handleQuestionClick = (question) => {
    setIsOpen(true);
    setChatHistory(prev => [...prev, {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    }]);
  };

  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        💡 Suggested Questions:
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {suggestions.slice(0, 5).map((q, i) => (
          <Chip
            key={i}
            label={q}
            size="small"
            variant="outlined"
            onClick={() => handleQuestionClick(q)}
            sx={{ 
              cursor: 'pointer',
              justifyContent: 'flex-start',
              '& .MuiChip-label': { textAlign: 'left' }
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default {
  useClinicalGenomicsCoPilot,
  ClinicalGenomicsQuickActions,
  ClinicalGenomicsSuggestedQuestions
};

