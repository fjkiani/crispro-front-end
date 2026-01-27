// Compliance Calculator for IND Package Validation
// Calculates completeness scores and validates regulatory requirements

import { getNestedField, hasEvidence } from './AnalysisDataNormalizer';

// FDA IND Requirements by Section
const FDA_IND_REQUIREMENTS = {
  executiveSummary: [
    { field: 'metadata.targetName', weight: 3, description: 'Target identification' },
    { field: 'metadata.indication', weight: 3, description: 'Therapeutic indication' },
    { field: 'oracle.zetaScore', weight: 2, description: 'Functional validation' },
    { field: 'oracle.targetConfidence', weight: 3, description: 'Target confidence' },
    { field: 'forge.therapeuticCount', weight: 2, description: 'Therapeutic candidates' }
  ],
  nonclinicalPharmacology: [
    { field: 'oracle.functionalImpact', weight: 3, description: 'Primary pharmacodynamics' },
    { field: 'oracle.therapeuticWindow', weight: 3, description: 'Mechanism of action' },
    { field: 'gauntlet.selectivityRatio', weight: 2, description: 'Secondary pharmacodynamics' },
    { field: 'gauntlet.safetyMargin', weight: 3, description: 'Safety pharmacology' },
    { field: 'gauntlet.structuralConfidence', weight: 2, description: 'Structural validation' }
  ],
  cmcManufacturing: [
    { field: 'forge.candidates', weight: 3, description: 'Drug substance characterization' },
    { field: 'forge.averageEfficacy', weight: 2, description: 'Product specifications' },
    { field: 'forge.designConfidence', weight: 2, description: 'Quality control measures' }
  ],
  clinicalProtocol: [
    { field: 'metadata.indication', weight: 3, description: 'Patient population' },
    { field: 'gauntlet.efficacyPrediction', weight: 2, description: 'Efficacy endpoints' },
    { field: 'gauntlet.safetyMargin', weight: 3, description: 'Safety monitoring' },
    { field: 'oracle.targetConfidence', weight: 2, description: 'Biomarker strategy' }
  ]
};

// Validation Rules
const VALIDATION_RULES = {
  requiredFields: [
    'oracle.zetaScore',
    'forge.therapeuticCount', 
    'gauntlet.selectivityRatio',
    'metadata.targetName'
  ],
  minimumEvidenceStrength: 60,
  requiredSections: [
    'executiveSummary',
    'nonclinicalPharmacology',
    'cmcManufacturing'
  ],
  minimumCompleteness: 70
};

export const calculateSectionCompleteness = (sectionData, requiredFields) => {
  if (!sectionData || !Array.isArray(requiredFields)) {
    return 0;
  }

  const addressedFields = requiredFields.filter(field => {
    const value = sectionData[field];
    return value !== null && value !== undefined && value !== '' && value !== 0;
  });

  const completeness = (addressedFields.length / requiredFields.length) * 100;
  return Math.round(completeness);
};

export const calculateOverallCompleteness = (analysisData) => {
  if (!analysisData) {
    return 0;
  }

  let totalWeight = 0;
  let achievedWeight = 0;

  // Calculate weighted completeness across all sections
  Object.values(FDA_IND_REQUIREMENTS).forEach(sectionRequirements => {
    sectionRequirements.forEach(requirement => {
      totalWeight += requirement.weight;
      
      if (hasEvidence(analysisData, requirement.field)) {
        const evidenceStrength = assessEvidenceStrength(
          getNestedField(analysisData, requirement.field)
        );
        
        // Weight by both requirement importance and evidence strength
        achievedWeight += requirement.weight * (evidenceStrength / 100);
      }
    });
  });

  const completeness = totalWeight > 0 ? (achievedWeight / totalWeight) * 100 : 0;
  return Math.round(completeness);
};

export const assessEvidenceStrength = (dataPoint) => {
  if (!dataPoint) return 0;
  
  // Numerical evidence scoring
  if (typeof dataPoint === 'number') {
    const absValue = Math.abs(dataPoint);
    
    // Different scoring for different types of numbers
    if (absValue > 1000) return 95; // High confidence scores (like Zeta scores)
    if (absValue > 100) return 85;  // Medium confidence scores
    if (absValue > 10) return 75;   // Ratios and percentages
    if (absValue > 1) return 65;    // Decimal scores
    return Math.min(absValue * 100, 100); // Fractional scores (0-1)
  }
  
  // Categorical evidence scoring
  const strengthMap = {
    'HIGH-CONFIDENCE': 95,
    'CONFIRMED': 90,
    'VALIDATED': 90,
    'STRONG': 85,
    'PREDICTED': 75,
    'MODERATE': 70,
    'ESTIMATED': 60,
    'WEAK': 40,
    'PATHOGENIC': 90,
    'CRITICAL': 85,
    'ESSENTIAL': 85
  };
  
  const upperCase = String(dataPoint).toUpperCase();
  for (const [key, value] of Object.entries(strengthMap)) {
    if (upperCase.includes(key)) {
      return value;
    }
  }
  
  // Array evidence (like candidates)
  if (Array.isArray(dataPoint)) {
    return Math.min(dataPoint.length * 25, 100); // More candidates = higher strength
  }
  
  return 50; // Default moderate strength for any other data
};

