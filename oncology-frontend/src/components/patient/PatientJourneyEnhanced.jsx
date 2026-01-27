/**
 * Enhanced Patient Journey Timeline Component
 * 
 * Integrates with patient data structure to show:
 * - Diagnosis timeline
 * - Treatment history
 * - Imaging studies
 * - Test results (IHC, germline, NGS)
 * - Future recommendations
 * 
 * Reuses existing PatientJourneyTimeline styling but with enhanced data integration
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  LocalHospital as DiagnosisIcon,
  Science as TestIcon,
  Medication as TreatmentIcon,
  Image as ImagingIcon,
  TrendingUp as ProgressIcon,
} from '@mui/icons-material';
import './PatientJourneyEnhanced.css';

const PatientJourneyEnhanced = ({ patientProfile }) => {
  if (!patientProfile) {
    return (
      <Box p={3}>
        <Typography variant="body2" color="text.secondary">
          Loading patient journey...
        </Typography>
      </Box>
    );
  }

  // Extract data from hierarchical structure
  const disease = patientProfile.disease || {};
  const treatment = patientProfile.treatment || {};
  const imaging = patientProfile.imaging || {};
  const germline = patientProfile.germline || {};
  const tumorContext = patientProfile.tumor_context || {};
  const clinical = patientProfile.clinical || {};

  // Build timeline events
  const events = [];

  // Diagnosis event (from disease.type and stage)
  if (disease.type) {
    events.push({
      date: '2024-02-01', // From baseline imaging
      type: 'diagnosis',
      title: 'Diagnosis',
      details: `${disease.type?.replace('_', ' ').toUpperCase() || 'Cancer'} • Stage ${disease.stage || 'Unknown'}`,
      icon: <DiagnosisIcon />,
      color: 'primary',
    });
  }

  // Baselinemaging
  if (imaging.ct_baseline_2024_02_01) {
    events.push({
      date: imaging.ct_baseline_2024_02_01.performed_date || '2024-02-01',
      type: 'imaging',
      title: 'Baseline Imaging',
      details: imaging.ct_baseline_2024_02_01.impression || 'Baseline CT scan',
      icon: <ImagingIcon />,
      color: 'info',
    });
  }

  // Progression imaging
  if (imaging.ct_abdomen_pelvis_2025_10_28) {
    events.push({
      date: imaging.ct_abdomen_pelvis_2025_10_28.performed_date || '2025-10-28',
      type: 'imaging',
      title: 'Progression Detected',
      details: imaging.ct_abdomen_pelvis_2025_10_28.impression || 'Progression on CT',
      icon: <ImagingIcon />,
      color: 'error',
    });
  }

  // Germline test
  if (germline.test_date) {
    events.push({
      date: germline.test_date,
      type: 'test',
      title: 'Germline Testing',
      details: germline.mutations?.map(m => `${m.gene} ${m.protein_change || m.variant}`).join(', ') || 'Germline test completed',
      icon: <TestIcon />,
      color: 'secondary',
      mutations: germline.mutations || [],
    });
  }

  // Treatment events
  if (treatment.regimens && Array.isArray(treatment.regimens)) {
    treatment.regimens.forEach((regimen, idx) => {
      if (regimen.start_date) {
        events.push({
          date: regimen.start_date,
          type: 'treatment',
          title: `Started ${regimen.name || `Regimen ${idx + 1}`}`,
          details: regimen.drugs?.join(', ') || regimen.regimen_type || 'Treatment started',
          icon: <TreatmentIcon />,
          color: 'success',
        });
      }
      if (regimen.end_date) {
        events.push({
          date: regimen.end_date,
          type: 'treatment',
          title: `Ended ${regimen.name || `Regimen ${idx + 1}`}`,
          details: regimen.reason || 'Treatment completed',
          icon: <TreatmentIcon />,
          color: 'default',
        });
      }
    });
  }

  // Sort events by date
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Future recommendations (if missing tests)
  const missingTests = [];
  const hasNGS = !!tumorContext.somatic_mutations?.some(m => m.genomic_coordinate_hg38);
  const hasCA125 = !!patientProfile.ca125_value || !!patientProfile.ca125_baseline;

  if (!hasNGS) {
    missingTests.push({
      date: new Date().toISOString().split('T')[0],
      type: 'recommendation',
      title: 'Recommended: Tumor NGS',
      details: 'Unlocks drug efficacy predictions, resistance analysis, and trial matching',
      icon: <TestIcon />,
      color: 'warning',
    });
  }

  if (!hasCA125) {
    missingTests.push({
      date: new Date().toISOString().split('T')[0],
      type: 'recommendation',
      title: 'Recommended: CA-125',
      details: 'Unlocks disease monitoring and response tracking',
      icon: <TestIcon />,
      color: 'warning',
    });
  }

  const allEvents = [...events, ...missingTests];

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Patient Journey Timeline
      </Typography>

      <Timeline position="alternate">
        {allEvents.map((event, index) => (
          <TimelineItem key={index}>
            <TimelineOppositeContent sx={{ flex: 0.3 }}>
              <Typography variant="caption" color="text.secondary">
                {new Date(event.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Typography>
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineConnector />
              <TimelineDot color={event.color} variant="outlined">
                {event.icon}
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>

            <TimelineContent>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  borderLeft: `4px solid`,
                  borderColor: `${event.color}.main`,
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {event.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.details}
                </Typography>

                {/* Show mutations if available */}
                {event.mutations && event.mutations.length > 0 && (
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {event.mutations.map((mut, mIdx) => (
                      <Chip
                        key={mIdx}
                        label={`${mut.gene} ${mut.protein_change || mut.variant || ''}`}
                        size="small"
                        color={mut.classification === 'pathogenic' ? 'error' : 'default'}
                      />
                    ))}
                  </Box>
                )}

                {/* Show recommendation badge */}
                {event.type === 'recommendation' && (
                  <Chip
                    label="Recommended"
                    size="small"
                    color="warning"
                    sx={{ mt: 1 }}
                  />
                )}
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
};

export default PatientJourneyEnhanced;
