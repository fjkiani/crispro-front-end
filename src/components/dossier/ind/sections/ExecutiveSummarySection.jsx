import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import { Assessment, Science, TrendingUp } from '@mui/icons-material';

import BaseSectionTemplate from './BaseSectionTemplate';
import EvidenceMapper from '../common/EvidenceMapper';
import { generateExecutiveSummary, generateDevelopmentPlan } from '../templates/INDContentTemplates';
import { calculateSectionCompleteness } from '../utils/ComplianceCalculator';

const ExecutiveSummarySection = ({ analysisData, sectionConfig }) => {
  // Extract data for executive summary
  const summaryData = {
    targetName: analysisData.metadata?.targetName || 'Unknown Target',
    indication: analysisData.metadata?.indication || 'Unknown Indication',
    zetaScore: analysisData.oracle?.zetaScore || 0,
    functionalImpact: analysisData.oracle?.functionalImpact || 'Unknown',
    therapeuticWindow: analysisData.oracle?.therapeuticWindow || 'Unknown',
    therapeuticCount: analysisData.forge?.therapeuticCount || 0,
    averageEfficacy: analysisData.forge?.averageEfficacy || 0,
    safetyMargin: analysisData.gauntlet?.safetyMargin || 0,
    selectivityRatio: analysisData.gauntlet?.selectivityRatio || 0,
    targetConfidence: analysisData.oracle?.targetConfidence || 0,
    platform: analysisData.metadata?.platform || 'Zeta Platform'
  };

  // Calculate section completeness
  const completeness = calculateSectionCompleteness(summaryData, [
    'targetName', 'indication', 'zetaScore', 'therapeuticCount', 'targetConfidence'
  ]);

  // Evidence mapping configurations
  const evidenceConfigurations = [
    {
      fdaRequirement: "Drug Development Rationale and Strategy",
      analysisResult: summaryData,
      mappingFunction: (data) => generateExecutiveSummary(data),
      evidenceStrength: summaryData.targetConfidence,
      complianceLevel: summaryData.targetConfidence >= 90 ? 'strong' : 
                      summaryData.targetConfidence >= 70 ? 'moderate' : 'supportive'
    },
    {
      fdaRequirement: "Target Validation and Mechanism of Action",
      analysisResult: summaryData,
      mappingFunction: (data) => 
        `Target ${data.targetName} confirmed via computational analysis with Zeta Score ${data.zetaScore} (${data.functionalImpact}). Therapeutic window of ${data.therapeuticWindow} demonstrates strong selectivity for cancer versus normal tissue.`,
      evidenceStrength: Math.abs(summaryData.zetaScore) > 1000 ? 95 : 75,
      complianceLevel: 'strong'
    },
    {
      fdaRequirement: "Therapeutic Approach and Development Plan", 
      analysisResult: summaryData,
      mappingFunction: (data) => generateDevelopmentPlan(data),
      evidenceStrength: summaryData.averageEfficacy,
      complianceLevel: summaryData.averageEfficacy >= 80 ? 'strong' : 'moderate'
    }
  ];

  const fdaGuidance = `
    The Executive Summary should provide a comprehensive overview of the drug development program, 
    including the therapeutic rationale, target validation data, and planned development strategy. 
    Per 21 CFR 312.23(a)(1), this section must summarize the most important information about the 
    investigational drug and the planned investigation.
  `;

  return (
    <BaseSectionTemplate
      sectionNumber="1"
      sectionTitle="Executive Summary"
      completionPercentage={completeness}
      validationStatus={completeness >= 80 ? 'complete' : completeness >= 60 ? 'partial' : 'pending'}
      fdaGuidance={fdaGuidance}
    >
      {/* Key Metrics Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Target Confidence"
            value={`${summaryData.targetConfidence}%`}
            subtitle="Computational Validation"
            icon={<Assessment />}
            color="#059669"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Therapeutic Assets"
            value={summaryData.therapeuticCount}
            subtitle="AI-Generated Candidates"
            icon={<Science />}
            color="#3b82f6"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Safety Margin"
            value={`${summaryData.selectivityRatio}x`}
            subtitle="Selectivity Ratio"
            icon={<TrendingUp />}
            color="#d97706"
          />
        </Grid>
      </Grid>

      {/* Evidence Mapping Cards */}
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

      {/* Regulatory Summary */}
      <RegulatorySubsection 
        title="1.1 Drug Development Background"
        content={generateExecutiveSummary(summaryData)}
      />
      
      <RegulatorySubsection
        title="1.2 Clinical Development Plan"
        content={generateDevelopmentPlan(summaryData)}
      />
    </BaseSectionTemplate>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, subtitle, icon, color }) => (
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

export default ExecutiveSummarySection; 