import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { SporadicWorkflow } from '../components/sporadic';
import { useSporadic } from '../context/SporadicContext';

/**
 * SporadicCancerPage (Day 4 - Module M5)
 * 
 * Full-page experience for sporadic (germline-negative) cancer analysis.
 * 
 * Workflow:
 * 1. Show germline status banner
 * 2. Quick Intake (Level 0/1) OR Upload NGS (Level 2)
 * 3. Generate tumor context
 * 4. Link to WIWFM with sporadic-aware scoring
 */
export default function SporadicCancerPage() {
  const navigate = useNavigate();
  const { 
    germlineStatus, 
    tumorContext, 
    dataLevel, 
    hasTumorContext,
    updateTumorContext,
  } = useSporadic();

  // TODO: Get real patient ID from auth/session
  const patientId = "ayesha_test_001";

  const handleTumorContextGenerated = (data) => {
    console.log('✅ Tumor context generated:', data);
    updateTumorContext(data);
    
    // Context is now stored globally in SporadicContext
    // WIWFM will automatically use it when running efficacy prediction
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#121212',
      pt: 4,
      pb: 6,
    }}>
      <Container maxWidth="lg">
        {/* Page Header */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Sporadic Cancer Analysis
          </Typography>
          <Chip 
            label="Germline-Negative Workflow"
            color="primary"
            sx={{ fontWeight: 500 }}
          />
          <Chip 
            label="85-90% of Patients"
            size="small"
            variant="outlined"
          />
        </Stack>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          For patients with negative germline testing or no hereditary mutations.
          Generate tumor-centric recommendations using disease priors and tumor NGS biomarkers.
        </Typography>

        {/* Main Workflow */}
        <SporadicWorkflow
          patientId={patientId}
          germlineStatus={germlineStatus}
          onTumorContextGenerated={handleTumorContextGenerated}
        />

        {/* Next Steps (when context generated) */}
        {hasTumorContext && (
          <Paper sx={{ mt: 4, p: 3, backgroundColor: '#1e1e1e', border: '1px solid #00bcd4' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#00bcd4' }}>
                ✅ Tumor Context Ready ({dataLevel})
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip 
                  label={`TMB: ${tumorContext?.tmb?.toFixed(1) || 'N/A'}`} 
                  size="small" 
                  variant="outlined"
                />
                <Chip 
                  label={`HRD: ${tumorContext?.hrd_score !== null ? tumorContext?.hrd_score?.toFixed(0) : 'Unknown'}`} 
                  size="small" 
                  variant="outlined"
                />
                <Chip 
                  label={`MSI: ${tumorContext?.msi_status || 'Unknown'}`} 
                  size="small" 
                  variant="outlined"
                />
              </Stack>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your tumor context is ready. Efficacy predictions will now include sporadic-aware scoring:
              PARP penalty/rescue, IO boosts, and confidence capping based on your data level.
            </Typography>

            
            {/* Gates Preview */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#1a1a1a', borderRadius: 1, border: '1px solid #333' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 500 }}>
                Gates that will be applied:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {tumorContext?.hrd_score !== null && tumorContext?.hrd_score !== undefined && (
                  <Chip 
                    label={tumorContext.hrd_score >= 42 ? "PARP Rescue (HRD≥42)" : "PARP Penalty (HRD<42)"}
                    size="small"
                    color={tumorContext.hrd_score >= 42 ? "success" : "warning"}
                    variant="outlined"
                  />
                )}
                {tumorContext?.tmb !== null && tumorContext?.tmb !== undefined && (
                  <Chip 
                    label={tumorContext.tmb >= 20 ? "IO Boost (TMB≥20)" : tumorContext.tmb >= 10 ? "IO Boost (TMB≥10)" : "No IO Boost"}
                    size="small"
                    color={tumorContext.tmb >= 20 ? "success" : tumorContext.tmb >= 10 ? "warning" : "default"}
                    variant="outlined"
                  />
                )}
                {tumorContext?.msi_status === "MSI-H" && (
                  <Chip 
                    label="IO Boost (MSI-H)"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
          )}
                <Chip 
                  label={`Confidence Cap (${dataLevel})`}
                  size="small"
                  color={dataLevel === 'L2' ? "success" : dataLevel === 'L1' ? "warning" : "error"}
                  variant="outlined"
                />
              </Stack>
            </Box>
            <Stack spacing={2}>
              <Box>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<PlayArrowIcon />}
                  onClick={() => navigate('/validate')}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    }
                  }}
                >
                  Run Efficacy Prediction (WIWFM)
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Your tumor context (TMB, MSI, HRD, {dataLevel}) will be automatically included in the analysis. Each drug result will show which sporadic gates were applied and why.
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                  2. Search Clinical Trials (Coming Soon)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Find trials matching your tumor biomarkers (TMB, MSI, HRD) - germline-only trials auto-excluded
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                  3. Generate Provider Report (Coming Soon)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Complete analysis with tumor context, drug rankings, trial matches, and audit trail
                </Typography>
              </Box>
            </Stack>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