export const validateINDPackage = (analysisData) => {
  const errors = [];
  const warnings = [];
  
  // Check required fields
  VALIDATION_RULES.requiredFields.forEach(field => {
    if (!hasEvidence(analysisData, field)) {
      errors.push(`Missing required data: ${field}`);
    }
  });
  
  // Check minimum evidence strength
  const overallCompleteness = calculateOverallCompleteness(analysisData);
  if (overallCompleteness < VALIDATION_RULES.minimumCompleteness) {
    warnings.push(`Overall completeness (${overallCompleteness}%) below recommended threshold (${VALIDATION_RULES.minimumCompleteness}%)`);
  }
  
  // Check section-specific requirements
  const sectionValidation = validateSectionRequirements(analysisData);
  errors.push(...sectionValidation.errors);
  warnings.push(...sectionValidation.warnings);
  
  // Check evidence quality
  const evidenceValidation = validateEvidenceQuality(analysisData);
  warnings.push(...evidenceValidation.warnings);
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    completeness: overallCompleteness,
    sectionsValidated: Object.keys(FDA_IND_REQUIREMENTS).length,
    recommendedActions: generateRecommendedActions(errors, warnings)
  };
};

const validateSectionRequirements = (analysisData) => {
  const errors = [];
  const warnings = [];
  
  Object.entries(FDA_IND_REQUIREMENTS).forEach(([sectionName, requirements]) => {
    // Calculate completeness based on actual field presence
    let addressedRequirements = 0;
    
    requirements.forEach(requirement => {
      if (hasEvidence(analysisData, requirement.field)) {
        addressedRequirements++;
      }
    });
    
    const sectionCompleteness = Math.round((addressedRequirements / requirements.length) * 100);
    
    if (sectionCompleteness < 50) {
      errors.push(`Section ${sectionName} critically incomplete (${sectionCompleteness}%)`);
    } else if (sectionCompleteness < 80) {
      warnings.push(`Section ${sectionName} may need additional data (${sectionCompleteness}%)`);
    }
  });
  
  return { errors, warnings };
};

const validateEvidenceQuality = (analysisData) => {
  const warnings = [];
  
  // Check Oracle evidence quality
  if (analysisData.oracle) {
    const zetaScore = Math.abs(analysisData.oracle.zetaScore || 0);
    if (zetaScore < 100) {
      warnings.push('Zeta Score may indicate weak functional impact - consider additional validation');
    }
    
    const targetConfidence = analysisData.oracle.targetConfidence || 0;
    if (targetConfidence < 80) {
      warnings.push('Target confidence below 80% - may require additional validation studies');
    }
  }
  
  // Check Forge evidence quality
  if (analysisData.forge) {
    const therapeuticCount = analysisData.forge.therapeuticCount || 0;
    if (therapeuticCount < 2) {
      warnings.push('Limited therapeutic candidates - consider expanding design portfolio');
    }
    
    const averageEfficacy = analysisData.forge.averageEfficacy || 0;
    if (averageEfficacy < 70) {
      warnings.push('Average therapeutic efficacy below 70% - may impact clinical success probability');
    }
  }
  
  // Check Gauntlet evidence quality
  if (analysisData.gauntlet) {
    const selectivityRatio = analysisData.gauntlet.selectivityRatio || 0;
    if (selectivityRatio < 10) {
      warnings.push('Low selectivity ratio - may indicate safety concerns');
    }
  }
  
  return { warnings };
};

const generateRecommendedActions = (errors, warnings) => {
  const actions = [];
  
  if (errors.length > 0) {
    actions.push('Address critical data gaps before IND submission');
    actions.push('Perform additional computational validation for missing requirements');
  }
  
  if (warnings.length > 0) {
    actions.push('Consider supplemental studies to strengthen evidence package');
    actions.push('Review FDA guidance for specific section requirements');
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    actions.push('IND package meets regulatory requirements for submission');
    actions.push('Consider additional quality assurance review');
  }
  
  return actions;
};

// Utility function to get compliance status
export const getComplianceStatus = (completeness) => {
  if (completeness >= 90) return { status: 'excellent', color: '#059669', label: 'EXCELLENT' };
  if (completeness >= 80) return { status: 'good', color: '#059669', label: 'COMPLIANT' };
  if (completeness >= 70) return { status: 'adequate', color: '#d97706', label: 'ADEQUATE' };
  if (completeness >= 50) return { status: 'insufficient', color: '#dc2626', label: 'INSUFFICIENT' };
  return { status: 'critical', color: '#dc2626', label: 'CRITICAL' };
};

// Calculate section-specific compliance
export const getSectionCompliance = (analysisData, sectionName) => {
  const requirements = FDA_IND_REQUIREMENTS[sectionName];
  if (!requirements) return { completeness: 0, status: 'unknown' };
  
  const completeness = calculateSectionCompleteness(
    analysisData,
    requirements.map(req => req.field.split('.').pop())
  );
  
  const status = getComplianceStatus(completeness);
  
  return {
    completeness,
    ...status,
    requirements: requirements.length,
    addressed: requirements.filter(req => hasEvidence(analysisData, req.field)).length
  };
}; 