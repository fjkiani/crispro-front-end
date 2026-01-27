import React from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { Science, Search, Psychology, Timeline, Assessment, Build, Bolt } from '@mui/icons-material';

// Fallback steps if none provided
const DEFAULT_STEPS = [
  { key: 'hypothesis', label: 'Hypothesis Formation', description: 'Research question & literature review' },
  { key: 'design', label: 'Experimental Design', description: 'Plan validation methodology' },
  { key: 'data', label: 'Data Collection', description: 'Gather target information' },
  { key: 'experiment', label: 'Experimentation', description: 'Run validation tests' },
  { key: 'results', label: 'Results Analysis', description: 'Interpret findings' },
  { key: 'action', label: 'Next Steps', description: 'Apply knowledge' },
];

const iconForKey = (k) => {
  const key = String(k || '').toLowerCase();
  if (key.includes('hypothesis') || key === 'input') return <Search fontSize="small" />;
  if (key.includes('design')) return <Science fontSize="small" />;
  if (key.includes('data')) return <Timeline fontSize="small" />;
  if (key.includes('experiment') || key.includes('analysis')) return <Psychology fontSize="small" />;
  if (key.includes('result')) return <Assessment fontSize="small" />;
  if (key.includes('action') || key.includes('next')) return <Build fontSize="small" />;
  return <Bolt fontSize="small" />;
};

const toSteps = (stepsProp) => {
  const raw = Array.isArray(stepsProp) && stepsProp.length > 0 ? stepsProp : DEFAULT_STEPS;
  return raw.map((s, idx) => ({
    key: s.key || s.id || `step-${idx}`,
    label: s.label || s.title || `Step ${idx + 1}`,
    description: s.description || '',
    icon: iconForKey(s.key || s.id || ''),
  }));
};

const ProgressFlow = ({ currentStep, completedSteps = [], steps: stepsProp, sx = {} }) => {
  const steps = toSteps(stepsProp);
  const currentIndex = Math.max(0, steps.findIndex(s => s.key === currentStep));
  const currentInfo = steps[currentIndex] || steps[0];

  return (
    <Box sx={{ width: '100%', mb: 3, ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {currentInfo?.icon}
        <Typography variant="h6" sx={{ ml: 1 }}>Current Phase: {currentInfo?.label}</Typography>
        <Chip label={`Step ${currentIndex + 1} of ${steps.length}`} size="small" sx={{ ml: 2 }} />
      </Box>
      {currentInfo?.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{currentInfo.description}</Typography>
      )}

      {/* Modern horizontal timeline */}
      <Stack direction="row" alignItems="center" spacing={1}>
        {steps.map((s, idx) => {
          const isCompleted = completedSteps.includes(s.key) || idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const tone = isCompleted ? 'primary.main' : isCurrent ? 'secondary.main' : 'divider';
          return (
            <Stack key={s.key} direction="row" alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
              <Stack alignItems="center" sx={{ minWidth: 92 }}>
                <Chip
                  icon={s.icon}
                  label={s.label}
                  size="small"
                  sx={{
                    borderRadius: 999,
                    bgcolor: isCurrent ? 'secondary.light' : isCompleted ? 'primary.light' : 'background.default',
                    color: isCurrent || isCompleted ? 'text.primary' : 'text.secondary',
                    border: '1px solid',
                    borderColor: isCurrent ? 'secondary.main' : isCompleted ? 'primary.main' : 'divider',
                    maxWidth: 180,
                  }}
                />
              </Stack>
              {idx < steps.length - 1 && (
                <Box sx={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  mx: 1,
                  bgcolor: isCompleted ? 'primary.main' : 'divider',
                }} />
              )}
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
};

export default ProgressFlow; 