import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

/**
 * SporadicProvenanceCard Component (Day 5 - Module M5)
 * 
 * Displays provenance for sporadic cancer scoring gates.
 * Shows which gates were applied, why, and the impact on scores.
 * 
 * Critical for Ayesha: Full transparency on PARP penalty, IO boost, confidence capping.
 * 
 * Props:
 * - drugName: Name of the drug
 * - provenance: sporadic_gates_provenance from API response
 */
export default function SporadicProvenanceCard({ drugName, provenance }) {
  if (!provenance || !provenance.gates_applied || provenance.gates_applied.length === 0) {
    return null; // No sporadic gates applied
  }

  const { 
    germline_status, 
    level, 
    gates_applied, 
    efficacy_delta, 
    confidence_delta,
    rationale 
  } = provenance;

  // Parse rationale for specific gates
  const parpGate = rationale?.find(r => r.gate?.includes('PARP'));
  const ioGate = rationale?.find(r => r.gate?.includes('IO'));
  const confidenceGate = rationale?.find(r => r.gate?.includes('CONFIDENCE_CAP'));

  return (
    <Card sx={{ backgroundColor: '#252525', border: '1px solid #444', mt: 2 }}>
      <CardHeader
        avatar={<InfoOutlinedIcon sx={{ color: '#00bcd4' }} />}
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2">Sporadic Cancer Scoring</Typography>
            <Chip 
              label={`Germline ${germline_status}`} 
              size="small" 
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
            <Chip 
              label={level} 
              size="small" 
              color={level === 'L2' ? 'success' : level === 'L1' ? 'warning' : 'default'}
              sx={{ fontSize: '0.7rem' }}
            />
          </Stack>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            {gates_applied.length} adjustment{gates_applied.length > 1 ? 's' : ''} applied to {drugName}
          </Typography>
        }
      />

      <Divider />

      <CardContent>
        {/* Summary Chips */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          {efficacy_delta !== 0 && (
            <Chip
              icon={efficacy_delta > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`Efficacy ${efficacy_delta > 0 ? '+' : ''}${(efficacy_delta * 100).toFixed(0)}%`}
              size="small"
              color={efficacy_delta > 0 ? 'success' : 'warning'}
            />
          )}
          {confidence_delta !== 0 && (
            <Chip
              icon={confidence_delta > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`Confidence ${confidence_delta > 0 ? '+' : ''}${(confidence_delta * 100).toFixed(0)}%`}
              size="small"
              color={confidence_delta > 0 ? 'success' : 'warning'}
            />
          )}
        </Stack>

        {/* Detailed Rationale (Accordion) */}
        <Accordion sx={{ backgroundColor: '#2a2a2a', boxShadow: 'none' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              View Detailed Rationale
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {/* PARP Gate */}
              {parpGate && (
                <Box sx={{ p: 2, backgroundColor: '#1e1e1e', borderRadius: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    {parpGate.verdict === 'RESCUED' ? (
                      <CheckCircleOutlineIcon sx={{ color: '#00bcd4', fontSize: 20 }} />
                    ) : (
                      <WarningAmberIcon sx={{ color: '#ff9800', fontSize: 20 }} />
                    )}
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {parpGate.gate.replace(/_/g, ' ')}
                    </Typography>
                    <Chip 
                      label={`${parpGate.penalty}x`} 
                      size="small" 
                      color={parpGate.penalty === 1.0 ? 'success' : 'warning'}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {parpGate.reason}
                  </Typography>
                  {parpGate.hrd_score !== undefined && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      HRD Score: {parpGate.hrd_score.toFixed(1)} {parpGate.hrd_score >= 42 ? '(≥42 → Rescue!)' : '(<42)'}
                    </Typography>
                  )}
                </Box>
              )}

              {/* IO Boost Gate */}
              {ioGate && (
                <Box sx={{ p: 2, backgroundColor: '#1e1e1e', borderRadius: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {ioGate.gate.replace(/_/g, ' ')}
                    </Typography>
                    <Chip 
                      label={`${ioGate.boost}x Boost`} 
                      size="small" 
                      color="success"
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {ioGate.reason}
                  </Typography>
                  {ioGate.tmb !== undefined && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      TMB: {ioGate.tmb.toFixed(1)} mutations/Mb {ioGate.tmb >= 20 ? '(TMB-High!)' : ''}
                    </Typography>
                  )}
                  {ioGate.msi_status && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      MSI Status: {ioGate.msi_status}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Confidence Cap Gate */}
              {confidenceGate && (
                <Box sx={{ p: 2, backgroundColor: '#1e1e1e', borderRadius: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <InfoOutlinedIcon sx={{ color: '#2196f3', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Confidence Capped
                    </Typography>
                    <Chip 
                      label={`Max ${confidenceGate.cap}`} 
                      size="small" 
                      color="info"
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {confidenceGate.reason}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Data Level: {confidenceGate.level} (Completeness: {(confidenceGate.completeness * 100).toFixed(0)}%)
                  </Typography>
                </Box>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
}

