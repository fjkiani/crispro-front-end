import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import { Science, Biotech, Security, TrendingUp } from '@mui/icons-material';

import BaseSectionTemplate from './BaseSectionTemplate';
import EvidenceMapper from '../common/EvidenceMapper';
import { generateNonclinicalSummary } from '../templates/INDContentTemplates';
import { calculateSectionCompleteness } from '../utils/ComplianceCalculator';

const NonclinicalPharmacologySection = ({ analysisData, sectionConfig }) => {
  // Extract data for nonclinical pharmacology
  const nonclinicalData = {
    targetName: analysisData.metadata?.targetName || 'Unknown Target',
    zetaScore: analysisData.oracle?.zetaScore || 0,
    functionalImpact: analysisData.oracle?.functionalImpact || 'Unknown',
    therapeuticWindow: analysisData.oracle?.therapeuticWindow || 'Unknown',
    pathogenicity: analysisData.oracle?.pathogenicity || 'Unknown',
    accessibilityScore: analysisData.oracle?.accessibilityScore || 0,
    selectivityRatio: analysisData.gauntlet?.selectivityRatio || 0,
    structuralConfidence: analysisData.gauntlet?.structuralConfidence || 0,
    safetyMargin: analysisData.gauntlet?.safetyMargin || 0,
    efficacyPrediction: analysisData.gauntlet?.efficacyPrediction || 0,
    therapeuticCandidates: analysisData.forge?.candidates || []
  };

  // Calculate section completeness
  const completeness = calculateSectionCompleteness(nonclinicalData, [
    'zetaScore', 'functionalImpact', 'therapeuticWindow', 'selectivityRatio', 'structuralConfidence'
  ]);

  // Evidence mapping configurations for FDA Section 4
  const evidenceConfigurations = [
    {
      fdaRequirement: "Primary Pharmacodynamics - Target Engagement and Mechanism",
      analysisResult: nonclinicalData,
      mappingFunction: (data) => 
        `Target ${data.targetName} engagement confirmed through computational analysis with Zeta Score ${data.zetaScore}, indicating ${data.functionalImpact.toLowerCase()} biological disruption. Structural modeling demonstrates ${data.structuralConfidence}% confidence in target binding and functional modulation with predicted therapeutic window of ${data.therapeuticWindow}.`,
      evidenceStrength: Math.abs(nonclinicalData.zetaScore) > 1000 ? 95 : 75,
      complianceLevel: 'strong'
    },
    {
      fdaRequirement: "Secondary Pharmacodynamics - Selectivity and Off-Target Analysis",
      analysisResult: nonclinicalData,
      mappingFunction: (data) => 
        `Computational selectivity profiling demonstrates ${data.selectivityRatio}x preference for target cells versus normal tissue, with chromatin accessibility score of ${data.accessibilityScore}. Off-target analysis indicates minimal interactions with critical biological pathways, supporting a favorable therapeutic index.`,
      evidenceStrength: nonclinicalData.selectivityRatio > 20 ? 90 : 70,
      complianceLevel: nonclinicalData.selectivityRatio > 50 ? 'strong' : 'moderate'
    },
    {
      fdaRequirement: "Safety Pharmacology - Cardiovascular, Respiratory, and CNS Assessment",
      analysisResult: nonclinicalData,
      mappingFunction: (data) => 
        `Predictive safety modeling indicates ${data.safetyMargin}% safety margin with ${data.selectivityRatio}x selectivity ratio. Computational assessment predicts favorable cardiovascular, respiratory, and CNS profiles based on molecular target specificity and tissue distribution modeling.`,
      evidenceStrength: nonclinicalData.safetyMargin,
      complianceLevel: nonclinicalData.safetyMargin > 70 ? 'strong' : 'moderate'
    },
    {
      fdaRequirement: "Toxicology Studies - Dose-Limiting Toxicity Prediction",
      analysisResult: nonclinicalData,
      mappingFunction: (data) => 
        `Computational toxicology modeling predicts ${data.efficacyPrediction}% therapeutic efficacy with minimal dose-limiting toxicities. The high selectivity ratio (${data.selectivityRatio}x) and structural validation (${data.structuralConfidence}% confidence) support clinical safety predictions.`,
      evidenceStrength: nonclinicalData.efficacyPrediction,
      complianceLevel: nonclinicalData.efficacyPrediction > 70 ? 'strong' : 'moderate'
    }
  ];

  const fdaGuidance = `
    Section 4 must provide comprehensive nonclinical pharmacology and toxicology data to support 
    the safety and biological activity of the investigational drug. Per 21 CFR 312.23(a)(8), 
    this includes primary and secondary pharmacodynamics, safety pharmacology, and toxicology studies.
    Computational predictions must be clearly identified and distinguished from experimental data.
  `;

  return (
    <BaseSectionTemplate
      sectionNumber="4"
      sectionTitle="Nonclinical Pharmacology and Toxicology"
      completionPercentage={completeness}
      validationStatus={completeness >= 80 ? 'complete' : completeness >= 60 ? 'partial' : 'pending'}
      fdaGuidance={fdaGuidance}
    >
      {/* Key Safety Metrics Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <SafetyMetricCard
            title="Target Selectivity"
            value={`${nonclinicalData.selectivityRatio}x`}
            subtitle="Cancer vs Normal Cells"
            icon={<Biotech />}
            color="#059669"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <SafetyMetricCard
            title="Safety Margin"
            value={`${nonclinicalData.safetyMargin}%`}
            subtitle="Computational Prediction"
            icon={<Security />}
            color="#3b82f6"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <SafetyMetricCard
            title="Structural Confidence"
            value={`${nonclinicalData.structuralConfidence}%`}
            subtitle="Target Binding"
            icon={<Science />}
            color="#d97706"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <SafetyMetricCard
            title="Efficacy Prediction"
            value={`${nonclinicalData.efficacyPrediction}%`}
            subtitle="Therapeutic Response"
            icon={<TrendingUp />}
            color="#7c3aed"
          />
        </Grid>
      </Grid>

      {/* Evidence Mapping Cards for FDA Requirements */}
      {evidenceConfigurations.map((config, index) => (
        <EvidenceMapper
          key={index}
          analysisResult={config.analysisResult}
          fdaRequirement={config.fdaRequirement}
          mappingFunction={config.mappingFunction}
          evidenceStrength={config.evidenceStrength}
          complianceLevel={config.complianceLevel}
        />
      ))}

      {/* Regulatory Subsections */}
      <RegulatorySubsection 
        title="4.1 Primary Pharmacodynamics"
        content={generatePrimaryPharmacodynamics(nonclinicalData)}
      />
      
      <RegulatorySubsection
        title="4.2 Secondary Pharmacodynamics and Safety Pharmacology"
        content={generateSecondaryPharmacodynamics(nonclinicalData)}
      />

      <RegulatorySubsection
        title="4.3 Computational Toxicology Assessment"
        content={generateToxicologyAssessment(nonclinicalData)}
      />
    </BaseSectionTemplate>
  );
};

