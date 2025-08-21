import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip, Divider } from '@mui/material';
import { LocalHospital, Group, Timeline, Assessment } from '@mui/icons-material';

import BaseSectionTemplate from './BaseSectionTemplate';
import EvidenceMapper from '../common/EvidenceMapper';
import { generateClinicalProtocol } from '../templates/INDContentTemplates';
import { calculateSectionCompleteness } from '../utils/ComplianceCalculator';

const ClinicalProtocolSection = ({ analysisData, sectionConfig }) => {
  // Extract data for clinical protocol
  const clinicalData = {
    targetName: analysisData.metadata?.targetName || 'Unknown Target',
    indication: analysisData.metadata?.indication || 'Unknown Indication',
    selectivityRatio: analysisData.gauntlet?.selectivityRatio || 0,
    safetyMargin: analysisData.gauntlet?.safetyMargin || 0,
    efficacyPrediction: analysisData.gauntlet?.efficacyPrediction || 0,
    structuralConfidence: analysisData.gauntlet?.structuralConfidence || 0,
    averageEfficacy: analysisData.forge?.averageEfficacy || 0,
    targetConfidence: analysisData.oracle?.targetConfidence || 0,
    therapeuticWindow: analysisData.oracle?.therapeuticWindow || 'Unknown'
  };

  // Calculate section completeness
  const completeness = calculateSectionCompleteness(clinicalData, [
    'indication', 'selectivityRatio', 'efficacyPrediction', 'safetyMargin', 'targetConfidence'
  ]);

  // Evidence mapping configurations for FDA Section 6
  const evidenceConfigurations = [
    {
      fdaRequirement: "Study Design and Rationale",
      analysisResult: clinicalData,
      mappingFunction: (data) => 
        `Phase I, open-label, dose-escalation study in patients with ${data.indication} harboring ${data.targetName} alterations. The predicted ${data.selectivityRatio}x selectivity ratio supports accelerated dose escalation with enhanced safety monitoring, based on computational modeling of therapeutic window (${data.therapeuticWindow}).`,
      evidenceStrength: clinicalData.targetConfidence,
      complianceLevel: clinicalData.targetConfidence > 90 ? 'strong' : 'moderate'
    },
    {
      fdaRequirement: "Patient Population and Eligibility Criteria",
      analysisResult: clinicalData,
      mappingFunction: (data) => 
        `Adults with advanced ${data.indication} who have failed standard therapies. Biomarker-driven enrollment based on ${data.targetName} expression and computational patient stratification algorithms. Target confidence of ${data.targetConfidence}% guides precision patient selection criteria.`,
      evidenceStrength: clinicalData.targetConfidence,
      complianceLevel: 'strong'
    },
    {
      fdaRequirement: "Dose Escalation and Safety Monitoring",
      analysisResult: clinicalData,
      mappingFunction: (data) => 
        `Computational modeling supports accelerated dose escalation based on predicted ${data.safetyMargin}% safety margin. Real-time safety monitoring with adaptive dose modifications guided by ${data.selectivityRatio}x selectivity predictions and structural confidence (${data.structuralConfidence}%).`,
      evidenceStrength: clinicalData.safetyMargin,
      complianceLevel: clinicalData.safetyMargin > 70 ? 'strong' : 'moderate'
    },
    {
      fdaRequirement: "Efficacy Endpoints and Biomarker Strategy",
      analysisResult: clinicalData,
      mappingFunction: (data) => 
        `Primary efficacy evaluation based on ${data.efficacyPrediction}% predicted objective response rate from computational modeling. Comprehensive genomic profiling with AI-driven patient stratification algorithms guide biomarker strategy and response prediction.`,
      evidenceStrength: clinicalData.efficacyPrediction,
      complianceLevel: clinicalData.efficacyPrediction > 70 ? 'strong' : 'moderate'
    }
  ];

  const fdaGuidance = `
    Section 6 must provide detailed clinical protocol information including study design, patient population, 
    dose escalation strategy, safety monitoring, and efficacy endpoints. Per 21 CFR 312.23(a)(6), 
    this section should demonstrate that the proposed clinical investigation is scientifically sound 
    and that human subjects will be adequately protected.
  `;

  return (
    <BaseSectionTemplate
      sectionNumber="6"
      sectionTitle="Clinical Protocol and Investigator Information"
      completionPercentage={completeness}
      validationStatus={completeness >= 80 ? 'complete' : completeness >= 60 ? 'partial' : 'pending'}
      fdaGuidance={fdaGuidance}
    >
      {/* Clinical Design Metrics Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <ClinicalMetricCard
            title="Predicted Response"
            value={`${clinicalData.efficacyPrediction}%`}
            subtitle="Objective Response Rate"
            icon={<Assessment />}
            color="#059669"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <ClinicalMetricCard
            title="Safety Margin"
            value={`${clinicalData.safetyMargin}%`}
            subtitle="Dose Escalation Safety"
            icon={<LocalHospital />}
            color="#3b82f6"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <ClinicalMetricCard
            title="Patient Selection"
            value={`${clinicalData.targetConfidence}%`}
            subtitle="Biomarker Confidence"
            icon={<Group />}
            color="#d97706"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <ClinicalMetricCard
            title="Selectivity Ratio"
            value={`${clinicalData.selectivityRatio}x`}
            subtitle="Target vs Off-Target"
            icon={<Timeline />}
            color="#7c3aed"
          />
        </Grid>
      </Grid>

      {/* Study Design Overview */}
      <Card sx={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 3,
        mb: 4
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 700, 
            color: 'white',
            mb: 3,
            borderBottom: '2px solid rgba(255,255,255,0.1)',
            pb: 1
          }}>
            6.1 Phase I Study Design Overview
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h6" sx={{ color: '#3b82f6', fontWeight: 700, mb: 2 }}>
                  Primary Objectives
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>
                  • Determine maximum tolerated dose and recommended Phase 2 dose<br/>
                  • Evaluate safety and tolerability profile<br/>
                  • Assess preliminary anti-tumor activity
                </Typography>
                
                <Typography variant="h6" sx={{ color: '#059669', fontWeight: 700, mb: 2 }}>
                  Study Population
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Adults with {clinicalData.indication} harboring {clinicalData.targetName} alterations,
                  selected using AI-driven biomarker stratification with {clinicalData.targetConfidence}% confidence
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h6" sx={{ color: '#d97706', fontWeight: 700, mb: 2 }}>
                  Dose Escalation Strategy
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>
                  Accelerated escalation based on {clinicalData.safetyMargin}% predicted safety margin
                  and {clinicalData.selectivityRatio}x selectivity ratio from computational modeling
                </Typography>
                
                <Typography variant="h6" sx={{ color: '#7c3aed', fontWeight: 700, mb: 2 }}>
                  Efficacy Assessment
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Primary endpoint: Objective response rate (predicted: {clinicalData.efficacyPrediction}%)<br/>
                  Secondary: Progression-free survival, overall survival, biomarker analysis
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
        title="6.2 Patient Selection and Eligibility Criteria"
        content={generatePatientSelection(clinicalData)}
      />
      
      <RegulatorySubsection
        title="6.3 Dose Escalation and Safety Monitoring Plan"
        content={generateDoseEscalation(clinicalData)}
      />

      <RegulatorySubsection
        title="6.4 Biomarker Strategy and Correlative Studies"
        content={generateBiomarkerStrategy(clinicalData)}
      />

      <RegulatorySubsection
        title="6.5 Statistical Considerations and Data Analysis"
        content={generateStatisticalPlan(clinicalData)}
      />
    </BaseSectionTemplate>
  );
};

