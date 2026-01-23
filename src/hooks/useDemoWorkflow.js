import { useState, useEffect } from 'react';

/**
 * useDemoWorkflow - Custom hook for managing demo workflow state and progression
 * 
 * @param {Array} stages - Array of stage objects with {id, label, duration, biotechNarrative, savings, demoData}
 * @param {string} initialNarratorText - Initial narrator text
 * @param {string} startNarratorText - Text to show when demo starts
 * @param {string} completeNarratorText - Text to show when demo completes
 * @returns {Object} Workflow state and controls
 */
export function useDemoWorkflow(stages = [], initialNarratorText = '', startNarratorText = '', completeNarratorText = '') {
  const [currentStage, setCurrentStage] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [completedStages, setCompletedStages] = useState([]);
  const [stageResults, setStageResults] = useState({});
  const [progress, setProgress] = useState(0);
  const [narratorText, setNarratorText] = useState(initialNarratorText);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);

  // Timer logic for stage progression
  useEffect(() => {
    let timer;
    if (isRunning && !isPaused && currentStage < stages.length && stages.length > 0) {
      const stage = stages[currentStage];
      const startTime = Date.now();
      
      timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const stageProgress = Math.min((elapsed / stage.duration) * 100, 100);
        setProgress(stageProgress);
        setElapsedTime(prev => prev + 100);

        // Update narrator text based on progress
        if (stageProgress < 25) {
          setNarratorText(`🎯 ${stage.biotechNarrative}`);
        } else if (stageProgress < 50) {
          setNarratorText(`⚡ ${stage.label} in progress... Eliminating clinical trial risk...`);
        } else if (stageProgress < 75) {
          setNarratorText(`🔥 ${stage.label} processing... Converting uncertainty to validated assets...`);
        } else if (stageProgress < 100) {
          setNarratorText(`✨ ${stage.label} completing... Savings: $${(stage.savings / 1000000).toFixed(0)}M...`);
        }

        if (stageProgress >= 100) {
          // Stage complete - advance to next
          setCompletedStages(prev => [...prev, currentStage]);
          setStageResults(prev => ({
            ...prev,
            [stage.id]: stage.demoData
          }));
          setTotalSavings(stage.savings);
          
          if (currentStage < stages.length - 1) {
            setCurrentStage(prev => prev + 1);
            setProgress(0);
            setNarratorText(`💰 ${stage.label} COMPLETE! $${(stage.savings / 1000000).toFixed(0)}M in failures avoided. Advancing...`);
          } else {
            // All stages complete!
            setIsRunning(false);
            setNarratorText(completeNarratorText || '🎯 VALIDATION CAMPAIGN COMPLETE!');
          }
        }
      }, 100);
    }

    return () => clearInterval(timer);
  }, [isRunning, isPaused, currentStage, stages, completeNarratorText]);

  const start = () => {
    setIsRunning(true);
    setIsPaused(false);
    setCurrentStage(0);
    setCompletedStages([]);
    setStageResults({});
    setProgress(0);
    setElapsedTime(0);
    setTotalSavings(0);
    setNarratorText(startNarratorText || initialNarratorText);
  };

  const pause = () => {
    setIsPaused(!isPaused);
    setNarratorText(isPaused ? '▶️ Resuming validation campaign...' : '⏸️ Campaign paused');
  };

  const reset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStage(0);
    setCompletedStages([]);
    setStageResults({});
    setProgress(0);
    setElapsedTime(0);
    setTotalSavings(0);
    setNarratorText(initialNarratorText);
  };

  return {
    currentStage,
    isRunning,
    isPaused,
    completedStages,
    stageResults,
    progress,
    narratorText,
    setNarratorText,
    elapsedTime,
    totalSavings,
    start,
    pause,
    reset
  };
}