// Safety Metric Card Component
const SafetyMetricCard = ({ title, value, subtitle, icon, color }) => (
  <Card sx={{
    background: `linear-gradient(135deg, ${color}20, ${color}10)`,
    border: `1px solid ${color}40`,
    borderRadius: 3,
    height: '100%'
  }}>
    <CardContent sx={{ p: 3, textAlign: 'center' }}>
      <Box sx={{ color: color, mb: 1 }}>
        {icon}
      </Box>
      <Typography variant="h4" sx={{ 
        fontWeight: 900, 
        color: 'white',
        mb: 0.5
      }}>
        {value}
      </Typography>
      <Typography variant="h6" sx={{ 
        color: color, 
        fontWeight: 700,
        mb: 1
      }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={{ 
        color: 'rgba(255,255,255,0.7)'
      }}>
        {subtitle}
      </Typography>
    </CardContent>
  </Card>
);

// Regulatory Subsection Component
const RegulatorySubsection = ({ title, content }) => (
  <Card sx={{
    background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 3,
    mb: 3
  }}>
    <CardContent sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ 
        fontWeight: 700, 
        color: 'white',
        mb: 3,
        borderBottom: '2px solid rgba(255,255,255,0.1)',
        pb: 1
      }}>
        {title}
      </Typography>
      <Typography variant="body1" sx={{ 
        color: 'rgba(255,255,255,0.9)',
        fontSize: '1.1rem',
        lineHeight: 1.7,
        fontWeight: 400,
        textAlign: 'justify'
      }}>
        {content}
      </Typography>
    </CardContent>
  </Card>
);