// Clinical Metric Card Component
const ClinicalMetricCard = ({ title, value, subtitle, icon, color }) => (
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
const generatePatientSelection = (data) => {
  return `
INCLUSION CRITERIA: Adults (≥18 years) with histologically confirmed ${data.indication} harboring ${data.targetName} alterations detected by validated molecular diagnostic assays. Patients must have received ≥1 prior systemic therapy and have measurable disease per RECIST v1.1.

BIOMARKER SELECTION: Patient enrollment guided by AI-driven biomarker stratification algorithms with ${data.targetConfidence}% target confidence. Molecular profiling includes ${data.targetName} expression levels, pathway activation status, and predictive biomarker assessment through computational analysis.

EXCLUSION CRITERIA: Active CNS metastases (unless stable and off steroids), significant cardiovascular disease, or concurrent malignancies. Laboratory parameters must meet standard oncology trial criteria with adequate organ function.

STRATIFICATION FACTORS: Patients stratified by ${data.targetName} expression level (high vs. low), prior therapy type, and disease stage. Computational modeling guides optimal patient allocation to maximize treatment benefit based on predicted response rates.

CONSENT AND ETHICAL CONSIDERATIONS: Written informed consent required with clear explanation of investigational nature, computational predictions, and potential risks/benefits. Protocol approved by institutional review board with ongoing safety oversight.
  `.trim();
};

const generateDoseEscalation = (data) => {
  return `
STARTING DOSE: Initial dose determined through computational modeling and allometric scaling, beginning at 1/10th of the predicted minimally effective dose with ${data.safetyMargin}% safety margin incorporated.

ESCALATION SCHEMA: Accelerated escalation (100% dose increases) for single-patient cohorts until first grade ≥2 toxicity, then standard 3+3 design. The ${data.selectivityRatio}x selectivity ratio supports more aggressive escalation than traditional cytotoxic agents.

DOSE-LIMITING TOXICITY (DLT) DEFINITION: DLTs defined as grade ≥3 non-hematologic toxicity or grade 4 hematologic toxicity during the first 28-day cycle. Special attention to mechanism-based toxicities predicted by computational modeling.

SAFETY MONITORING: Real-time safety assessment with adaptive dose modifications guided by computational predictions. Safety run-in phase includes enhanced monitoring with frequent laboratory assessments and imaging studies.

EXPANSION COHORTS: Once maximum tolerated dose is established, expansion cohorts (n=10-20 patients) for each major indication subtype to further characterize safety, pharmacokinetics, and preliminary efficacy signals.
  `.trim();
};

const generateBiomarkerStrategy = (data) => {
  return `
PREDICTIVE BIOMARKERS: Comprehensive genomic profiling including ${data.targetName} expression, pathway activation markers, and resistance mechanisms. AI algorithms analyze biomarker patterns to predict treatment response with ${data.efficacyPrediction}% accuracy.

PHARMACODYNAMIC ENDPOINTS: Target engagement assessed through serial biopsies (where feasible) and circulating biomarkers. Computational modeling correlates biomarker changes with clinical response and resistance development.

CORRELATIVE STUDIES: Blood-based biomarker analysis including circulating tumor DNA, exosome analysis, and immune profiling. AI-driven pattern recognition identifies novel response predictors and resistance mechanisms.

RESISTANCE MONITORING: Sequential biomarker assessment to identify emerging resistance patterns. Computational algorithms predict resistance development and guide combination therapy strategies for future studies.

PATIENT STRATIFICATION: Real-time biomarker analysis guides patient management decisions. AI algorithms continuously update response predictions based on evolving biomarker profiles during treatment.
  `.trim();
};

const generateStatisticalPlan = (data) => {
  return `
STUDY DESIGN: Single-arm, open-label Phase I dose-escalation study with expansion cohorts. Primary analysis focuses on safety, dose-limiting toxicities, and determination of recommended Phase 2 dose.

SAMPLE SIZE: Approximately 30-40 patients in dose escalation phase, with additional 20-30 patients in expansion cohorts. Sample size calculations based on computational predictions and standard Phase I statistical principles.

EFFICACY ANALYSIS: Primary efficacy endpoint is objective response rate, with computational prediction of ${data.efficacyPrediction}% serving as benchmark. Secondary endpoints include progression-free survival, overall survival, and biomarker response.

STATISTICAL METHODS: Safety analysis includes all treated patients with descriptive statistics for adverse events. Efficacy analysis uses Simon's two-stage design for expansion cohorts with α=0.05 and β=0.20.

INTERIM ANALYSES: Planned interim safety reviews after each dose level completion. Data Safety Monitoring Board reviews aggregate safety data quarterly with computational model updates to refine safety predictions.

COMPUTATIONAL INTEGRATION: AI algorithms continuously analyze accumulating clinical data to refine response predictions, optimize biomarker cutoffs, and guide future development decisions.
  `.trim();
};

export default ClinicalProtocolSection; 