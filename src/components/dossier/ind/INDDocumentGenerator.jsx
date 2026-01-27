import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Grid, Card, CardContent, 
  Stepper, Step, StepLabel, Chip, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
  Science, Gavel, Description, Download, Visibility, CheckCircle,
  Assessment, Security, LocalHospital, MonetizationOn
} from '@mui/icons-material';

// Import section components
import BaseSectionTemplate from './sections/BaseSectionTemplate';
import ExecutiveSummarySection from './sections/ExecutiveSummarySection';
import NonclinicalPharmacologySection from './sections/NonclinicalPharmacologySection';
import CMCManufacturingSection from './sections/CMCManufacturingSection';
import ClinicalProtocolSection from './sections/ClinicalProtocolSection';

// Import utilities
import { normalizeForIND } from './utils/AnalysisDataNormalizer';
import { calculateOverallCompleteness, validateINDPackage } from './utils/ComplianceCalculator';
import INDDocumentExporter from './export/INDDocumentExporter';

const INDDocumentGenerator = ({ 
  analysisData,     // Complete analysis pipeline results
  onClose,          // Close handler
  fullscreen = false
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [normalizedData, setNormalizedData] = useState(null);
  const [completeness, setCompleteness] = useState(0);
  const [validation, setValidation] = useState({ isValid: false, errors: [] });
  const [showExportDialog, setShowExportDialog] = useState(false);

  // IND Section Configuration
  const indSections = [
    {
      id: 'executive_summary',
      number: '1',
      title: 'Executive Summary',
      component: ExecutiveSummarySection,
      icon: Assessment,
      color: '#3182ce',
      description: 'Drug development rationale and strategy overview'
    },
    {
      id: 'nonclinical_pharmacology', 
      number: '4',
      title: 'Nonclinical Pharmacology and Toxicology',
      component: NonclinicalPharmacologySection,
      icon: Science,
      color: '#059669',
      description: 'Target validation and safety assessment data'
    },
    {
      id: 'cmc_manufacturing',
      number: '3', 
      title: 'Chemistry, Manufacturing, and Controls',
      component: CMCManufacturingSection,
      icon: Security,
      color: '#7c3aed',
      description: 'Drug substance and product specifications'
    },
    {
      id: 'clinical_protocol',
      number: '6',
      title: 'Clinical Protocol and Investigator Information', 
      component: ClinicalProtocolSection,
      icon: LocalHospital,
      color: '#dc2626',
      description: 'Clinical trial design and execution plan'
    }
  ];

  // Data processing on mount
  useEffect(() => {
    if (analysisData) {
      console.log('INDDocumentGenerator - Processing analysis data:', analysisData);
      
      // Normalize raw analysis data for IND sections
      const normalized = normalizeForIND(analysisData);
      setNormalizedData(normalized);
      
      // Calculate completeness and validation
      const overallCompleteness = calculateOverallCompleteness(normalized);
      const validationResult = validateINDPackage(normalized);
      
      setCompleteness(overallCompleteness);
      setValidation(validationResult);
      
      console.log('INDDocumentGenerator - Normalized data:', normalized);
      console.log('INDDocumentGenerator - Completeness:', overallCompleteness);
      console.log('INDDocumentGenerator - Validation:', validationResult);
    }
  }, [analysisData]);

  const renderSectionContent = () => {
    if (!normalizedData) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Science sx={{ fontSize: 64, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
            Processing Analysis Data...
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Transforming AI analysis results into regulatory documentation
          </Typography>
          <LinearProgress sx={{ mt: 3, borderRadius: 2 }} />
        </Box>
      );
    }

    const currentSectionConfig = indSections[currentSection];
    const SectionComponent = currentSectionConfig.component;

    return (
      <SectionComponent 
        analysisData={normalizedData}
        sectionConfig={{
          fdaSection: `${currentSectionConfig.number}`,
          title: currentSectionConfig.title,
          description: currentSectionConfig.description
        }}
      />
    );
  };

  const handleExport = () => {
    setShowExportDialog(true);
  };

  const getCompletenessColor = (percentage) => {
    if (percentage >= 80) return '#059669';
    if (percentage >= 60) return '#d97706';
    return '#dc2626';
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(0,20,40,0.95) 0%, rgba(0,30,60,0.9) 100%)',
      color: 'white',
      p: fullscreen ? 0 : 3
    }}>
      {/* Header */}
      <Paper sx={{ 
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 3,
        p: 4,
        mb: 3
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 900, 
              color: 'white',
              fontSize: { xs: '2rem', md: '2.5rem' },
              mb: 1
            }}>
              📋 IND PACKAGE GENERATOR
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 500
            }}>
              FDA-Compliant Investigational New Drug Application
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Completeness Score */}
            <Card sx={{ 
              background: `linear-gradient(135deg, ${getCompletenessColor(completeness)}, ${getCompletenessColor(completeness)}cc)`,
              minWidth: 120
            }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', mb: 0.5 }}>
                  {completeness}%
                </Typography>
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                  FDA COMPLIANCE
                </Typography>
              </CardContent>
            </Card>
            
            {/* Action Buttons */}
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExport}
              disabled={completeness < 60}
              sx={{ 
                background: 'linear-gradient(135deg, #059669, #047857)',
                px: 3,
                py: 1.5
              }}
            >
              Export IND Package
            </Button>
            
            {onClose && (
              <Button
                variant="outlined"
                onClick={onClose}
                sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
              >
                Close
              </Button>
            )}
          </Box>
        </Box>

        {/* Section Navigation */}
        <Stepper activeStep={currentSection} sx={{ mt: 3 }}>
          {indSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Step key={section.id}>
                <StepLabel 
                  StepIconComponent={() => (
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: index <= currentSection 
                        ? `linear-gradient(135deg, ${section.color}, ${section.color}cc)`
                        : 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => setCurrentSection(index)}
                  >
                    <Icon sx={{ 
                      color: index <= currentSection ? 'white' : 'rgba(255,255,255,0.5)',
                      fontSize: 20
                    }} />
                  </Box>
                  )}
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => setCurrentSection(index)}
                >
                  Section {section.number}: {section.title}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Paper>

      {/* Main Content */}
      <Paper sx={{ 
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 3,
        minHeight: '60vh',
        overflow: 'hidden'
      }}>
        {renderSectionContent()}
      </Paper>

      {/* Validation Status */}
      {validation.errors.length > 0 && (
        <Paper sx={{ 
          mt: 3,
          p: 3,
          background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(220, 38, 38, 0.08))',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          borderRadius: 3
        }}>
          <Typography variant="h6" sx={{ color: '#dc2626', fontWeight: 700, mb: 2 }}>
            ⚠️ Validation Issues
          </Typography>
          {validation.errors.map((error, index) => (
            <Typography key={index} variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
              • {error}
            </Typography>
          ))}
        </Paper>
      )}

      {/* Export Dialog */}
      <Dialog 
        open={showExportDialog} 
        onClose={() => setShowExportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ background: '#1a1a1a', color: 'white' }}>
          Export IND Package
        </DialogTitle>
        <DialogContent sx={{ background: '#1a1a1a', color: 'white' }}>
          <INDDocumentExporter 
            analysisData={normalizedData}
            selectedSections={indSections}
            completeness={completeness}
          />
        </DialogContent>
        <DialogActions sx={{ background: '#1a1a1a' }}>
          <Button onClick={() => setShowExportDialog(false)} sx={{ color: 'white' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default INDDocumentGenerator; 