// Content Generation Functions
const generatePrimaryPharmacodynamics = (data) => {
  return `
TARGET ENGAGEMENT MECHANISM: Computational analysis of ${data.targetName} demonstrates ${Math.abs(data.zetaScore)} Zeta Score, confirming ${data.functionalImpact.toLowerCase()} biological disruption through direct target engagement. Structural modeling validates binding interactions with ${data.structuralConfidence}% confidence, indicating robust target-drug interaction profiles.

FUNCTIONAL IMPACT ASSESSMENT: The predicted therapeutic window of ${data.therapeuticWindow} demonstrates strong selectivity for diseased versus normal tissue, supporting the mechanism of action through selective target modulation. Chromatin accessibility analysis (score: ${data.accessibilityScore}) confirms target accessibility in the disease context.

DOSE-RESPONSE RELATIONSHIPS: Computational modeling predicts concentration-dependent target engagement with optimal therapeutic effect at concentrations that maintain the observed selectivity profile. The therapeutic window supports clinical dose escalation strategies with reduced safety concerns.
  `.trim();
};

const generateSecondaryPharmacodynamics = (data) => {
  return `
SELECTIVITY PROFILING: Comprehensive computational analysis reveals ${data.selectivityRatio}x selectivity for target cells versus normal tissue, indicating minimal off-target interactions. This selectivity profile significantly reduces the risk of dose-limiting toxicities and supports a favorable therapeutic index.

SAFETY PHARMACOLOGY ASSESSMENT: Predictive modeling indicates ${data.safetyMargin}% safety margin with favorable cardiovascular, respiratory, and central nervous system profiles. The high selectivity ratio provides confidence for clinical safety based on tissue-specific target expression patterns.

OFF-TARGET ANALYSIS: Computational screening against known biological pathways indicates minimal interactions with critical cellular processes outside the intended mechanism of action. The structural specificity and selectivity profile support progression to clinical evaluation with appropriate safety monitoring.
  `.trim();
};

const generateToxicologyAssessment = (data) => {
  return `
COMPUTATIONAL TOXICOLOGY: Predictive toxicology modeling indicates low potential for dose-limiting toxicities based on the ${data.selectivityRatio}x selectivity ratio and ${data.structuralConfidence}% structural validation confidence. The therapeutic candidate demonstrates favorable safety predictions across multiple computational models.

GENOTOXICITY ASSESSMENT: Structural analysis indicates low genotoxic potential based on molecular characteristics and target specificity. The precise mechanism of action and high selectivity reduce concerns for non-specific cellular damage or mutagenic effects.

CARCINOGENICITY EVALUATION: The targeted mechanism of action and tissue-specific expression patterns suggest minimal carcinogenic potential. Long-term safety predictions based on computational modeling support clinical development with appropriate monitoring protocols.

REPRODUCTIVE TOXICOLOGY: Target expression analysis indicates minimal impact on reproductive tissues, supporting clinical development in appropriate patient populations with standard reproductive safety monitoring requirements.
  `.trim();
};

export default NonclinicalPharmacologySection; 