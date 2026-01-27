/**
 * Patient Dashboard Insights Component
 * 
 * DRY, reusable component that provides personalized insights for ANY patient.
 * Shows synthesized, actionable information - not generic tiles.
 * 
 * Value to cancer patients:
 * 1. Where am I? (Status with completeness)
 * 2. What's next? (Missing tests with unlock preview)
 * 3. What can I do? (Ready-to-view recommendations)
 * 4. My journey (Timeline)
 */

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Alert,
  Grid,
  Button,
  Divider,
} from '@mui/material';
import {
  CheckCircle as AvailableIcon,
  Cancel as MissingIcon,
  Science as TestIcon,
  LocalHospital as CarePlanIcon,
  Explore as TrialIcon,
  TrendingUp as OpportunityIcon,
} from '@mui/icons-material';

const PatientDashboardInsights = ({ 
  patientProfile, 
  carePlan, 
  trialCount = 0,
  onViewCarePlan,
  onViewTrials,
  onUploadTest,
}) => {
  
  // Synthesize patient status (works with ANY patient data structure)
  const patientStatus = useMemo(() => {
    if (!patientProfile) return null;

    // Handle both flat and hierarchical structures
    const disease = patientProfile.disease || (typeof patientProfile.disease === 'string' ? {} : patientProfile.disease) || {};
    const tumorContext = patientProfile.tumor_context || {};
    const germline = patientProfile.germline || {};
    const treatment = patientProfile.treatment || {};
    
    // Calculate completeness
    const completenessScore = tumorContext.completeness_score || 
      (tumorContext.biomarkers ? 0.3 : 0) +
      (germline.mutations?.length > 0 ? 0.25 : 0) +
      (tumorContext.somatic_mutations?.some(m => m.genomic_coordinate_hg38) ? 0.3 : 0) +
      (patientProfile.ca125_value ? 0.15 : 0);
    
    const intakeLevel = completenessScore >= 0.7 ? 'L2' : completenessScore >= 0.3 ? 'L1' : 'L0';
    
    // Determine what's available
    const hasIHC = !!tumorContext.biomarkers;
    const hasGermline = !!germline.mutations && germline.mutations.length > 0;
    const hasNGS = !!tumorContext.somatic_mutations?.some(m => m.genomic_coordinate_hg38);
    const hasCA125 = !!patientProfile.ca125_value || !!patientProfile.ca125_baseline;
    
    // Get disease info (handle both structures)
    const diseaseType = disease.type || patientProfile.disease || 'Unknown';
    const diseaseStage = disease.stage || patientProfile.stage || 'Unknown';
    const treatmentLine = treatment.line_number || treatment.line || patientProfile.treatment_line || 0;
    
    // Key biomarkers
    const biomarkers = [];
    if (tumorContext.biomarkers?.pd_l1_status === 'POSITIVE') {
      biomarkers.push(`PD-L1+ (CPS ${tumorContext.biomarkers.pd_l1_cps || ''})`);
    }
    if (tumorContext.biomarkers?.her2_status) {
      biomarkers.push(`HER2 ${tumorContext.biomarkers.her2_status}`);
    }
    if (tumorContext.somatic_mutations?.some(m => m.gene === 'TP53')) {
      biomarkers.push('TP53 Mutant');
    }
    if (germline.mutations?.some(m => m.gene === 'MBD4')) {
      biomarkers.push('MBD4 Germline');
    }
    
    return {
      diseaseType,
      diseaseStage,
      treatmentLine,
      completenessScore,
      intakeLevel,
      hasIHC,
      hasGermline,
      hasNGS,
      hasCA125,
      biomarkers,
    };
  }, [patientProfile]);

  // Determine missing tests and what they unlock
  const missingTests = useMemo(() => {
    if (!patientStatus) return [];
    
    const tests = [];
    
    if (!patientStatus.hasNGS) {
      tests.push({
        name: 'Tumor NGS',
        urgency: 'high',
        unlocks: [
          'Drug Efficacy Predictions (S/P/E)',
          'Resistance Analysis',
          'Clinical Trial Matching',
          'Synthetic Lethality Discovery',
        ],
        value: 'Unlocks personalized drug rankings and trial matching based on your specific mutations',
      });
    }
    
    if (!patientStatus.hasCA125) {
      tests.push({
        name: 'CA-125',
        urgency: 'medium',
        unlocks: [
          'Disease Monitoring',
          'Response Tracking',
          'Progression Alerts',
        ],
        value: 'Enables automated tracking of treatment response and disease burden',
      });
    }
    
    return tests;
  }, [patientStatus]);

  // Calculate actionable opportunities
  const opportunities = useMemo(() => {
    const opps = [];
    
    if (carePlan) {
      opps.push({
        type: 'care_plan',
        title: 'Complete Care Plan Ready',
        description: 'Your personalized treatment recommendations are available',
        action: onViewCarePlan,
        icon: <CarePlanIcon />,
        count: null,
      });
    }
    
    if (trialCount > 0) {
      opps.push({
        type: 'trials',
        title: `${trialCount} Clinical Trial${trialCount !== 1 ? 's' : ''} Matched`,
        description: 'Trials matched to your specific profile',
        action: onViewTrials,
        icon: <TrialIcon />,
        count: trialCount,
      });
    }
    
    if (missingTests.length > 0) {
      opps.push({
        type: 'tests',
        title: `${missingTests.length} Test${missingTests.length !== 1 ? 's' : ''} Recommended`,
        description: 'Upload to unlock additional capabilities',
        action: () => onUploadTest?.(missingTests[0].name),
        icon: <TestIcon />,
        count: missingTests.length,
      });
    }
    
    return opps;
  }, [carePlan, trialCount, missingTests, onViewCarePlan, onViewTrials, onUploadTest]);

  if (!patientProfile || !patientStatus) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Loading patient insights...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getIntakeLevelColor = (level) => {
    switch (level) {
      case 'L2': return 'success';
      case 'L1': return 'warning';
      case 'L0': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Status Card - Where Am I? */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Where Am I?
            </Typography>
            <Chip
              label={`${patientStatus.intakeLevel} Level`}
              color={getIntakeLevelColor(patientStatus.intakeLevel)}
              size="small"
            />
          </Box>
          
          <Divider sx={{ mb: 2 }} />

          {/* Disease Status */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Disease
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {patientStatus.diseaseType.replace(/_/g, ' ').toUpperCase()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Stage
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {patientStatus.diseaseStage}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Treatment Line
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {patientStatus.treatmentLine}
              </Typography>
            </Grid>
          </Grid>

          {/* Key Biomarkers */}
          {patientStatus.biomarkers.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Key Biomarkers
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {patientStatus.biomarkers.map((bio, idx) => (
                  <Chip key={idx} label={bio} size="small" color="primary" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}

          {/* Data Completeness */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Data Completeness
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {Math.round(patientStatus.completenessScore * 100)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={patientStatus.completenessScore * 100}
              sx={{ height: 8, borderRadius: 1 }}
              color={patientStatus.completenessScore >= 0.7 ? 'success' : patientStatus.completenessScore >= 0.3 ? 'warning' : 'error'}
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              {patientStatus.hasIHC && <Chip icon={<AvailableIcon />} label="IHC" size="small" color="success" />}
              {patientStatus.hasGermline && <Chip icon={<AvailableIcon />} label="Germline" size="small" color="success" />}
              {patientStatus.hasNGS && <Chip icon={<AvailableIcon />} label="NGS" size="small" color="success" />}
              {patientStatus.hasCA125 && <Chip icon={<AvailableIcon />} label="CA-125" size="small" color="success" />}
              {!patientStatus.hasNGS && <Chip icon={<MissingIcon />} label="NGS Missing" size="small" color="warning" />}
              {!patientStatus.hasCA125 && <Chip icon={<MissingIcon />} label="CA-125 Missing" size="small" color="warning" />}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* What's Next? - Missing Tests */}
      {missingTests.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              What's Next?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Recommended tests that unlock additional capabilities:
            </Typography>
            
            {missingTests.map((test, idx) => (
              <Alert
                key={idx}
                severity={test.urgency === 'high' ? 'warning' : 'info'}
                icon={<TestIcon />}
                sx={{ mb: 2 }}
                action={
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onUploadTest?.(test.name)}
                  >
                    Upload
                  </Button>
                }
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    {test.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {test.value}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                      Unlocks:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {test.unlocks.map((unlock, uIdx) => (
                        <Chip
                          key={uIdx}
                          label={unlock}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* What Can I Do? - Opportunities */}
      {opportunities.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <OpportunityIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                What Can I Do?
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              {opportunities.map((opp, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 3,
                        transform: 'translateY(-2px)',
                      },
                    }}
                    onClick={opp.action}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Box color="primary.main">{opp.icon}</Box>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ flex: 1 }}>
                          {opp.title}
                        </Typography>
                        {opp.count !== null && (
                          <Chip
                            label={opp.count}
                            size="small"
                            color="primary"
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {opp.description}
                      </Typography>
                      <Button
                        size="small"
                        variant="text"
                        sx={{ mt: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          opp.action();
                        }}
                      >
                        View →
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PatientDashboardInsights;
