import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Typography,
  Divider
} from '@mui/material';
import { CheckCircle, Science, Biotech } from '@mui/icons-material';
import useAppStore from '../../store';
import DemoHeader from './DemoHeader';
import DemoControlPanel from './DemoControlPanel';
import DemoNarrator from './DemoNarrator';
import StageRenderer from './StageRenderer';
import VictoryCard from './VictoryCard';
import { useDemoWorkflow } from '../../hooks/useDemoWorkflow';

/**
 * MultiStepWorkflow - Complete demo workflow orchestrator
 * 
 * Manages the entire demo lifecycle:
 * - Stage progression with timers
 * - State management (running, paused, completed)
 * - Progress tracking and savings accumulation
 * - Dynamic stage component rendering
 * 
 * Props:
 * - demoConfig: { data, stageComponents, title, description }
 *   - data: { killChain, initialMutation, header, initialNarratorText, startNarratorText }
 *   - stageComponents: Object mapping stage IDs to React components
 */
const MultiStepWorkflow = ({ demoConfig }) => {
  const { data, stageComponents, title, description } = demoConfig;
  const { killChain, initialMutation, header, initialNarratorText, startNarratorText } = data;

  const { setActiveMutation } = useAppStore();

  // Initialize mutation in store
  useEffect(() => {
    if (initialMutation) {
      setActiveMutation(initialMutation);
    }
  }, [initialMutation, setActiveMutation]);

  // Use the custom workflow hook
  const {
    currentStage,
    isRunning,
    isPaused,
    completedStages,
    stageResults,
    progress,
    narratorText,
    elapsedTime,
    totalSavings,
    start,
    pause,
    reset
  } = useDemoWorkflow(
    killChain,
    initialNarratorText,
    startNarratorText,
    killChain[killChain.length - 1]?.victoryMessage?.h3 || 'Demo Complete!'
  );

  const formatTime = useCallback((ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const currentStageData = killChain[currentStage];

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <DemoHeader headerData={header} />

      <DemoControlPanel
        isRunning={isRunning}
        isPaused={isPaused}
        startWorkflow={start}
        pauseWorkflow={pause}
        resetWorkflow={reset}
        elapsedTime={elapsedTime}
        totalSavings={totalSavings}
        currentStageIndex={currentStage}
        totalStages={killChain.length}
        formatTime={formatTime}
      />

      <DemoNarrator narratorText={narratorText} isRunning={isRunning} progress={progress} />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={currentStage} alternativeLabel>
            {killChain.map((stage, index) => (
              <Step key={stage.id} completed={completedStages.includes(index)}>
                <StepLabel
                  StepIconComponent={({ active, completed }) => (
                    completed ? (
                      <CheckCircle color="success" />
                    ) : active ? (
                      <Science color="error" />
                    ) : (
                      <Biotech color="disabled" />
                    )
                  )}
                >
                  {stage.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {isRunning && currentStageData && (
        <Card sx={{ mb: 3, border: '2px solid #d32f2f' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom color="error.main">
              {currentStageData.label}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {currentStageData.description}
            </Typography>
            <Alert severity="warning" sx={{ my: 2 }}>
              <strong>Biotech Impact:</strong> {currentStageData.biotechNarrative}
            </Alert>
            <Divider sx={{ my: 2 }} />
            <StageRenderer
              stageId={currentStageData.id}
              stageData={currentStageData.demoData}
              stageComponents={stageComponents}
            />
          </CardContent>
        </Card>
      )}

      {completedStages.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              🏆 Conquest Results
            </Typography>
            {completedStages.map(stageIndex => {
              const stage = killChain[stageIndex];
              return (
                <Box key={stage.id} sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom color="success.main">
                    ✅ {stage.label} - ${(stage.savings / 1000000).toFixed(0)}M Saved
                  </Typography>
                  <StageRenderer
                    stageId={stage.id}
                    stageData={stageResults[stage.id]}
                    stageComponents={stageComponents}
                  />
                </Box>
              );
            })}
          </CardContent>
        </Card>
      )}

      {completedStages.length === killChain.length && currentStageData?.victoryMessage && (
        <VictoryCard victoryMessage={currentStageData.victoryMessage} />
      )}
    </Box>
  );
};

export default MultiStepWorkflow;
